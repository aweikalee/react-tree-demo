import { db, n } from './db'
import { NodeId } from '../components/Tree'

export function createPromise<T>(data: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, 500)
  })
}

const api = {
  data() {
    return createPromise(db)
  },
  more(pid: NodeId, limit: number = 10) {
    return createPromise(new Array(limit).fill(true).map(() => n({ pid })))
  },
}

export default api
