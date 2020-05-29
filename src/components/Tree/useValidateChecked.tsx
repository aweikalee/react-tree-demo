import React, { useEffect } from 'react'
import { isTreeNode } from './TreeNode'
import { IToChildren } from './useRelationMap'
import { NodeId, Checked, Disabled, CheckedState, TreeProps } from './types'

type ISetState = {
  setCheckedState: React.Dispatch<React.SetStateAction<Checked>>
}
type IRef = {
  checkedRef: React.MutableRefObject<Checked>
  disabledRef: React.MutableRefObject<Disabled>
  onCheckedRef: React.MutableRefObject<TreeProps['onChecked']>
}
export type IValidateCheckedProps = ISetState &
  IRef & {
    children: React.ReactNode
    toChildren: IToChildren
  }

/**
 * 验证父子 checked 的有效性，并更正
 * 触发条件：
 * 1. children 更改
 * 2. active 由 false 变为 true
 * @param active 设为 false 将不进行验证
 * @param props
 */
export function useValidateChecked(
  active: boolean,
  props: IValidateCheckedProps
) {
  const {
    checkedRef,
    disabledRef,
    children,
    toChildren,
    onCheckedRef,
    setCheckedState,
  } = props

  useEffect(() => {
    if (!active) return
    const checked = { ...checkedRef.current }
    const disabled = disabledRef.current

    // 自上而下 将全选的子项设为2
    const queue =
      React.Children.map(children, (v) => {
        if (!isTreeNode(v)) return null
        return v.props.nodeId
      })?.filter((v) => v !== null) || []
    const stack: NodeId[] = []

    while (queue.length) {
      const cur = queue.shift()!
      const childIds = toChildren.get(cur)
      if (!childIds) continue
      if (!disabled[cur]) stack.push(cur)

      childIds.forEach((v) => {
        if (checked[cur] === 2 && !disabled[v]) {
          checked[v] = 2
        }

        queue.push(v)
      })
    }

    // 自下而上 将非全选父项改为0或1
    while (stack.length) {
      const cur = stack.pop()!
      const childIds = toChildren.get(cur)?.filter((v) => !disabled[v])
      if (!(childIds && childIds.length)) continue

      let state: CheckedState = 1

      if (childIds.every((v) => checked[v] === 2)) {
        state = 2
      } else if (childIds.every((v) => !checked[v])) {
        state = 0
      }

      checked[cur] = state

      setCheckedState(checked)
      onCheckedRef.current && onCheckedRef.current(checked, checkedRef.current)
    }
  }, [
    active,
    checkedRef,
    disabledRef,
    children,
    toChildren,
    onCheckedRef,
    setCheckedState,
  ])
}

export default useValidateChecked
