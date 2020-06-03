import React, { useCallback, useMemo } from 'react'
import {
  TreeProps,
  TreeContext as ITreeContext,
  Checked,
  Expanded,
  CheckedState,
  NodeId,
  TreeNodeElement,
} from './types'
import {
  filterChildren,
  indexOfChild,
  getChildren,
  getParents,
  inferChecked,
  createNearestChildrenMap,
  setExpandedMap,
  setCheckedMap,
} from './utils'
import { useStateRef } from '../../utils'

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
  ISetState & {
    children: TreeNodeElement[]
    toNearestChildren: ReturnType<typeof createNearestChildrenMap>
  }

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
    children,
    toNearestChildren,
  } = props

  const checkedRef = useStateRef(checked)
  const disabledRef = useStateRef(disabled)
  const expandedRef = useStateRef(expanded)

  const onCheckedRef = useStateRef(onChecked)
  const onExpandedRef = useStateRef(onExpanded)
  const onNodeCheckedRef = useStateRef(onNodeChecked)
  const onNodeExpandedRef = useStateRef(onNodeExpanded)

  const childrenRef = useStateRef(children)
  const toNearestChildrenRef = useStateRef(toNearestChildren)

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
      const expanded = expandedRef.current
      const onExpanded = onExpandedRef.current
      const onNodeExpanded = onNodeExpandedRef.current

      const newExpanded = { ...expanded }
      setExpandedMap(newExpanded, id, newExpanded[id] !== true)
      onNodeExpanded?.(id, newExpanded[id])
      setExpandedState(newExpanded)
      onExpanded?.(newExpanded, expanded)
    },
    [expandedRef, onNodeExpandedRef, onExpandedRef, setExpandedState]
  )

  const toggleChecked: ITreeContext['toggleChecked'] = useCallback(
    (id) => {
      const children = childrenRef.current
      const toNearestChildren = toNearestChildrenRef.current
      const checked = checkedRef.current
      const disabled = disabledRef.current
      const onChecked = onCheckedRef.current
      const onNodeChecked = onNodeCheckedRef.current
      const isDisabled = (id: NodeId) => disabled[id] === true

      if (isDisabled(id)) return
      const index = indexOfChild(id, children)
      if (index === -1) return

      const newChecked = { ...checked }

      // 自身状态
      const newCheckState: CheckedState = checked[id] === 2 ? 0 : 2
      setCheckedMap(newChecked, id, newCheckState)
      onNodeChecked?.(id, 2)

      // 子项状态
      const theChildren = getChildren(id, children)
      filterChildren(
        theChildren,
        (child) => !isDisabled(child.props.nodeId),
        (child) => !isDisabled(child.props.nodeId)
      ).forEach((child) => {
        const id = child.props.nodeId
        if (isDisabled(id)) return
        setCheckedMap(newChecked, id, newCheckState)
        onNodeChecked?.(id, 2)
      })

      // 父项状态
      const theParents = getParents(id, children)
      for (let i = 0; i < theParents.length; i += 1) {
        const parent = theParents[i]
        const id = parent.props.nodeId
        if (isDisabled(id)) break

        const nearestChildren = toNearestChildren
          .get(id)
          ?.filter((child) => !isDisabled(child.props.nodeId))
        const oldState = newChecked[id] || 0
        const state = inferChecked(newChecked, nearestChildren || [])
        if (state === undefined || oldState === state) break

        setCheckedMap(newChecked, id, state)
        onNodeChecked?.(id, state)
      }

      setCheckedState(newChecked)
      onChecked?.(newChecked, checked)
    },
    [
      childrenRef,
      toNearestChildrenRef,
      checkedRef,
      disabledRef,
      onCheckedRef,
      onNodeCheckedRef,
      setCheckedState,
    ]
  )

  const isExpandable = useCallback(
    (id: NodeId) => {
      const index: number = indexOfChild(id, children)
      if (index === -1) return false
      const cur = children[index]
      const _children = React.Children.toArray(cur.props.children)
      if (_children.some((v) => v)) return true
      const next = children[index + 1]
      if (!next) return false
      return cur.props.level! < next.props.level!
    },
    [children]
  )

  const context: ITreeContext = useMemo(
    () => ({
      getCheckedState,
      isDisabled,
      isExpanded,
      toggleExpanded,
      toggleChecked,
      isExpandable,
    }),
    [
      getCheckedState,
      isDisabled,
      isExpanded,
      toggleExpanded,
      toggleChecked,
      isExpandable,
    ]
  )

  return context
}
export default useTreeContext
