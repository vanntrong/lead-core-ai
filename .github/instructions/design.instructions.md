---
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# LeadCore AI - Design Rules

## Design System & UI Guidelines

### Core Design Principles

- **Consumer-Friendly First**: Design for business owners and logistics managers, not developers
- **Stripe-Inspired Excellence**: Clean, professional, trustworthy design patterns that prioritize usability
- **"Normie-Focused"**: Use friendly language and intuitive interfaces that feel familiar and approachable

### Visual Design Standards

#### Color Palette

- **Primary**: Indigo-600 (#4f46e5) - Trust and professionalism
- **Secondary**: Purple-600 (#9333ea) - Premium feel
- **Success**: Green-600 (#16a34a) - Positive actions
- **Warning**: Orange-600 (#ea580c) - Alerts
- **Error**: Red-600 (#dc2626) - Errors
- **Neutral**: Gray scale for text and backgrounds
- **Border**: Gray-200 (#e5e7eb) - Subtle boundaries
- **Focus**: Indigo-500 (#6366f1) - Interactive states

#### Typography

- **Headings**: Bold, clear hierarchy (text-2xl, text-xl, text-lg)
- **Body**: Readable sizes (text-sm, text-base) - Stripe uses smaller, cleaner text
- **Labels**: Medium weight for form labels (font-medium text-sm)
- **Colors**: Gray-900 for primary text, Gray-600 for secondary, Gray-500 for muted

#### Spacing & Layout

- **Moderate Padding**: Use p-4, p-6 for cards and sections (less overwhelming)
- **Tight Spacing**: Use gap-3, gap-4, gap-6 for better visual density
- **Max Width**: Use max-w-6xl for main containers (more focused)
- **Responsive**: Always mobile-first design
- **Consistent Rhythm**: 4px base unit (space-1 = 4px, space-2 = 8px, etc.)

#### Components

- **Buttons**:
  - Primary: h-10, rounded-lg, font-medium text-sm
  - Secondary: h-10, rounded-lg, border, font-medium text-sm
  - Subtle shadows (shadow-sm), clear hover states
- **Cards**: bg-white, rounded-lg, border border-gray-200, subtle hover effects
- **Forms**:
  - Inputs: h-10 (optimal for usability), rounded-lg, border-gray-300
  - Focus: ring-2 ring-indigo-500/20, border-indigo-500
  - Labels: text-sm font-medium text-gray-700, mb-1.5
- **Icons**:
  - Size: w-5 h-5 (more proportional)
  - Colored backgrounds: bg-gray-50, rounded-lg containers

### Language & Copy Guidelines

#### Tone of Voice

- **Friendly**: "Good morning! 👋" not "Dashboard initialized"
- **Clear**: "Get started free" not "Initialize trial sequence"
- **Benefit-Focused**: "Smart logistics made simple" not "API-driven optimization"
- **Reassuring**: "Free 7-day trial • Cancel at any time"

#### Technical Terms to Avoid

- ❌ "Deploy", "Initialize", "Configure", "Parameters"
- ❌ "API", "Database", "Backend", "Frontend"
- ❌ "Instance", "Environment", "Build", "Repository"

#### Consumer-Friendly Alternatives

- ✅ "Get started", "Set up", "Customize", "Options"
- ✅ "Integration", "Data", "System", "Platform"
- ✅ "Account", "Settings", "Create", "Project"

### Component Patterns

#### Navigation

```tsx
// Clean, focused navigation with subtle branding
<nav className="bg-white border-b border-gray-200">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-14">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-md">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold text-gray-900">
          FleetForce AI
        </span>
      </div>
    </div>
  </div>
</nav>
```

#### Hero Sections

```tsx
// Focused headlines with clear value props (Stripe-style)
<div className="text-center">
  <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
    Smart logistics made{" "}
    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      simple
    </span>
  </h1>
  <p className="mt-4 text-base text-gray-600 max-w-xl mx-auto">
    Clear, benefit-focused description that explains value
  </p>
</div>
```

#### Cards & Features

```tsx
// Clean cards with subtle styling (Stripe-inspired)
<div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
  <div className="w-10 h-10 bg-gray-50 rounded-md flex items-center justify-center mb-4">
    <Icon className="h-5 w-5 text-indigo-600" />
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Name</h3>
  <p className="text-sm text-gray-600">Benefit-focused description</p>
</div>
```

#### Forms

```tsx
// Optimal form inputs for better UX (Stripe-style)
<div className="space-y-1.5">
  <Label className="text-sm font-medium text-gray-700">Field Name</Label>
  <Input
    className="h-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
    placeholder="Helpful placeholder text"
  />
</div>
```

#### Buttons

```tsx
// Clean, professional buttons (Stripe-style)
<Button className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-sm font-medium rounded-lg shadow-sm">
  <Icon className="mr-2 h-4 w-4" />
  Clear Action Text
</Button>
```

#### Form Groups

```tsx
// Consistent form spacing and layout
<div className="space-y-6">
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">First Name</Label>
      <Input className="h-10 rounded-lg" />
    </div>
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">Last Name</Label>
      <Input className="h-10 rounded-lg" />
    </div>
  </div>
</div>
```

### React Query & Architecture

#### Service Layer

- Always separate business logic from components
- Use service classes for API calls
- Keep components focused on UI only

#### Hooks Pattern

```tsx
// Use custom hooks for data fetching
const { data, isLoading, error } = useCustomHook();

// Handle loading and error states gracefully
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;
```

#### Error Handling

- Always show user-friendly error messages
- Use toast notifications for feedback
- Provide recovery actions when possible

### File Organization

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React Query hooks
├── services/           # Business logic and API calls
├── lib/               # Utilities and configurations
└── app/               # Next.js app router pages
```

### Performance Standards

- Use React Query for caching and background updates
- Implement proper loading states
- Optimize images and assets
- Follow Next.js best practices

### Accessibility

- Always include proper ARIA labels
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Use semantic HTML elements

## Development Workflow

### Before Writing Code

1. Consider the end user (business owner, not developer)
2. Use friendly, clear language
3. Follow the established design patterns
4. Ensure mobile responsiveness

### Code Quality

- Use TypeScript for type safety
- Follow the established component patterns
- Write clean, readable code
- Include proper error handling

### Testing Strategy

- Test user flows, not just functions
- Ensure forms work correctly
- Verify responsive design
- Test error scenarios

## Remember

Every design decision should make the app more approachable for non-technical business users. When in doubt, choose the more user-friendly option.
