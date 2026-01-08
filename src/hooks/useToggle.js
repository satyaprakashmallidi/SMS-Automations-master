/**
 * useToggle Hook
 * A simple hook for toggling boolean state
 *
 * @param {boolean} initialValue - Initial value of the toggle (default: false)
 * @returns {Object} Object containing the current value and methods to change it
 *
 * @example
 * const { value, toggle, setTrue, setFalse } = useToggle(false)
 * // Use in component:
 * // <button onClick={toggle}>Toggle</button>
 */

import { useState } from 'react'

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  /**
   * Toggle the boolean value
   */
  const toggle = () => setValue(prev => !prev)

  /**
   * Set value to true
   */
  const setTrue = () => setValue(true)

  /**
   * Set value to false
   */
  const setFalse = () => setValue(false)

  return { value, toggle, setTrue, setFalse }
}

export default useToggle
