import React, { useCallback, useMemo } from 'react'
import { useRelationMap, getChildIds, getParentIds } from './useRelationMap'
import {
  TreeProps,
  TreeContext as ITreeContext,
  Checked,
  Expanded,
  CheckedState,
} from './types'

type IState = 'checked' | 'disabled' | 'expanded'
type IRequire<T extends TreeProps> = {
  [K in IState]: NonNullable<T[K]>
}
type ISetState = {
  setCheckedState: React.Dispatch<React.SetStateAction<Checked>>
  setExpandedState: React.Dispatch<React.SetStateAction<Expanded>>
}
type IProps<T extends TreeProps> = Omit<T, IState> &
  IRequire<T> &
  ISetState &
  ReturnType<typeof useRelationMap>

export type ITreeContextProps = IProps<TreeProps>

export const TreeContext = React.createContext<ITreeContext>({})

export function useTreeContext(props: ITreeContextProps) {
  const {
    checked,
    disabled,
    expanded,
    onChecked,
    onExpanded,
    onNodeChecked,
    onNodeExpanded,

    setCheckedState,
    setExpandedState,

    toChildren,
    toParent,
  } = props

  const getCheckedState: ITreeContext['getCheckedState'] = useCallback(
    (id) => checked[id] || 0,
    [checked]
  )

  const isExpanded: ITreeContext['isExpanded'] = useCallback(
    (id) => expanded[id] === true,
    [expanded]
  )

  const isDisabled: ITreeContext['isDisabled'] = useCallback(
    (id) => disabled[id] === true,
    [disabled]
  )

  const toggleExpanded: ITreeContext['toggleExpanded'] = useCallback(
    (id) => {
      const newExpanded = { ...expanded }
      if (expanded[id] === true) {
        delete newExpanded[id]
      } else {
        newExpanded[id] = true
      }

      onNodeExpanded && onNodeExpanded(id, newExpanded[id])
      setExpandedState(newExpanded)
      onExpanded && onExpanded(newExpanded, expanded)
    },
    [expanded, onNodeExpanded, setExpandedState, onExpanded]
  )

  const toggleChecked: ITreeContext['toggleChecked'] = useCallback(
    (id) => {
      if (isDisabled(id)) return
      const newChecked = { ...checked }
      const children = getChildIds(id, toChildren)
      const parents = getParentIds(id, toParent)

      // 自身状态
      const newCheckState: CheckedState = checked[id] === 2 ? 0 : 2
      newChecked[id] = newCheckState
      onNodeChecked && onNodeChecked(id, 2)

      // 子项状态
      children.forEach((id) => {
        if (isDisabled(id)) return
        newChecked[id] = newCheckState
        onNodeChecked && onNodeChecked(id, 2)
      })

      // 父项状态
      parents.forEach((id) => {
        if (isDisabled(id)) return
        const children = toChildren.get(id)?.filter((v) => !isDisabled(v))

        const oldState = newChecked[id] || 0
        let state: CheckedState = 1

        if (children?.length) {
          if (children.every((v) => newChecked[v] === 2)) {
            state = 2
          } else if (children.every((v) => !newChecked[v])) {
            state = 0
          }
        } else {
          state = oldState
        }

        if (oldState !== state) {
          newChecked[id] = state
          onNodeChecked && onNodeChecked(id, state)
        }
      })

      setCheckedState(newChecked)
      onChecked && onChecked(newChecked, checked)
    },
    [
      checked,
      toChildren,
      toParent,
      onChecked,
      onNodeChecked,
      setCheckedState,
      isDisabled,
    ]
  )

  const context = useMemo(
    () => ({
      getCheckedState,
      isDisabled,
      isExpanded,
      toggleExpanded,
      toggleChecked,
    }),
    [getCheckedState, isDisabled, isExpanded, toggleExpanded, toggleChecked]
  )

  return context
}
export default useTreeContext
