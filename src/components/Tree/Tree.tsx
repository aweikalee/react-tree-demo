import React from 'react'
import { Checked, Disabled, Expanded, TreeProps } from './types'
import { TreeContext, useTreeContext } from './useTreeContext'
import { usePropsState, useStateRef } from '../../utils'
import { useRelationMap } from './useRelationMap'
import { useValidateChecked } from './useValidateChecked'

import './styles.css'

const Component: React.FC<TreeProps> = (props) => {
  const {
    checked: checkedProp,
    disabled: disabledProp,
    expanded: expandedProp,
    onChecked,
    onExpanded,
    onNodeChecked,
    onNodeExpanded,
    validateChecked = true,
    children,
  } = props

  const [checked, setCheckedState] = usePropsState<Checked>({}, checkedProp)
  const [disabled] = usePropsState<Disabled>({}, disabledProp)
  const [expanded, setExpandedState] = usePropsState<Expanded>({}, expandedProp)

  const checkedRef = useStateRef(checked)
  const disabledRef = useStateRef(disabled)
  const onCheckedRef = useStateRef(onChecked)

  /* 父子索引 */
  const { toChildren, toParent } = useRelationMap(children)

  /* 验证 checked 有效性 */
  useValidateChecked(validateChecked, {
    checkedRef,
    disabledRef,
    onCheckedRef,
    setCheckedState,
    toChildren,
    children,
  })

  const context = useTreeContext({
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
  })

  return (
    <TreeContext.Provider value={context}>
      <div>{children}</div>
    </TreeContext.Provider>
  )
}

Component.displayName = 'Tree'
export default Component
