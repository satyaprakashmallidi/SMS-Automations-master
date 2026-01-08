# Utils

## Purpose

Pure utility functions that don't depend on React. These are helper functions for common tasks like formatting, validation, and data manipulation.

## Naming Conventions

- Use **camelCase** for file names (e.g., `formatters.js`, `validators.js`, `helpers.js`)
- Group related utilities in the same file or create separate files
- File name should indicate what utilities it contains

## File Structure

```
utils/
├── formatters.js     # Format dates, numbers, strings
├── validators.js     # Validation functions
├── constants.js      # Application constants
└── helpers.js        # Generic helper functions
```

## Examples

### Utilities File

```jsx
// formatters.js
export function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function truncateString(str, length) {
  return str.length > length ? str.substring(0, length) + '...' : str
}
```

### Using Utilities

```jsx
import { formatDate, formatCurrency } from '../utils/formatters.js'

function OrderItem({ order }) {
  return (
    <div>
      <p>Date: {formatDate(order.date)}</p>
      <p>Total: {formatCurrency(order.total)}</p>
    </div>
  )
}
```

## Best Practices

1. **Keep functions pure** - Same input = same output, no side effects
2. **Export named functions** - Makes it clear what's available
3. **Add JSDoc comments** - Document what the function does
4. **Group related utilities** - Keep similar functions together
5. **Use descriptive names** - Function names should explain their purpose

## Avoid

- ❌ Side effects in utilities
- ❌ React dependencies (use hooks instead)
- ❌ Complex business logic (move to services)
- ❌ Global state manipulation
