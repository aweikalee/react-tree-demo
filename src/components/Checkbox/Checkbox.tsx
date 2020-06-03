import React from 'react'
import { CheckboxProps } from './types'

import './styles.css'

const Component: React.FC<CheckboxProps> = (props) => {
  const { children, checked = 0, disabled = false, ...other } = props

  return (
    <span
      className="checkbox"
      data-checked={checked}
      data-disabled={disabled}
      {...other}
    ></span>
  )
}

Component.displayName = 'Checkbox'
export default Component
