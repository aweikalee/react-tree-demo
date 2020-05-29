import { useEffect, useRef, useCallback } from 'react'

export function useFirstRun(
  effect: React.EffectCallback,
  deps: React.DependencyList
) {
  const isFirst = useRef(true)
  const effectCallback = useCallback(effect, deps)

  useEffect(() => {
    if (!isFirst.current) return
    isFirst.current = false
    return effectCallback()
  }, [isFirst, effectCallback])
}

export default useFirstRun
