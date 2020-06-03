import { NodeId } from '../components/Tree'

export interface Data {
  id: NodeId
  pid: NodeId | null
  name: React.ReactNode
  children?: React.ReactNode[]
  checked?: boolean
  disabled?: boolean
  expanded?: boolean
  loadData?: boolean
}

let count = 0
export function n(options: Partial<Data> = {}) {
  const id = count++
  const res: Data = {
    ...options,
    id: `${options.id ? options.id : id}`,
    pid: options.pid ? options.pid : null,
    name: `${options.name || '节点'} ${id}`,
  }
  return res
}

export const db = [
  n({ name: '异步', loadData: true }),
  n({ name: '禁用', disabled: true }),
  n({ name: '父节点 默认勾选', checked: true }),
  n({ name: '子节点 默认勾选' }),
  n({ name: '多级' }),
]
let pid = db[1].id
db.push(n({ pid, disabled: true }), n({ pid }))

pid = db[2].id
db.push(n({ pid }), n({ pid }))

pid = db[3].id
db.push(n({ pid, checked: true }), n({ pid }))
;(() => {
  let queue: Data[] = [db[4]]
  for (let i = 0; i < 4; i += 1) {
    const newQueue: Data[] = []
    while (queue.length) {
      const cur = queue.shift()!
      const pid = cur.id
      const children = [n({ pid }), n({ pid, disabled: true })]
      newQueue.push(...children)
      db.push(...children)
    }
    queue = newQueue
  }
})()

export default db
