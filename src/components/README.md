# Components

## Purpose

Reusable UI components that can be used across multiple pages and features. Components should be presentational, focused on how things look and feel.

## Naming Conventions

- Use **PascalCase** for component file names (e.g., `Button.jsx`, `Card.jsx`, `Modal.jsx`)
- One component per file
- Component file name should match the component's export name

## File Structure

```
components/
├── Button.jsx
├── Card.jsx
├── Input.jsx
├── Modal.jsx
└── index.js (optional - for barrel exports)
```

## Examples

### Basic Component

```jsx
// Button.jsx
function Button({ children, variant = 'primary', ...props }) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  )
}

export default Button
```

### Using Components

```jsx
// In a page or another component
import Button from '../components/Button.jsx'

function HomePage() {
  return (
    <div>
      <Button variant="primary">Click Me</Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  )
}
```

## Best Practices

1. **Keep components focused** - Each component should do one thing well
2. **Make components reusable** - Pass data via props, don't hardcode values
3. **Use prop destructuring** - Makes components more readable
4. **Export as default** - For easier imports
5. **Add prop validation** - Use TypeScript or prop-types for large projects
6. **Keep styling in Tailwind** - Use Tailwind classes instead of inline styles
7. **Document complex components** - Add comments explaining logic

## Avoid

- ❌ Business logic in components (move to hooks or services)
- ❌ Direct API calls (move to services)
- ❌ Hard-coded strings (use constants or pass as props)
- ❌ Overly complex components (split into smaller components)
