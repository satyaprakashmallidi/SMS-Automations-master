# Pages

## Purpose

Page-level components that represent entire routes in your application. Each file typically maps to a URL route and can compose multiple reusable components.

## Naming Conventions

- Use **PascalCase** for page file names (e.g., `HomePage.jsx`, `DashboardPage.jsx`)
- Name should indicate what page it is
- Add "Page" suffix for clarity (e.g., `SettingsPage.jsx`)
- One page per file

## File Structure

```
pages/
├── HomePage.jsx
├── DashboardPage.jsx
├── SettingsPage.jsx
└── NotFoundPage.jsx
```

## Examples

### Basic Page

```jsx
// HomePage.jsx
import Button from '../components/Button.jsx'

function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome</h1>
      <p className="text-lg text-gray-600 mb-6">
        This is the home page of our application.
      </p>
      <Button>Get Started</Button>
    </div>
  )
}

export default HomePage
```

## Best Practices

1. **Use components** - Pages should be composed of reusable components
2. **Handle layout** - Pages can define main layout structure
3. **Manage page state** - Use hooks for page-level state
4. **Fetch data** - Pages can fetch data for their content
5. **Pass data to components** - Components receive data via props

## Avoid

- ❌ Duplicate component logic (create reusable components instead)
- ❌ Complex logic in pages (move to hooks)
- ❌ Direct DOM manipulation (use React patterns)
- ❌ Inline styles (use Tailwind classes)
