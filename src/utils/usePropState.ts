import { useState, useEffect } from 'react'

export function usePropsState<S>(
  defaultValue: S,
  prop?: S
): [S, React.Dispatch<React.SetStateAction<S>>] {
  const [state, setState] = useState<S>(() => prop || defaultValue)

  useEffect(() => {
    if (prop) setState(prop)
  }, [prop, setState])

  return [state, setState]
}

export default usePropsState
