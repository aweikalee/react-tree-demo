import React, { useState, useMemo, useCallback } from 'react'
import { Tree, TreeNode } from './components/Tree'
import api from './mock/api'
import { Data } from './mock/db'
import {
  NodeId,
  TreeProps,
  Checked,
  Disabled,
  Expanded,
} from './components/Tree'
import { useStateRef, useFirstRun } from './utils'

type ILoaded = {
  [key in NodeId]: 0 | 1 | 2
}

type IData = Data & {
  nodeChildren: IData[]
}

function Stage0() {
  const [data, setData] = useState<IData[]>([])

  const [checked, setChecked] = useState<Checked>({})
  const [disabled, setDisabled] = useState<Disabled>({})
  const [expanded, setExpanded] = useState<Expanded>({})
  const [loaded, setLoaded] = useState<
    {
      [key in NodeId]: 0 | 1 | 2
    }
  >({})

  const loadedRef = useStateRef(loaded)

  const init = useCallback(
    (res: Data[]) => {
      const newChecked: Checked = {}
      const newDisabled: Disabled = {}
      const newExpanded: Expanded = {}
      const newLoaded: ILoaded = {}
      res.forEach((node) => {
        const { id, checked, disabled, expanded, loadData } = node
        if (checked) newChecked[id] = 2
        if (disabled) newDisabled[id] = true
        if (expanded) newExpanded[id] = true
        if (loadData) newLoaded[id] = 0
      })
      setChecked((state) => ({ ...state, ...newChecked }))
      setDisabled((state) => ({ ...state, ...newDisabled }))
      setExpanded((state) => ({ ...state, ...newExpanded }))
      setLoaded((state) => ({ ...state, ...newLoaded }))
    },
    [setChecked, setDisabled, setExpanded, setLoaded]
  )

  /* 请求初始数据 */
  useFirstRun(() => {
    api.data().then((res) => {
      init(res)
      setData((state) => insert(state, res))
    })
  }, [init, setData])

  /* 异步数据请求 */
  const onNodeExpanded: TreeProps['onNodeExpanded'] = useCallback(
    async (id, value) => {
      if (!value) return
      const loaded = loadedRef.current[id]
      if (loaded === undefined || loaded > 0) return

      setLoaded((state) => ({ ...state, [id]: 1 }))
      const res = await api.more(id, 10)
      setLoaded((state) => ({ ...state, [id]: 2 }))
      init(res)
      setData((state) => insert(state, res))
    },
    [setData, loadedRef, setLoaded, init]
  )

  const children = useMemo(() => {
    const render = (node: IData) => (
      <TreeNode key={node.id} nodeId={node.id} name={node.name}>
        {node.children}
        {node.nodeChildren.map((v) => render(v))}
        {node.loadData && loaded[node.id] !== 2 && <div>加载中...</div>}
      </TreeNode>
    )
    return data.map((v) => render(v))
  }, [data, loaded])

  return (
    <div>
      {!children.length && <div>加载中...</div>}
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
      <button onClick={() => printChecked(checked, data)}>打印选中</button>
    </div>
  )
}

export default Stage0

/**
 * 将拉取到的数据 按父级插入到数组中
 * @param data
 */
function insert(arr: IData[], data: Data[]): IData[] {
  const res: IData[] = JSON.parse(JSON.stringify(arr))
  data.forEach((v) => {
    const child: IData = { ...v, nodeChildren: [] }
    if (child.pid) {
      const parent = findNode(child.pid, res)
      if (parent) {
        parent.nodeChildren.push(child)
      } else {
        res.push(child)
      }
    } else {
      res.push(child)
    }
  })
  return res
}

function findNode(id: NodeId, data: IData[]): IData | void {
  for (let i = 0; i < data.length; i += 1) {
    const res = findNodeHelper(id, data[i])
    if (res) return res
  }
}

function findNodeHelper(id: NodeId, tree: IData): IData | void {
  if (tree.id === id) return tree
  const children = tree.nodeChildren
  if (children) {
    for (let i = 0; i < children.length; i += 1) {
      const res = findNodeHelper(id, children[i])
      if (res) return res
    }
  }
}

function printChecked(checked: Checked, data: IData[]) {
  const res: IData[] = []
  for (const id in checked) {
    // 只输出全选状态的节点
    if (checked[id] !== 2) continue
    const node = findNode(id, data)
    if (node) res.push(node)
  }
  console.log(res)
}
