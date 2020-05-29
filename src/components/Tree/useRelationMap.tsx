import React, { useMemo } from 'react'
import { isTreeNode } from './TreeNode'
import { NodeId, TreeNodeProps } from './types'

export type IToChildren = Map<NodeId, NodeId[]>
export type IToParent = Map<NodeId, NodeId>

/**
 * 建立父子关系索引表
 * toChildren.get(id) 返回子项 id 的数组
 * toParent.get(id) 返回父项 id
 * @param children
 */
export function useRelationMap(children: React.ReactNode) {
  return useMemo(() => {
    const toChildren: IToChildren = new Map()
    const toParent: IToParent = new Map()
    const idSet = new Set<NodeId>()

    const helper = (
      child: React.ReactElement<React.PropsWithChildren<TreeNodeProps>>
    ) => {
      const { nodeId, children } = child.props

      // nodeId 查重
      if (idSet.has(nodeId)) {
        console.error(
          `Encountered two tree node with the same key, \`${nodeId}\`.`
        )
      } else {
        idSet.add(nodeId)
      }

      // 添加索引
      if (!children) return

      const ids: NodeId[] = []
      React.Children.map(children, (v) => {
        if (!isTreeNode(v)) return
        ids.push(v.props.nodeId)
        helper(v)
      })

      toChildren.set(nodeId, ids)
      ids?.forEach((id) => toParent.set(id, nodeId))
    }

    React.Children.map(children, (v) => isTreeNode(v) && helper(v))

    return { toChildren, toParent }
  }, [children])
}

export default useRelationMap

export function getChildIds(parentId: NodeId, toChildren: IToChildren) {
  const res: NodeId[] = []
  const helper = (id: NodeId) => {
    const arr = toChildren.get(id)
    arr?.forEach((v) => {
      res.push(v)
      helper(v)
    })
  }
  helper(parentId)
  return res
}

export function getParentIds(childId: NodeId, toParent: IToParent) {
  const res: NodeId[] = []
  const helper = (id: NodeId) => {
    const p = toParent.get(id)
    if (p !== undefined) {
      res.push(p)
      helper(p)
    }
  }
  helper(childId)
  return res
}
