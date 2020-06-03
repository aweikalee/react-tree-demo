export type CheckedState = 0 | 1 | 2 // 0不选, 1半选, 2全选

export interface CheckboxProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: CheckedState
  disabled?: boolean
}
