import React, { useEffect } from 'react'
import {
  createNearestChildrenMap,
  inferChecked,
  filterChildren,
  setCheckedMap,
  popEmpty,
} from './utils'
import { Checked, Disabled, TreeProps, TreeNodeElement } from './types'
import { useStateRef } from '../../utils'

export type IValidateCheckedProps = {
  checked: Checked
  disabled: Disabled
  onChecked: TreeProps['onChecked']
  setCheckedState: React.Dispatch<React.SetStateAction<Checked>>
  children: TreeNodeElement[]
  toNearestChildren: ReturnType<typeof createNearestChildrenMap>
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
    checked,
    disabled,
    onChecked,
    setCheckedState,
    children,
    toNearestChildren,
  } = props

  const checkedRef = useStateRef(checked)
  const disabledRef = useStateRef(disabled)
  const onCheckedRef = useStateRef(onChecked)

  useEffect(() => {
    if (!active) return
    const newChecked = { ...checkedRef.current }
    const disabled = disabledRef.current
    const onChecked = onCheckedRef.current

    // 自上而下 将全选的子项设为2
    const queue = filterChildren(
      children,
      (child) => !disabled[child.props.nodeId],
      (child) => !disabled[child.props.nodeId]
    )
    const stack: TreeNodeElement[] = []
    for (let i = 0; i < queue.length; i += 1) {
      const cur = queue[i]
      const id = cur.props.nodeId
      const level = cur.props.level!
      if (stack.length > level) {
        stack.splice(level)
        popEmpty(stack)
      }
      const parent = stack[stack.length - 1]

      if (parent !== undefined) {
        const pid = parent.props.nodeId
        if (newChecked[pid] === 2) setCheckedMap(newChecked, id, 2)
      }
      stack[level] = cur
    }

    // 自下而上 将非全选父项改为0或1
    toNearestChildren.forEach((nearestChildren, pid) => {
      const children = nearestChildren.filter((v) => !disabled[v.props.nodeId])
      if (!(children && children.length)) return
      const state = inferChecked(newChecked, children)
      if (state !== undefined) setCheckedMap(newChecked, pid, state)
    })

    setCheckedState(newChecked)
    onChecked?.(newChecked, checkedRef.current)
  }, [
    active,
    children,
    toNearestChildren,
    checkedRef,
    disabledRef,
    onCheckedRef,
    setCheckedState,
  ])
}

export default useValidateChecked
