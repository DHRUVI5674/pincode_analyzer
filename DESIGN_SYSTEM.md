# 🎨 Modern Design System Guide

## Overview

This document outlines the unified design system implemented across **PINCode India** application. All routes and components follow this consistent design language to provide a cohesive, attractive, and user-friendly interface.

---

## 🎯 Design Principles

1. **Consistency**: Same components, colors, and patterns across all pages
2. **Modern Aesthetics**: Gradients, shadows, and smooth animations
3. **Dark Mode Support**: Full dark/light theme support throughout
4. **Accessibility**: WCAG compliant with proper contrast ratios
5. **Responsiveness**: Mobile-first design that works on all screen sizes
6. **Performance**: Smooth animations and transitions without jank

---

## 🌈 Color Palette

### Primary Colors (Indigo → Purple)
- **Primary 500**: `#6366f1` - Main action color
- **Secondary 500**: `#a855f7` - Secondary actions
- **Accent 500**: `#ec4899` - Highlights and emphasis

### Status Colors
- **Success**: `#22c55e` - Positive actions, success messages
- **Warning**: `#f59e0b` - Alerts, warnings
- **Danger**: `#ef4444` - Errors, deletions
- **Info**: `#0ea5e9` - Information

### Neutral Colors (Light Mode)
- **White/Lightest**: `#fafl fa` 
- **Gray 100**: `#f5f5f5` - Backgrounds
- **Gray 600**: `#525252` - Text
- **Gray 900**: `#171717` - Darkest text

### Neutral Colors (Dark Mode)
- **Dark BG**: `#111827` - Main background
- **Dark Secondary**: `#1f2937` - Secondary backgrounds
- **Dark Text**: `#f9fafb` - Primary text

---

## 📐 Typography

### Font Family
```
Font: System Sans (ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
Smoothing: Antialiased
```

### Font Sizes
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px) - Body text
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px) - Section headers
- **4xl**: 2.25rem (36px)
- **5xl**: 3rem (48px) - Main titles

### Font Weights
- **Light**: 300
- **Normal**: 400 - Body text
- **Medium**: 500 - Labels
- **Semibold**: 600 - Headers
- **Bold**: 700 - Emphasis
- **Extrabold**: 800 - Main titles

---

## 📏 Spacing Scale

Used consistently for margins, padding, and gaps:

- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px) - Standard
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 2.5rem (40px)
- **3xl**: 3rem (48px)
- **4xl**: 4rem (64px)

---

## 🎭 Border Radius

- **none**: 0px
- **sm**: 4px - Small buttons
- **md**: 8px - Cards
- **lg**: 12px - Medium components
- **xl**: 16px - Large cards
- **2xl**: 24px - Extra large elements
- **3xl**: 32px - Hero sections
- **full**: 9999px - Pills, circles

---

## ✨ Shadows & Effects

### Shadows
- **xs**: Subtle borders
- **sm**: Small elevations
- **md**: Card boundaries
- **lg**: Modal/elevated content
- **xl**: Standalone cards
- **2xl**: Fixed headers/footers
- **glow**: Indigo glow effect

### Gradients

#### Gradient Backgrounds
```jsx
From Indigo → Purple: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)
Purple → Pink: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)
Vibrant: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #d946ef 100%)
```

#### Glass Morphism
```jsx
.glass {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
```

---

## 🔘 Component Usage

### 1. Buttons

#### Primary Button
```jsx
<Button variant="primary" size="md">
  Click Me
</Button>
```

**Variants**: primary, secondary, accent, outline, ghost, success, danger  
**Sizes**: xs, sm, md, lg, xl

#### Example: Button Styles
```jsx
// Gradient with hover scale
<Button 
  variant="primary"
  size="lg"
  isLoading={loading}
>
  Submit Form
</Button>
```

### 2. Cards

#### Default Card
```jsx
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

**Variants**: default, elevated, gradient, glassmorphism  
**Props**: hover (boolean), className

### 3. Stat Card
```jsx
<StatCard
  icon={MapPin}
  title="Total PIN Codes"
  value={215}
  color="indigo"
  trend="+5% this month"
/>
```

**Colors**: indigo, purple, pink, green, orange, blue

### 4. Section Header
```jsx
<Section
  title="Explore PIN Codes"
  subtitle="Find postal information"
  Icon={Compass}
>
  <div>Content here</div>
</Section>
```

### 5. Page Header
```jsx
<PageHeader
  title="Dashboard"
  subtitle="View your statistics"
  icon={BarChart3}
  actions={<Button>Add New</Button>}
/>
```

### 6. Input Fields
```jsx
<Input
  label="Search"
  placeholder="Enter PIN code..."
  icon={Search}
  error={errors.search}
/>

<Select
  label="State"
  options={[
    { value: 'delhi', label: 'Delhi' },
    { value: 'maharashtra', label: 'Maharashtra' }
  ]}
/>
```

### 7. Badges
```jsx
<Badge label="Active" variant="success" size="md" />
<Badge label="Pending" variant="warning" icon={Clock} />
```

**Variants**: primary, secondary, success, warning, danger

### 8. Grid Layouts
```jsx
<GridContainer cols={3} gap={6}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</GridContainer>
```

**Cols**: 1, 2, 3, 4  
**Gap**: 4, 6, 8

---

## 🎨 Animations

### Available Animations

#### From CSS Classes
- **float**: Up-down floating motion (3s)
- **blur-in**: Blur + fade-in effect
- **fade-in**: Simple fade-in
- **slide-up**: Slide up with fade
- **pulse-soft**: Gentle pulsing

#### Example Usage
```jsx
<div className="fade-in">Content fades in</div>
<div className="slide-up">Slideup animation</div>
<div className="glow-hover">Glows on hover</div>
```

### Transition Classes
- **transform-smooth**: Smooth transform transitions
- **hover-lift**: Lift effect on hover (-2px translate)
- **focus-ring**: Focus ring styling

---

## 🌙 Dark Mode Implementation

### Enabling Dark Mode
```jsx
// In App.jsx
const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [darkMode]);
```

### Using Dark Mode in Components
```jsx
// Tailwind dark mode
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-white">Text</p>
</div>

// CSS dark mode (dark class on root)
:root.dark {
  --color-bg: #111827;
  --color-text: #f9fafb;
}
```

---

## 📱 Responsive Breakpoints

| Device | Breakpoint | Example |
|--------|-----------|---------|
| Mobile | < 640px | `sm:` |
| Tablet | 640px - 1024px | `md:` and `lg:` |
| Desktop | > 1024px | `xl:` and `2xl:` |

### Usage
```jsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

---

## 🧩 Layout Components

### Navigation Bar
- **File**: `ModernNavbar.jsx`
- **Features**: Logo, menu items, dark mode toggle, mobile responsive
- **Usage**:
  ```jsx
  <ModernNavbar darkMode={darkMode} toggleDarkMode={toggle} />
  ```

### Footer
- **File**: `ModernFooter.jsx`
- **Features**: Links, socials, newsletter, copyright
- **Usage**:
  ```jsx
  <ModernFooter />
  ```

---

## 🎯 Best Practices

### 1. Consistency
- Always use components from `UIComponents.jsx`
- Don't create custom styles for common elements
- Reference theme colors instead of hardcoding hex values

### 2. Spacing
```jsx
// Good
<div className="p-6 mb-8 gap-4">

// Avoid
<div style="padding: 24px; margin-bottom: 32px; gap: 16px;">
```

### 3. Dark Mode
```jsx
// Good - handles light and dark
<div className="bg-white dark:bg-gray-800">

// Avoid - not dark mode aware
<div className="bg-white">
```

### 4. Responsive Design
```jsx
// Good - mobile first
<div className="px-4 md:px-6 lg:px-8">

// Avoid - desktop only
<div className="px-8">
```

### 5. Animations
```jsx
// Good - uses class
<div className="transition-all duration-300 hover:shadow-lg">

// Avoid - inline styles
<div style="transition: all 300ms;">
```

---

## 🚀 Component Examples

### Example 1: Dashboard Card
```jsx
import { Card, StatCard } from './UIComponents';
import { MapPin } from 'lucide-react';

export function DashboardExample() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <StatCard
        icon={MapPin}
        title="Total PIN Codes"
        value={215}
        color="indigo"
      />
      <StatCard
        icon={Building}
        title="Offices"
        value={42}
        color="purple"
      />
    </div>
  );
}
```

### Example 2: Form Section
```jsx
import { Section, Input, Button } from './UIComponents';
import { Search } from 'lucide-react';

export function SearchExample() {
  return (
    <Section title="Search PIN Codes" Icon={Search}>
      <Input
        label="PIN Code or Location"
        placeholder="Enter PIN code or city..."
        icon={Search}
      />
      <Button variant="primary" size="lg">
        Search
      </Button>
    </Section>
  );
}
```

---

## 📊 Tailwind Configuration

All theme values are defined in `tailwind.config.js`:
- Custom colors
- Extended animations
- Keyframes
- Background gradients
- Dark mode settings

---

## 🔗 File References

- **Theme Tokens**: `src/theme.js`
- **UI Components**: `src/components/UIComponents.jsx`
- **Global Styles**: `src/index.css`
- **Navigation**: `src/components/ModernNavbar.jsx`
- **Footer**: `src/components/ModernFooter.jsx`
- **Tailwind Config**: `tailwind.config.js`
- **App Layout**: `src/App.jsx`

---

## ✅ Implementation Checklist

When adding new pages or components:

- [ ] Use components from `UIComponents.jsx`
- [ ] Follow color palette for consistent branding
- [ ] Add dark mode support with `dark:` classes
- [ ] Make responsive with `md:` and `lg:` breakpoints
- [ ] Add smooth transitions/animations
- [ ] Use theme spacing and sizing scales
- [ ] Test in both light and dark modes
- [ ] Verify on mobile, tablet, and desktop

---

## 🎨 Color Usage Guidelines

### For Different Scenarios

| Scenario | Color | Usage |
|----------|-------|-------|
| Primary Actions | Indigo 600 | Buttons, links, primary CTAs |
| Secondary Actions | Purple 600 | Alternate buttons, secondary CTAs |
| Highlights | Pink 600 | Warnings, emphasis, special items |
| Success | Green 600 | Confirmations, positive feedback |
| Errors | Red 600 | Errors, deletions, warnings |
| Background | Neutral | Page, card, section backgrounds |
| Text | Neutral 800/900 | Body text, labels |

---

## 📚 Additional Resources

- **Lucide Icons**: All icons used throughout the app
- **React Hot Toast**: Toast notifications (configured globally!)
- **Tailwind CSS**: Utility-first CSS framework documentation

---

## 🤝 Contributing

When making design changes:

1. Update `theme.js` with new tokens
2. Add new components to `UIComponents.jsx`
3. Update this documentation with examples
4. Test all changes in light and dark modes
5. Ensure mobile responsiveness

---

## 📞 Support

For design system questions or issues:
- Check this documentation first
- Review existing component examples
- Test using `UIComponents.jsx`
- Ensure dark mode compatibility

---

**Version**: 1.0  
**Last Updated**: April 2026  
**Status**: ✅ Active and Maintained
