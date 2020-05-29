import React, { useState, useMemo, useCallback } from 'react'
import { Tree, TreeNode } from './components/Tree'
import api, { Data } from './mock/api'
import { mapTreeNode, findNode } from './mock/utils'
import {
  NodeId,
  TreeProps,
  Checked,
  Disabled,
  Expanded,
} from './components/Tree'
import { useStateRef, useFirstRun } from './utils'

type LoadMore = {
  [key in NodeId]: typeof api.getDataChildren
}

function App() {
  const [data, setData] = useState<Data[]>([])

  const [checked, setChecked] = useState<Checked>({})
  const [disabled, setDisabled] = useState<Disabled>({})
  const [expanded, setExpanded] = useState<Expanded>({})
  const [loadApi, setLoadApi] = useState<LoadMore>({})
  const [loaded, setLoaded] = useState<Checked>({})
  const checkedRef = useStateRef(checked)
  const disabledRef = useStateRef(disabled)
  const expandedRef = useStateRef(expanded)
  const loadApiRef = useStateRef(loadApi)
  const loadedRef = useStateRef(loaded)

  const initDataState = useCallback(
    (res: Data[]) => {
      const newChecked: Checked = { ...checkedRef.current }
      const newDisabled: Disabled = { ...disabledRef.current }
      const newExpanded: Expanded = { ...expandedRef.current }
      const newLoadApi: LoadMore = { ...loadApiRef.current }
      res.map((v) =>
        mapTreeNode(v, (node) => {
          const { nodeId, checked, disabled, expanded, loadData } = node
          if (checked) newChecked[nodeId] = 2
          if (disabled) newDisabled[nodeId] = true
          if (expanded) newExpanded[nodeId] = true
          if (loadData) newLoadApi[nodeId] = api.getDataChildren
        })
      )
      setChecked(newChecked)
      setDisabled(newDisabled)
      setExpanded(newExpanded)
      setLoadApi(newLoadApi)
    },
    [
      setChecked,
      setDisabled,
      setExpanded,
      setLoadApi,
      checkedRef,
      disabledRef,
      expandedRef,
      loadApiRef,
    ]
  )

  /* 请求初始数据 */
  useFirstRun(() => {
    api.getInitData().then((res) => {
      initDataState(res)
      setData(res)
    })
  }, [initDataState, setData])

  /* 异步数据请求 */
  const onNodeExpanded: TreeProps['onNodeExpanded'] = useCallback(
    async (id, value) => {
      if (!value) return
      if (!loadApi[id]) return
      if (loadedRef.current[id] > 0) return

      setLoaded((loaded) => ({ ...loaded, [id]: 1 }))
      const res = await loadApi[id](10)
      setLoaded((loaded) => ({ ...loaded, [id]: 2 }))

      initDataState(res)

      const node = findNode(id, data)
      if (node) {
        const children = node.children ? node.children.slice() : []
        node.children = children.concat(res)
      }
      setData(data.slice())
    },
    [data, setData, loadedRef, loadApi, setLoaded, initDataState]
  )

  const children = useMemo(() => {
    return data.map((v) => renderTree(v))
  }, [data])

  return (
    <div>
      <button onClick={() => printChecked(checked, data)}>打印选中</button>
      <Tree
        checked={checked}
        disabled={disabled}
        expanded={expanded}
        onChecked={setChecked}
        onExpanded={setExpanded}
        onNodeExpanded={onNodeExpanded}
      >
        {children}
      </Tree>
    </div>
  )
}

export default App

function renderTree(node: Data) {
  return (
    <TreeNode key={node.nodeId} nodeId={node.nodeId} name={node.name}>
      {node.children
        ? node.children.map((v) => renderTree(v))
        : node.loadData && <div>...</div>}
    </TreeNode>
  )
}

function printChecked(checked: Checked, data: Data[]) {
  const res: Data[] = []
  for (const id in checked) {
    // 只输出全选状态的节点
    if (checked[id] !== 2) continue
    const node = findNode(id, data)
    if (node) res.push(node)
  }
  console.log(res)
}
