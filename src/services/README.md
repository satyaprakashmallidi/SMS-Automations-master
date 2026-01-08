# Services

## Purpose

Service modules for external communications including API calls, authentication, and third-party integrations. Services handle business logic that interacts with external systems.

## Naming Conventions

- Use **camelCase** for file names (e.g., `api.js`, `authService.js`, `storageService.js`)
- Name should indicate what service it provides
- One primary service per file

## File Structure

```
services/
├── api.js            # REST API calls
├── auth.js           # Authentication service
└── storage.js        # Local storage service
```

## Examples

### API Service

```jsx
// api.js
const API_BASE_URL = 'https://api.example.com'

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users`)
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

export async function createUser(userData) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
  if (!response.ok) throw new Error('Failed to create user')
  return response.json()
}
```

### Using Services in Hooks

```jsx
// hooks/useUsers.js
import { useState, useEffect } from 'react'
import { fetchUsers } from '../services/api.js'

function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { users, loading, error }
}
```

## Best Practices

1. **Centralize API calls** - All API requests in one place
2. **Handle errors** - Throw meaningful errors
3. **Use environment variables** - Store API URLs in .env files
4. **Validate responses** - Check data before returning
5. **Add retry logic** - For failed requests
6. **Mock for testing** - Services are easy to mock

## Avoid

- ❌ React code in services
- ❌ Direct API calls in components
- ❌ Hard-coded URLs
- ❌ Mixing different service types
