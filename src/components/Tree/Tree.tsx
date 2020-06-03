import React, { useMemo } from 'react'
import { Checked, Disabled, Expanded, TreeProps } from './types'
import { TreeContext, useTreeContext } from './useTreeContext'
import { useValidateChecked } from './useValidateChecked'
import {
  flatChildren as flat,
  filterChildren,
  createNearestChildrenMap,
} from './utils'
import { usePropsState } from '../../utils'

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

  const flatChildren = useMemo(() => flat(children), [children])
  const toNearestChildren = useMemo(
    () => createNearestChildrenMap(flatChildren),
    [flatChildren]
  )

  /* 验证 checked 有效性 */
  useValidateChecked(validateChecked, {
    checked,
    disabled,
    onChecked,
    setCheckedState,
    children: flatChildren,
    toNearestChildren,
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

    children: flatChildren,
    toNearestChildren,
  })

  /* 筛选未被展开的子项 */
  const visiabledChildren = useMemo(() => {
    return filterChildren(flatChildren, (child) => {
      return expanded[child.props.nodeId] || false
    })
  }, [expanded, flatChildren])

  return (
    <TreeContext.Provider value={context}>
      <div>{visiabledChildren}</div>
    </TreeContext.Provider>
  )
}

Component.displayName = 'Tree'
export default Component
