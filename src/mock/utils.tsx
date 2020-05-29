import { Data } from './api'
import { NodeId } from '../components/Tree/types'

let count = 0
export function createNode(options: Partial<Data> = {}) {
  const id = count++
  const res: Data = {
    ...options,
    name: `${options.name || '节点'} ${id}`,
    nodeId: `${id}`,
  }
  return res
}

export function createPromise<T>(data: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, 500)
  })
}

export function mapTreeNode(node: Data, callback: (node: Data) => void) {
  callback(node)
  node.children?.map((v) => mapTreeNode(v, callback))
}

export function findNode(id: NodeId, data: Data[]): Data | void {
  for (let i = 0; i < data.length; i += 1) {
    const res = findNodeHelper(id, data[i])
    if (res) return res
  }
}

export function findNodeHelper(id: NodeId, tree: Data): Data | void {
  if (tree.nodeId === id) return tree
  const children = tree.children
  if (children) {
    for (let i = 0; i < children.length; i += 1) {
      const res = findNodeHelper(id, children[i])
      if (res) return res
    }
  }
}

export function findNodeParents(id: NodeId, tree: Data[]) {
  for (let i = 0; i < tree.length; i += 1) {
    const res = findNodeParentsHelper(id, tree[i])
    if (res) return res
  }
}

export function findNodeParentsHelper(id: NodeId, tree: Data) {
  const parents: Data[] = []
  const helper = (node: Data) => {
    if (node.nodeId === id) return true
    parents.push(node)
    const isChild = node.children?.find((v) => helper(v))
    if (isChild) return true
    parents.pop()
  }
  return helper(tree) ? parents : undefined
}
