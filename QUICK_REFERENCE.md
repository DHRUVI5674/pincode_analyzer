# 🎨 Design System - Quick Reference Card

## 🚀 One-Minute Setup

```jsx
// Import components
import {
  Button, Card, StatCard, Section, PageHeader, Input, Select,
  GridContainer, Badge, LoadingSpinner, EmptyState
} from './components/UIComponents';

// Use in component
<PageHeader title="My Page" icon={MapPin} />
<GridContainer cols={3}>
  <StatCard icon={Users} title="Users" value={100} color="indigo" />
</GridContainer>
```

---

## 🎨 Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | #6366f1 | Main actions |
| Secondary | #a855f7 | Alt actions |
| Accent | #ec4899 | Highlights |
| Success | #22c55e | Positive |
| Warning | #f59e0b | Alerts |
| Danger | #ef4444 | Errors |

---

## 🔘 Buttons

```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Sizes: xs, sm, md, lg, xl
<Button size="lg">Large Button</Button>

// Loading state
<Button isLoading={true}>Loading...</Button>
```

---

## 📦 Cards

```jsx
<Card>Default Card</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="gradient">Gradient</Card>
<Card variant="glassmorphism">Glass</Card>
```

---

## 📊 Stats

```jsx
<StatCard
  icon={MapPin}
  title="Total PIN Codes"
  value={215}
  color="indigo"  // indigo, purple, pink, green, orange, blue
  trend="+5%"
/>
```

---

## 📋 Forms

```jsx
<Input
  label="Placeholder"
  placeholder="Enter text..."
  icon={Search}
  error="Error message"
/>

<Select
  label="Choose"
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' }
  ]}
/>
```

---

## 📐 Grids

```jsx
// Automatic responsive: 1 col → 2 → 3/4 based on screen
<GridContainer cols={3} gap={6}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</GridContainer>

// Manual: cols = 1, 2, 3, 4; gap = 4, 6, 8
```

---

## 📱 Responsive

```jsx
// Mobile first
<div className="w-full md:w-1/2 lg:w-1/3">Responsive</div>

// Breakpoints: md = 768px, lg = 1024px, xl = 1280px
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## 🌙 Dark Mode

```jsx
// Automatic in all components!
// Add dark: classes for custom styles:
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-white">Text</p>
</div>
```

---

## 🏷️ Badges

```jsx
<Badge label="Active" variant="success" />
<Badge label="Pending" variant="warning" />
<Badge label="Error" variant="danger" />

// With icon
<Badge label="Loading" icon={Loader} />
```

---

## 📍 Sections

```jsx
<Section
  title="Section Title"
  subtitle="Optional subtitle"
  Icon={MapPin}
>
  Content here
</Section>

<PageHeader
  title="Page Title"
  icon={MapPin}
  actions={<Button>Action</Button>}
/>
```

---

## ✨ Status

```jsx
<LoadingSpinner size="md" color="indigo" />

<EmptyState
  icon={Search}
  title="No Results"
  action={() => handleClick()}
  actionLabel="Try Again"
/>
```

---

## 🎨 Tailwind Classes (Key)

```jsx
// Spacing: p-4, m-6, gap-8, etc (4 = 16px)
<div className="p-6 mb-8 gap-4">

// Colors: text-indigo-600, bg-purple-100, etc
<div className="text-indigo-600 dark:text-indigo-400">

// Responsive: md:text-lg lg:grid-cols-3
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Hover: hover:shadow-lg hover:scale-105
<div className="hover:shadow-lg hover:scale-105">

// Transitions: transition-all duration-300
<div className="transition-all duration-300">

// Animations: animate-spin animate-pulse
<div className="animate-spin">
```

---

## 🔄 Common Patterns

### Header + Content
```jsx
<PageHeader title="Title" icon={Icon} />
<GridContainer cols={3}>
  <StatCard icon={Icon1} title="Stat1" value={100} color="indigo" />
  <StatCard icon={Icon2} title="Stat2" value={200} color="purple" />
</GridContainer>
```

### Form Section
```jsx
<Section title="Filters">
  <Input label="Search" />
  <Select label="Category" options={[...]} />
  <Button variant="primary">Search</Button>
</Section>
```

### Card Grid
```jsx
<GridContainer cols={3} gap={6}>
  <Card>
    <h3>Title</h3>
    <p>Description</p>
    <Button>Action</Button>
  </Card>
</GridContainer>
```

---

## 📚 Full Docs

- **DESIGN_SYSTEM.md** - Complete reference
- **IMPLEMENTATION_GUIDE.md** - Refactoring examples
- **src/theme.js** - All tokens
- **src/components/UIComponents.jsx** - Component code

---

## 🎯 Component Props

### Button
```jsx
<Button
  variant="primary|secondary|accent|outline|ghost|success|danger"
  size="xs|sm|md|lg|xl"
  isLoading={boolean}
  disabled={boolean}
  onClick={function}
  className={string}
>
  Label
</Button>
```

### Card
```jsx
<Card
  variant="default|elevated|gradient|glassmorphism"
  hover={boolean}
  className={string}
>
  Content
</Card>
```

### StatCard
```jsx
<StatCard
  icon={ReactIcon}
  title="string"
  value={number|string}
  subtitle="string"
  trend="string"
  color="indigo|purple|pink|green|orange|blue"
/>
```

### Input
```jsx
<Input
  label="string"
  placeholder="string"
  icon={ReactIcon}
  error="string"
  variant="default|outlined"
  {...inputProps}
/>
```

### Select
```jsx
<Select
  label="string"
  options={[{value, label}]}
  error="string"
  icon={ReactIcon}
  {...selectProps}
/>
```

### GridContainer
```jsx
<GridContainer
  cols={1|2|3|4}
  gap={4|6|8}
  className="string"
>
  {items}
</GridContainer>
```

---

## 🌈 Color Variants (for StatCard, Badge, etc)

- `indigo` - #6366f1
- `purple` - #a855f7
- `pink` - #ec4899
- `green` - #22c55e
- `orange` - #f59e0b
- `blue` - #0ea5e9

---

## ⚡ Performance Tips

1. Use `GridContainer` for responsive grids
2. Use `Card` component for consistency
3. Leverage dark mode built-in (no extra code)
4. Use Tailwind classes (not inline styles)
5. Icons from lucide-react only

---

## 🐛 Common Mistakes

❌ Don't do this:
```jsx
<div style="background-color: #6366f1;">
<button class="custom-btn">
<div className="bg-blue-600">
```

✅ Do this instead:
```jsx
<div className="bg-indigo-600 dark:bg-indigo-700">
<Button variant="primary">
<div className="bg-primary">
```

---

## 📞 Quick Help

**Q: How do I add dark mode?**
A: It's automatic! Add `dark:` to Tailwind classes. All components support it.

**Q: How do I make responsive?**
A: Use `GridContainer` or add `md:` and `lg:` prefixes to classes.

**Q: What icons can I use?**
A: Any from `lucide-react` - import and pass as prop.

**Q: How do I use custom colors?**
A: Use Tailwind class names: `bg-indigo-600`, `text-purple-700`, etc.

**Q: Where's the component X?**
A: Check `src/components/UIComponents.jsx` for all available components.

---

**Last Updated**: April 2026  
**Version**: 1.0
