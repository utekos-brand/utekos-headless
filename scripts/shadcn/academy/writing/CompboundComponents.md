---
title: 'Compound Components and Advanced Composition'
description:
  'Master the compound component pattern to build flexible, powerful component APIs that scale with complex
  requirements while maintaining clean interfaces.'
canonical_url: 'https://vercel.com/academy/shadcn-ui/compound-components-and-advanced-composition'
md_url: 'https://vercel.com/academy/shadcn-ui/compound-components-and-advanced-composition.md'
docset_id: 'vercel-academy'
doc_version: '1.0'
last_updated: '2026-06-17T08:13:22.051Z'
content_type: 'lesson'
course: 'shadcn-ui'
course_title: 'React UI with shadcn/ui + Radix + Tailwind'
prerequisites: []
---

<agent-instructions>
Vercel Academy — structured learning, not reference docs.
Lessons are sequenced.
Adapt commands to the human's actual environment (OS, package manager, shell, editor) — detect from project context or ask, don't assume.
The lesson shows one path; if the human's project diverges, adapt concepts to their setup.
Preserve the learning goal over literal steps.
Quizzes are pedagogical — engage, don't spoil.
Quiz answers are included for your reference.
</agent-instructions>

# Compound Components and Advanced Composition

The compound component pattern is one of the most powerful techniques for creating flexible, reusable
components that can handle complex requirements without sacrificing API clarity. Instead of cramming all
functionality into a single component with dozens of props, compound components distribute responsibility
across multiple cooperating components.

## Understanding Compound Components

Compound components work together as a cohesive unit while maintaining individual responsibilities. Think of
them like HTML's `<select>` and `<option>` elements - they are separate components that work together to
create sophisticated functionality.

Instead of this monolithic approach:

```tsx title="components/ui/my-table.tsx"
<DataTable
  data={data}
  columns={columns}
  pagination={true}
  sorting={true}
  filtering={true}
  actions={['edit', 'delete']}
  rowSelection={true}
  // ... 20+ more props
/>
```

We can use compound components for clarity:

```tsx title="components/ui/my-table.tsx"
<DataTable.Root data={data}>
  <DataTable.Toolbar>
    <DataTable.Search />
    <DataTable.Filter />
    <DataTable.Actions />
  </DataTable.Toolbar>

  <DataTable.Content>
    <DataTable.Header>
      <DataTable.Column sortable>Name</DataTable.Column>
      <DataTable.Column sortable>Date</DataTable.Column>
      <DataTable.Column>Actions</DataTable.Column>
    </DataTable.Header>

    <DataTable.Body>
      {data.map((row) => (
        <DataTable.Row key={row.id} data={row}>
          <DataTable.Cell>{row.name}</DataTable.Cell>
          <DataTable.Cell>{row.date}</DataTable.Cell>
          <DataTable.Cell>
            <DataTable.RowActions row={row} />
          </DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable.Body>
  </DataTable.Content>

  <DataTable.Pagination />
</DataTable.Root>
```

This gives you:

- **Flexibility**: Easy to include or exclude specific functionality
- **Maintainability**: Props are distributed across relevant components
- **Developer Experience**: Clear visual structure and better IntelliSense
- **Scalability**: Handles simple to complex use cases naturally

\*\*Note: When to Use Compound Components\*\*

Consider compound components when you have:

- Complex components with many configuration options
- Multiple distinct UI areas that can be composed differently
- Functionality that might be optional or conditionally rendered
- Components that will be used in various configurations across your app

## Building a Sophisticated Card System

Let's build a comprehensive card system that demonstrates advanced compound component patterns. We'll break
this down into logical sections to understand each piece.

### Step 1: Context and Foundation

First, we establish the shared context that allows our compound components to communicate. We'll do this by
creating a context object that will be used to share state between components, then export that in the form of
a hook.

```tsx title="components/ui/card-system.tsx"
"use client"

import * as React from "react"
import { createContext, useContext } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Minimize2, Maximize2, X } from "lucide-react"

// Context for sharing state between compound components
interface CardContextValue {
  isCollapsible: boolean
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isExpandable: boolean
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
  isDismissible: boolean
  onDismiss?: () => void
  variant: 'default' | 'outline' | 'ghost'
  size: 'default' | 'sm' | 'lg'
}

const CardContext = createContext<CardContextValue | null>(null)

const useCardContext = () => {
  const context = useContext(CardContext)
  if (!context) {
    throw new Error('Card compound components must be used within Card.Root')
  }
  return context
}
```

The context pattern allows child components to access shared state without prop drilling. This is essential
for compound components to feel unified while remaining compositional.

### Step 2: Root Component with State Management

The root component manages all shared state and provides the context. We can also call this component the
"Provider" because it provides the context to all child components.

```tsx
// Root component that provides context and manages state
interface CardRootProps {
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  expandable?: boolean
  defaultExpanded?: boolean
  dismissible?: boolean
  onDismiss?: () => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

function CardRoot({
  children,
  className,
  collapsible = false,
  defaultCollapsed = false,
  expandable = false,
  defaultExpanded = false,
  dismissible = false,
  onDismiss,
  variant = 'default',
  size = 'default',
  ...props
}: CardRootProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

    const contextValue: CardContextValue = {
      isCollapsible: collapsible,
      isCollapsed,
      setIsCollapsed,
      isExpandable: expandable,
      isExpanded,
      setIsExpanded,
      isDismissible: dismissible,
      onDismiss,
      variant,
      size
    }

    /* Variant and size styling configurations */
    const variants = {
      default: "border bg-card text-card-foreground shadow-sm",
      outline: "border-2 border-border bg-background",
      ghost: "border-0 bg-transparent shadow-none"
    }

    const sizes = {
      default: "p-6",
      sm: "p-4",
      lg: "p-8"
    }

  return (
    <CardContext.Provider value={contextValue}>
      <div
        className={cn(
          "rounded-lg transition-all duration-200 ease-in-out",
          variants[variant],
          sizes[size],
          isExpanded && "fixed inset-4 z-50 overflow-auto",
          isCollapsed && "py-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </CardContext.Provider>
  )
}
CardRoot.displayName = "Card.Root"
```

We use local state for UI interactions (collapse/expand) rather than requiring external state management. This
keeps the component self-contained while allowing override through props.

### Step 3: Interactive Header Component

The header component demonstrates how compound components can have sophisticated built-in functionality. It
uses the context to determine if it should render the collapse/expand and dismiss controls.

```tsx
// Header component with built-in controls
interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

function CardHeader({ children, className, actions, ...props }: CardHeaderProps) {
    const {
      isCollapsible,
      isCollapsed,
      setIsCollapsed,
      isExpandable,
      isExpanded,
      setIsExpanded,
      isDismissible,
      onDismiss
    } = useCardContext()

    const hasControls = isCollapsible || isExpandable || isDismissible

  return (
    <div
      className={cn(
        "flex items-center justify-between space-y-0 pb-2",
        className
      )}
      {...props}
    >
        <div className="flex-1">
          {children}
        </div>

        {/* Conditional control rendering based on root configuration */}
        {(actions || hasControls) && (
          <div className="flex items-center gap-2">
            {actions}
            {/* Built-in interactive controls */}
            {hasControls && (
              <div className="flex items-center">
                {/* Collapse/expand and dismiss controls implementation */}
                {/* ... rest of controls implementation ... */}
              </div>
            )}
          </div>
        )}
    </div>
  )
}
CardHeader.displayName = "Card.Header"
```

The header automatically includes controls based on the root component's configuration, but allows custom
actions to be injected.

### Step 4: Content Management Components

The remaining components handle content display and state-aware rendering:

```tsx
// Content components that respond to context state
function CardContent({ children, className, forceVisible = false, ...props }: {
  children: React.ReactNode
  className?: string
  forceVisible?: boolean
}) {
  const { isCollapsed, size } = useCardContext()

  // Smart visibility based on collapsed state
  if (isCollapsed && !forceVisible) {
    return null
  }

  /* Size-based styling and rendering logic */
  return (
    <div className={cn(/* ... size-based classes ... */, className)} {...props}>
      {children}
    </div>
  )
}

// Title, Description, Footer, and Status components follow similar patterns
// Each component:
// 1. Accesses context for configuration
// 2. Applies size/variant-based styling
// 3. Responds appropriately to state changes

/* Complete implementations for CardTitle, CardDescription, CardFooter, CardStatus */

// Export the compound component
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
  Status: CardStatus
}
```

Components like `CardContent` and `CardFooter` automatically hide when the card is collapsed, but provide
override options for edge cases.

## Practical Usage Examples

Here's how the compound component system provides incredible flexibility through different composition
patterns:

### Simple Information Card

This demonstrates the minimal viable card composition. Only the essential components are used, creating a
clean, focused display.

```tsx
function SimpleCard() {
  return (
    <Card.Root className="max-w-md">
      <Card.Header>
        <Card.Title>Project Status</Card.Title>
        <Card.Description>Current project health overview</Card.Description>
      </Card.Header>

      <Card.Content>
        <Card.Status status="success" label="All systems operational" />
        <p className="mt-2 text-sm">
          All components are functioning normally and performance metrics
          are within expected ranges.
        </p>
      </Card.Content>
    </Card.Root>
  )
}
```

### Interactive Dashboard Card

This shows the full power of compound components - every available feature is used, but the API remains clean
because functionality is distributed across components.

```tsx
function DashboardCard() {
  return (
    <Card.Root
      collapsible
      expandable
      dismissible
      onDismiss={() => console.log('Card dismissed')}
      className="max-w-lg"
    >
      <Card.Header
        actions={
          <Button variant="outline" size="sm">
            Refresh
          </Button>
        }
      >
        <div>
          <Card.Title>Real-time Analytics</Card.Title>
          <Card.Description>Live performance metrics</Card.Description>
        </div>
      </Card.Header>

      <Card.Content>
        {/* Metrics grid and status display */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">1,234</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            {/* Additional metric displays */}
          </div>
          <Card.Status status="success" label="System healthy" />
        </div>
      </Card.Content>

      <Card.Footer>
        <Button variant="outline" className="w-full">View Details</Button>
      </Card.Footer>
    </Card.Root>
  )
}
```

### Compact Status Card

Demonstrates how size and variant props affect the entire component tree, showcasing the power of shared
context.

```tsx
function CompactCard() {
  return (
    <Card.Root size="sm" variant="outline">
      <Card.Header>
        <Card.Title level={4}>Service Status</Card.Title>
      </Card.Header>
      <Card.Content>
        <Card.Status status="warning" label="Maintenance scheduled" />
      </Card.Content>
    </Card.Root>
  )
}
```

## Advanced Composition Patterns

We can also use advanced composition patterns to create more complex components. For example, we can create a
smart card that adapts based on content, or a performance optimized card that separates state and
configuration.

### Smart Defaults and Conditional Logic

Compound components can include intelligent behavior that adapts to content. For example, we can create a
smart card that automatically determines if it should be collapsible based on the content.

```tsx
// Smart card that adapts based on content
interface SmartCardProps {
  title: string
  description?: string
  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  data?: Record<string, any>
  actions?: React.ReactNode
  collapsible?: boolean
  children?: React.ReactNode
}

function SmartCard({
  title,
  description,
  status,
  data,
  actions,
  collapsible = false,
  children
}: SmartCardProps) {
  // Automatically determine if card should be collapsible based on content
  const shouldBeCollapsible = collapsible || (data && Object.keys(data).length > 5)

  return (
    <Card.Root collapsible={shouldBeCollapsible}>
      <Card.Header actions={actions}>
        <div>
          <Card.Title>{title}</Card.Title>
          {description && <Card.Description>{description}</Card.Description>}
        </div>
      </Card.Header>

      <Card.Content>
        {status && <Card.Status status={status} />}

        {data && (
          <div className="mt-4 space-y-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{key}:</span>
                <span className="text-sm font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {children}
      </Card.Content>
    </Card.Root>
  )
}
```

Notice how `shouldBeCollapsible` automatically enables collapsing for cards with complex data, improving UX
without requiring explicit configuration.

### Performance Optimization

For complex compound components, split contexts to prevent unnecessary re-renders. This is a performance
optimization technique that is often used in compound components.

```tsx
// Split contexts to prevent unnecessary re-renders
const CardStateContext = createContext<{
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}>({} as any)

const CardConfigContext = createContext<{
  variant: string
  size: string
  isCollapsible: boolean
  isExpandable: boolean
  isDismissible: boolean
}>({} as any)

// Optimized root component
function OptimizedCardRoot({ children, ...props }: CardRootProps) {
  const [isCollapsed, setIsCollapsed] = useState(props.defaultCollapsed || false)
  const [isExpanded, setIsExpanded] = useState(props.defaultExpanded || false)

  /* Memoized context values to prevent child re-renders */
  const stateValue = useMemo(() => ({
    isCollapsed, setIsCollapsed, isExpanded, setIsExpanded
  }), [isCollapsed, isExpanded])

  const configValue = useMemo(() => ({
    variant: props.variant || 'default',
    size: props.size || 'default',
    /* ... rest of config values ... */
  }), [/* dependency array */])

  return (
    <CardConfigContext.Provider value={configValue}>
      <CardStateContext.Provider value={stateValue}>
        {children}
      </CardStateContext.Provider>
    </CardConfigContext.Provider>
  )
}
```

Separating frequently changing state from static configuration prevents unnecessary re-renders of child
components.

### TypeScript Best Practices

Ensure your compound components are fully type-safe:

```tsx
// Type-safe compound component interface
interface CardComponent {
  Root: React.ComponentType<CardRootProps>
  Header: React.ComponentType<CardHeaderProps>
  /* ... rest of component type definitions ... */
}

// Ensure compound component has correct typing
export const Card: CardComponent = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
  Status: CardStatus
} as const

// Helper types for extracting props
type CardRootPropsType = React.ComponentProps<typeof Card.Root>
type CardHeaderPropsType = React.ComponentProps<typeof Card.Header>
```

**Type Safety:** This approach ensures IntelliSense works perfectly and catches composition errors at compile
time.

```yaml
quiz:
  question: 'What is the primary advantage of compound components over monolithic components with many props?'
  choices:
    - id: 'performance'
      text: 'Better performance and smaller bundle size'
    - id: 'flexibility'
      text: 'More flexible composition and clearer separation of concerns'
    - id: 'typescript'
      text: 'Better TypeScript support and type inference'
    - id: 'styling'
      text: 'Easier styling and CSS customization'
  correctAnswerId: 'flexibility'
  feedback:
    "{\n    correct: 'Exactly! Compound components provide flexible composition by distributing responsibility
    across multiple cooperating components, making the API clearer and more maintainable as complexity
    grows.',\n    incorrect: 'While compound components can have benefits for performance, TypeScript, and
    styling, the primary advantage is the flexible composition and clear separation of concerns that comes
    from distributing functionality across multiple cooperating components.'\n  }"
```

## Testing Strategies

We can also use testing strategies to test our compound components. For example, we can test the collapsible
functionality of the card.

```tsx
// Testing compound components
import { render, screen, fireEvent } from '@testing-library/react'
import { Card } from './card-system'

describe('Card Compound Component', () => {
  it('should handle collapsible functionality', () => {
    render(
      <Card.Root collapsible data-testid="card-root">
        <Card.Header>
          <Card.Title>Test Card</Card.Title>
        </Card.Header>
        <Card.Content data-testid="card-content">
          <p>Content that should hide when collapsed</p>
        </Card.Content>
      </Card.Root>
    )

    expect(screen.getByTestId('card-content')).toBeInTheDocument()

    const collapseButton = screen.getByRole('button')
    fireEvent.click(collapseButton)

    expect(screen.queryByTestId('card-content')).not.toBeInTheDocument()
  })

  it('should share context between components', () => {
    render(
      <Card.Root size="lg">
        <Card.Header>
          <Card.Title data-testid="card-title">Large Title</Card.Title>
        </Card.Header>
      </Card.Root>
    )

    const title = screen.getByTestId('card-title')
    expect(title).toHaveClass('text-xl')
  })
})
```

\*\*Reflection:\*\* Think about a complex component in your current or past projects that could benefit from
the compound component pattern. How would you break it down into smaller, cooperating components? What state
would need to be shared, and what functionality would each part handle?

## Course Complete!

Congratulations! You've mastered the art of building sophisticated, reusable components with shadcn/ui.
Throughout this course, you've learned:

- ✅ **Component foundations** - Understanding shadcn/ui architecture and customization patterns
- ✅ **Advanced styling** - Mastering variant systems, responsive design, and theme integration
- ✅ **Complex interactions** - Building components with state management and user interactions
- ✅ **Compound component architecture** - Creating flexible, maintainable APIs that scale
- ✅ **Performance optimization** - Techniques for efficient rendering and state management
- ✅ **TypeScript mastery** - Type-safe component development and API design

You now have the skills to build production-ready component libraries that can handle any design system
requirement. Whether you're creating internal design systems, contributing to open source, or building the
next generation of UI components, you're ready to tackle complex component challenges with confidence.

Keep building, keep experimenting, and remember - great components are built through iteration and real-world
usage. Happy coding!

---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
