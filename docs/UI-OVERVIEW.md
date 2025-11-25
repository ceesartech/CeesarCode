# CeesarCode UI Overview

## Technology Stack

The CeesarCode frontend is built with:

- **React 18** - Component framework
- **Vite** - Build tool and dev server
- **Chakra UI v3** - Component library and theming
- **Monaco Editor** - VS Code-based code editor
- **xterm.js** - Terminal emulator
- **Excalidraw** - System design drawing canvas
- **Framer Motion** - Animations
- **React Icons** - Icon library

## Architecture

### Component Structure

```
src/frontend/src/
├── main.jsx          # Entry point with Chakra Provider
├── App.jsx           # Main application component
├── theme.js          # Chakra UI theme configuration
├── components/
│   ├── index.js      # Component exports
│   ├── AppShell.jsx  # Layout shell and header
│   └── AgentPanel.jsx # AI assistant panel
└── hooks/
    ├── index.js      # Hook exports
    └── useColorMode.js # Color mode hook
```

### Theme System

The application uses a custom Chakra UI theme with:

- **Brand colors**: Blue gradient palette
- **Accent colors**: Purple gradient for highlights
- **Semantic tokens**: Light/dark mode aware colors
- **Custom fonts**: Space Grotesk, Bricolage Grotesque, JetBrains Mono

```javascript
// Example theme tokens
{
  brand: {
    50: '#eff6ff',   // Lightest
    500: '#3b82f6',  // Primary
    900: '#1e3a8a',  // Darkest
  },
  accent: {
    500: '#d946ef',  // Purple accent
  }
}
```

## Layout Structure

### Main Application Shell

```
┌─────────────────────────────────────────────────────────┐
│                      Header (60px)                       │
│  [Logo] [Problems] [Jupyter] [AI Tools]    [Agent] [🌙] │
├──────────────┬──────────────────────────┬───────────────┤
│   Sidebar    │      Main Content        │  Agent Panel  │
│   (280px)    │                          │   (400px)     │
│              │   ┌──────────────────┐   │   (optional)  │
│  Problem     │   │   Monaco Editor  │   │               │
│  List        │   │                  │   │  Pair Prog    │
│              │   └──────────────────┘   │  or           │
│  Search      │   ┌──────────────────┐   │  Sys Design   │
│  Sort        │   │   Terminal       │   │               │
│              │   │   (xterm.js)     │   │               │
│              │   └──────────────────┘   │               │
└──────────────┴──────────────────────────┴───────────────┘
```

### Color Modes

The UI supports both light and dark modes:

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `#FFFFFF` | `#111827` |
| Surface | `#F3F4F6` | `#374151` |
| Text | `#111827` | `#F9FAFB` |
| Border | `#E5E7EB` | `#4B5563` |
| Primary | `#2563EB` | `#3B82F6` |

## Key Components

### Header

The header provides:
- Application logo and branding
- Navigation tabs (Problems, Jupyter, AI Tools)
- Pair Programming agent toggle
- Color mode toggle
- Settings access

### Sidebar

The sidebar includes:
- Problem search with filtering
- Sort controls (name, type)
- Problem list with:
  - Type indicators (coding, system design)
  - Multi-part badges
  - Delete confirmation

### Code Editor (Monaco)

Features:
- Full VS Code editing experience
- Syntax highlighting for 14+ languages
- IntelliSense and autocomplete
- Theme integration (dark/light)
- Keyboard shortcuts

### Terminal (xterm.js)

Features:
- ANSI color support
- Professional terminal appearance
- Auto-fit to container
- Output scrollback

### Agent Panel

The AI assistant panel provides:
- Tab-based interface (Pair Programming / System Design)
- Mode selection for different assistance types
- Chat-like conversation interface
- Code block rendering with copy
- Context-aware suggestions

## Styling Guidelines

### No Emojis in Interactive UI

The UI uses proper icons instead of emojis for interactive elements:

```jsx
// ❌ Don't use emojis for buttons/controls
<button>🚀 Run Code</button>

// ✅ Use icons from react-icons
import { FiPlay } from 'react-icons/fi'
<Button><FiPlay /> Run Code</Button>
```

### Consistent Spacing

Use Chakra's spacing scale:
- `1` = 4px
- `2` = 8px
- `3` = 12px
- `4` = 16px
- `6` = 24px
- `8` = 32px

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Heading | Bricolage Grotesque | 24px | 700 |
| Body | Space Grotesk | 14px | 400 |
| Code | JetBrains Mono | 13px | 400 |
| Caption | Inter | 12px | 500 |

## Responsive Design

The UI adapts to different screen sizes:

### Breakpoints

- `sm`: 480px
- `md`: 768px
- `lg`: 992px
- `xl`: 1280px

### Responsive Behavior

- Sidebar collapses on smaller screens
- Agent panel becomes a drawer on mobile
- Editor and terminal stack vertically on narrow screens

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Run code |
| `Cmd/Ctrl + Shift + Enter` | Submit code |
| `Cmd/Ctrl + S` | Save (no-op, auto-saves) |
| `Cmd/Ctrl + /` | Toggle comment |
| `Cmd/Ctrl + Shift + ?` | Show help |

## Accessibility

### Focus Management

- Visible focus indicators on all interactive elements
- Keyboard navigation support
- Skip links for main content

### Color Contrast

- All text meets WCAG AA contrast requirements
- UI doesn't rely solely on color for meaning

### Screen Readers

- Proper ARIA labels on interactive elements
- Semantic HTML structure
- Status announcements for actions

## Performance

### Optimizations

1. **Lazy Loading**: Excalidraw loaded on demand
2. **Memoization**: Expensive computations cached
3. **Virtual Lists**: Large problem lists virtualized
4. **Code Splitting**: Components split for faster initial load

### Best Practices

- Avoid inline styles for frequently-updated elements
- Use CSS variables for theme values
- Minimize re-renders with proper key usage

## Testing

### Component Testing

```jsx
import { render, screen } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from './theme'

test('renders header', () => {
  render(
    <ChakraProvider value={system}>
      <Header />
    </ChakraProvider>
  )
  expect(screen.getByText('CeesarCode')).toBeInTheDocument()
})
```

### Visual Testing

- Use Storybook for component documentation
- Visual regression testing with Percy or Chromatic

## Migration Notes

### From Previous UI

The Chakra UI migration maintains all functionality while improving:

1. **Consistent theming**: Single source of truth for colors
2. **Accessibility**: Built-in ARIA support
3. **Responsive**: Mobile-first approach
4. **Developer experience**: Cleaner component API

### Gradual Migration

Components are being migrated incrementally:
- [x] Theme and provider setup
- [x] Agent panel (new component)
- [x] Color mode integration
- [ ] Header component
- [ ] Sidebar component
- [ ] Modal dialogs
- [ ] Form controls

## Future Improvements

1. **Storybook**: Component documentation
2. **CSS-in-JS optimization**: Reduce runtime overhead
3. **Micro-interactions**: Subtle animations
4. **Themes**: Multiple theme presets
5. **Plugin system**: Extensible UI components

