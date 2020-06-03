import React, { useState, useMemo } from 'react'
import Stage0 from './Stage0'
import Stage1 from './Stage1'

function App() {
  const buttons = ['嵌套对象生成的树状图', '一维数组生成的树状图']
  const [stage, setStage] = useState(0)
  const [title, setTitle] = useState(buttons[0])
  const showStage = useMemo(() => {
    switch (stage) {
      case 1:
        return <Stage1 />
      default:
        return <Stage0 />
    }
  }, [stage])

  return (
    <div>
      {buttons.map((title, index) => (
        <button
          key={title}
          onClick={() => {
            setStage(index)
            setTitle(title)
          }}
        >
          {title}
        </button>
      ))}
      <div>{title}</div>
      {showStage}
    </div>
  )
}

export default App
