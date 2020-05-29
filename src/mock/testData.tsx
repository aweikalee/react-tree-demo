import { Data } from './api'

export type MockData = {
  [K in keyof Data]?: K extends 'children' ? MockData[] : Data[K]
}

const data: MockData[] = [
  {
    name: '测试',
    expanded: true,
    children: [
      { name: '异步', loadData: true },
      { name: '禁用', disabled: true, children: [{ disabled: true }, {}] },
      {
        name: '父节点 默认勾选',
        checked: true,
        children: [{}, {}],
      },
      {
        name: '子节点 默认勾选',
        children: [{ checked: true }, {}],
      },
      {
        name: '多级',
        children: [
          { children: [{ children: [{}, {}] }, { children: [{}, {}] }] },
          { children: [{ children: [{}, {}] }, { children: [{}, {}] }] },
        ],
      },
    ],
  },
]

export default data
