import React from 'react'
import {
  NodeId,
  TreeNodeElement,
  Checked,
  CheckedState,
  Expanded,
  ExpandedState,
} from './types'
import { isTreeNode } from './TreeNode'

/**
 * 将树状图展开成一维数组
 * @param children
 */
export function flatChildren(children: React.ReactNode) {
  const res: TreeNodeElement[] = []
  const idSet = new Set<NodeId>()
  const helper = (child: React.ReactNode, level: number) => {
    if (!isTreeNode(child)) return
    const { nodeId, level: oldLevel, children } = child.props

    /* nodeId 查重 */
    if (idSet.has(nodeId)) {
      console.error(
        `Encountered two tree node with the same nodeId, \`${nodeId}\`.`
      )
    }
    idSet.add(nodeId)

    const treeNodes: React.ReactNode[] = []
    const otherNodes: React.ReactNode[] = []
    React.Children.map(children, (child) => {
      if (isTreeNode(child)) {
        treeNodes.push(child)
      } else {
        otherNodes.push(child)
      }
    })

    const newLevel =
      oldLevel === undefined || oldLevel < level ? level : oldLevel
    res.push(
      React.cloneElement(child, {
        children: otherNodes,
        level: newLevel,
      })
    )
    treeNodes.forEach((v) => helper(v, newLevel + 1))
  }
  React.Children.map(children, (child) => helper(child, 0))
  return res
}

export function popEmpty(stack: any[]) {
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    if (stack[i] === undefined) {
      stack.pop()
    } else {
      break
    }
  }
}

/**
 * 创建 最近子项索引
 * @param children
 */
export function createNearestChildrenMap(children: TreeNodeElement[]) {
  const res = new Map<NodeId, TreeNodeElement[]>()
  const stack: NodeId[] = []

  for (let i = 0; i < children.length; i += 1) {
    const cur = children[i]
    const id = cur.props.nodeId
    const level = cur.props.level!
    if (stack.length > level) {
      stack.splice(level)
      popEmpty(stack)
    }
    const parentId = stack[stack.length - 1]

    if (parentId !== undefined) {
      const arr = res.get(parentId) || []
      arr.push(cur)
      res.set(parentId, arr)
    }
    stack[level] = id
  }

  return res
}

/**
 * 过滤
 * @param children
 * @param parentsCondition 父节点需要满足的条件
 * @param selfCondition 节点本身需要满足的条件
 */
export function filterChildren(
  children: TreeNodeElement[],
  parentsCondition: (child: TreeNodeElement, index: number) => boolean,
  selfCondition: (child: TreeNodeElement, index: number) => boolean = () => true
) {
  const stack: boolean[] = []
  return children.filter((child, index) => {
    const level = child.props.level!
    if (stack.length > level) stack.splice(level)
    const condition1 = !stack.includes(false)
    const condition2 = selfCondition(child, index)
    stack[level] = parentsCondition(child, index)
    return condition1 && condition2
  })
}

/**
 * 获得节点在数组中的下标
 * @param id
 * @param children
 */
export function indexOfChild(id: NodeId, children: TreeNodeElement[]) {
  let index: number = -1
  for (let i = 0; i < children.length; i += 1) {
    if (children[i].props.nodeId === id) {
      index = i
      break
    }
  }
  return index
}

/**
 * 获得所有子节点
 * @param id
 * @param children
 */
export function getChildren(id: NodeId, children: TreeNodeElement[]) {
  const index = indexOfChild(id, children)
  const res: TreeNodeElement[] = []
  if (index === -1) return res

  const level = children[index].props.level!
  for (let i = index + 1; i < children.length; i += 1) {
    const cur = children[i]
    if (cur.props.level! <= level) break
    res.push(cur)
  }

  return res
}

/**
 * 获得所有父节点
 * 离得越近的父节点，越早push进数组
 * @param id
 * @param children
 */
export function getParents(id: NodeId, children: TreeNodeElement[]) {
  const index = indexOfChild(id, children)
  const res: TreeNodeElement[] = []
  if (index === -1) return res

  let level = children[index].props.level!
  for (let i = index - 1; i >= 0; i -= 1) {
    const cur = children[i]
    const _level = cur.props.level!
    if (_level < level) {
      res.push(cur)
      level = _level
    }
    if (_level === 0) break
  }

  return res
}

/**
 * 根据子节点 推断父节点的 checked
 * 返回 undefined 时则表示没有子节点 无法推断
 * @param checked
 * @param children
 */
export function inferChecked(checked: Checked, children: TreeNodeElement[]) {
  let state: CheckedState | void
  if (children.length) {
    let hasState0 = false
    let hasState2 = false
    for (let i = 0; i < children.length; i += 1) {
      const cur = children[i]
      switch (checked[cur.props.nodeId]) {
        case 0:
          hasState0 = true
          break
        case 1:
          hasState0 = hasState2 = true
          break
        case 2:
          hasState2 = true
          break
        default:
          hasState0 = true
      }
      if (hasState0 && hasState2) break
    }
    if (hasState0 && hasState2) {
      state = 1
    } else if (hasState0 && !hasState2) {
      state = 0
    } else if (!hasState0 && hasState2) {
      state = 2
    }
  }

  return state
}

export function setCheckedMap(
  map: Checked,
  key: keyof Checked,
  value: CheckedState
) {
  if (value === 0) {
    delete map[key]
  } else {
    map[key] = value
  }
}

export function setExpandedMap(
  map: Expanded,
  key: keyof Expanded,
  value: ExpandedState
) {
  if (value === true) {
    map[key] = value
  } else {
    delete map[key]
  }
}
