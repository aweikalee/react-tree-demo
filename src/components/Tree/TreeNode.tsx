import React, { useContext } from 'react'
import { Checkbox } from '../Checkbox'
import { TreeContext } from './useTreeContext'
import { TreeNodeProps } from './types'

const Component: React.FC<TreeNodeProps> = (props) => {
  const { nodeId, name, level = 0, children, ...other } = props

  const {
    getCheckedState,
    isDisabled,
    isExpanded,
    toggleExpanded,
    toggleChecked,
    isExpandable,
  } = useContext(TreeContext)

  const checked = getCheckedState ? getCheckedState(nodeId) : 0
  const disabled = isDisabled ? isDisabled(nodeId) : false
  const expandable = isExpandable ? isExpandable(nodeId) : false
  const expanded = isExpanded && expandable ? isExpanded(nodeId) : false

  /* 缩进 */
  const indent = (
    <div className="tree-node-indent">
      {new Array(level).fill(true).map((v, index) => (
        <span className="tree-node-indent__unit" key={index}></span>
      ))}
    </div>
  )

  /* 展开按钮 */
  const expandButton = expandable ? (
    <div
      className="tree-node-expand"
      data-expanded={expanded}
      onClick={() => toggleExpanded && toggleExpanded(nodeId)}
    >
      <svg
        className="tree-node-expand__icon"
        viewBox="0 0 1024 1024"
        focusable="false"
        data-icon="caret-down"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
      </svg>
    </div>
  ) : (
    <div className="tree-node-expand-placeholer"></div>
  )

  /* 复选框 */
  const checkbox = false ? null : (
    <div className="tree-node-checkbox">
      <Checkbox
        checked={checked}
        disabled={disabled}
        onClick={() => toggleChecked && toggleChecked(nodeId)}
      />
    </div>
  )

  return (
    <div className="tree-node" {...other}>
      {indent}
      {expandButton}
      {checkbox}

      <div className="tree-node-content">
        <div className="tree-node-name">{name}</div>
        {expanded && children}
      </div>
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
