import { NodeId } from '../components/Tree'
import { createNode, createPromise } from './utils'
import testData, { MockData } from './testData'

export interface Data {
  name: React.ReactNode
  nodeId: NodeId
  children?: Data[]
  checked?: boolean
  disabled?: boolean
  expanded?: boolean
  loadData?: boolean
}

const api = {
  getInitData() {
    const _createNode = (node: MockData) => {
      const { children, ...other } = node
      const opt: Partial<Data> = { ...other }
      if (children) {
        opt.children = children.map<Data>((v) => _createNode(v))
      }
      return createNode(opt)
    }

    return createPromise(testData.map((v) => _createNode(v)))
  },
  getDataChildren(limit: number = 10) {
    const res: Data[] = []
    for (let i = 0; i < limit; i += 1) {
      res.push(createNode())
    }
    return createPromise(res)
  },
}

export default api
