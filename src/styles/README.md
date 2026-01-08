# Styles

## Purpose

Additional CSS and styling files including global styles, theme configurations, and custom CSS that complements Tailwind CSS.

## Naming Conventions

- Use **lowercase-with-hyphens** for file names (e.g., `theme.css`, `animations.css`, `variables.css`)
- Name should indicate what styles are in the file
- Keep CSS organized and modular

## File Structure

```
styles/
├── App.css           # App-specific styles
├── theme.css         # Theme variables and customizations
├── animations.css    # Custom animations
└── utilities.css     # Custom utility classes
```

## Examples

### Theme CSS

```css
/* theme.css */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
  --success-color: #06b6d4;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400;
}
```

### Custom Animations

```css
/* animations.css */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}
```

## Best Practices

1. **Use Tailwind first** - Prefer Tailwind classes over custom CSS
2. **CSS variables** - Store theme colors and spacing in variables
3. **Keep it minimal** - Only add CSS that can't be done with Tailwind
4. **Organize logically** - Group related styles together
5. **Use CSS modules** - For component-specific styles when needed

## Avoid

- ❌ Duplicating Tailwind classes (use Tailwind instead)
- ❌ Global styles that should be scoped
- ❌ Inline styles in components (use Tailwind classes)
- ❌ Magic numbers without explanation
