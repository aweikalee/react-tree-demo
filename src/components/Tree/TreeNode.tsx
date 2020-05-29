import React, { useContext } from 'react'
import { TreeContext } from './useTreeContext'
import { TreeNodeProps } from './types'

const Component: React.FC<TreeNodeProps> = (props) => {
  const { nodeId, name, children } = props

  const {
    getCheckedState,
    isDisabled,
    isExpanded,
    toggleExpanded,
    toggleChecked,
  } = useContext(TreeContext)

  const checked = getCheckedState ? getCheckedState(nodeId) : 0
  const disabled = isDisabled ? isDisabled(nodeId) : false
  const expanded = isExpanded ? isExpanded(nodeId) : false

  const expandButton = React.Children.count(children) > 0 && (
    <button onClick={() => toggleExpanded && toggleExpanded(nodeId)}>
      {expanded ? '-' : '+'}
    </button>
  )

  const checkbox = !true ? null : (
    <input
      type="checkbox"
      checked={checked === 2}
      className={checked === 1 ? 'half-check' : undefined}
      disabled={disabled}
      onChange={() => toggleChecked && toggleChecked(nodeId)}
    />
  )

  return (
    <div className="tree-node">
      {expandButton}
      {checkbox}
      {name}
      {expanded && children}
    </div>
  )
}

Component.displayName = 'TreeNode'
export default Component

export function isTreeNode(
  child: React.ReactNode
): child is React.ReactElement<React.PropsWithChildren<TreeNodeProps>> {
  return React.isValidElement(child) && child.type === Component
}
