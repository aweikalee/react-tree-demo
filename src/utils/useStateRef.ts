import { useEffect, useRef } from 'react'

export function useStateRef<S>(state: S) {
  const ref = useRef<S>(state)

  useEffect(() => {
    ref.current = state
  }, [state, ref])

  return ref
}

export default useStateRef
