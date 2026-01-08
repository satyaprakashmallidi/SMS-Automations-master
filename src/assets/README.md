# Assets

## Purpose

Static assets including images, fonts, icons, and other media files used throughout the application.

## Naming Conventions

- Use **lowercase-with-hyphens** for file names (e.g., `logo-light.svg`, `icon-menu.svg`)
- Organize by asset type: `images/`, `icons/`, `fonts/`
- Use descriptive names indicating what the asset is

## File Structure

```
assets/
├── images/
│   ├── logo.svg
│   └── banner.png
├── icons/
│   ├── menu.svg
│   ├── close.svg
│   └── settings.svg
└── fonts/
    └── custom-font.ttf
```

## Examples

### Using Assets in Components

```jsx
// In a component
import logo from '../assets/images/logo.svg'
import menuIcon from '../assets/icons/menu.svg'

function Header() {
  return (
    <header>
      <img src={logo} alt="Logo" className="w-10 h-10" />
      <img src={menuIcon} alt="Menu" className="w-6 h-6" />
    </header>
  )
}
```

## Best Practices

1. **Optimize images** - Use appropriate formats (SVG for icons, WebP for photos)
2. **Add alt text** - Always add descriptive alt text to images
3. **Keep sizes small** - Compress images before adding
4. **Organize by type** - Group similar assets together
5. **Use descriptive names** - File names should indicate content

## Avoid

- ❌ Large unoptimized images
- ❌ Missing alt text
- ❌ Storing code in assets
- ❌ Overly nested folder structures
