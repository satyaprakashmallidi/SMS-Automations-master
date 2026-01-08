# Hooks

## Purpose

Custom React hooks containing reusable stateful logic. Hooks allow you to extract component logic into reusable functions.

## Naming Conventions

- Use **camelCase** with `use` prefix (e.g., `useAuth.js`, `useFetch.js`, `useForm.js`)
- Name should describe what the hook does
- One hook per file

## File Structure

```
hooks/
├── useAuth.js
├── useFetch.js
├── useLocalStorage.js
└── useToggle.js
```

## Examples

### Basic Hook

```jsx
// useToggle.js
import { useState } from 'react'

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = () => setValue(!value)
  const setTrue = () => setValue(true)
  const setFalse = () => setValue(false)

  return { value, toggle, setTrue, setFalse }
}

export default useToggle
```

### Using a Hook

```jsx
// In a component
import useToggle from '../hooks/useToggle.js'

function Modal() {
  const { value: isOpen, toggle } = useToggle(false)

  return (
    <>
      <button onClick={toggle}>Open Modal</button>
      {isOpen && <div>Modal Content</div>}
    </>
  )
}
```

## Best Practices

1. **Follow the Rules of Hooks** - Only call hooks at top level, not conditionally
2. **Name starts with "use"** - Enables ESLint to check hook rules
3. **One responsibility** - Each hook should do one thing
4. **Return an object or array** - For easy destructuring
5. **Document parameters** - Explain what the hook does and what it expects

## Avoid

- ❌ Calling hooks conditionally
- ❌ Calling hooks from regular functions
- ❌ Complex logic without abstraction
- ❌ Creating too many state variables (consider useReducer)
