import { CheckedState as CheckedStateBase } from '../Checkbox/types'
export type NodeId = string

export type CheckedState = CheckedStateBase
export type DisabledState = boolean
export type ExpandedState = boolean

type IMap<K extends keyof any, T> = {
  [key in K]: T
}
export type Checked = IMap<NodeId, CheckedState>
export type Disabled = IMap<NodeId, DisabledState>
export type Expanded = IMap<NodeId, ExpandedState>

export interface TreeContext {
  isDisabled?: (id: NodeId) => DisabledState
  isExpanded?: (id: NodeId) => ExpandedState
  isExpandable?: (id: NodeId) => ExpandedState
  getCheckedState?: (id: NodeId) => CheckedState
  toggleExpanded?: (id: NodeId) => void
  toggleChecked?: (id: NodeId) => void
}

export interface TreeProps {
  checked?: Checked
  disabled?: Disabled
  expanded?: Expanded
  onChecked?: (newValue: Checked, oldValue: Checked) => void
  onExpanded?: (newValue: Expanded, oldValue: Expanded) => void
  onNodeChecked?: (id: NodeId, value: CheckedState) => void
  onNodeExpanded?: (id: NodeId, value: ExpandedState) => void
  validateChecked?: boolean
}

export interface TreeNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  nodeId: NodeId
  name: React.ReactNode
  level?: number
}

export type TreeNodeElement = React.ReactElement<
  React.PropsWithChildren<TreeNodeProps>
>
