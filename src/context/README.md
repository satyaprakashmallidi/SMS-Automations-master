# Context

## Purpose

React Context providers for global state management. Use for authentication state, theme, user preferences, and other globally-shared data.

## Naming Conventions

- Use **PascalCase** for context file names (e.g., `AuthContext.jsx`, `ThemeContext.jsx`)
- Name should indicate what the context provides
- Export both the context and the provider component

## File Structure

```
context/
├── AuthContext.jsx
├── ThemeContext.jsx
└── NotificationContext.jsx
```

## Examples

### Basic Context

```jsx
// AuthContext.jsx
import { createContext, useState } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email, password) => {
    setIsLoading(true)
    try {
      // Call authentication service
      const userData = await authenticateUser(email, password)
      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => setUser(null)

  const value = { user, isLoading, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

### Using Context in Components

```jsx
// In a component
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'

function UserProfile() {
  const { user, logout } = useContext(AuthContext)

  return (
    <div>
      <p>Welcome, {user?.user_metadata?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## Best Practices

1. **Use for global state only** - Don't use for frequently changing data
2. **Create custom hooks** - Make `useAuth()` instead of `useContext(AuthContext)`
3. **Split contexts** - Keep different concerns in separate contexts
4. **Use Context with useReducer** - For complex state logic
5. **Memoize context value** - Prevent unnecessary re-renders

## Avoid

- ❌ Using Context for frequently changing data
- ❌ Complex nested providers (split into multiple)
- ❌ Passing objects without memoization
- ❌ Too many different contexts
