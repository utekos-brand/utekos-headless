---
title: 'The Anatomy of shadcn/ui Components'
description:
  "Learn to build specialized components that integrate seamlessly with shadcn/ui's design system while
  providing unique functionality not covered by existing primitives."
canonical_url: 'https://vercel.com/academy/shadcn-ui/extending-shadcn-ui-with-custom-components'
md_url: 'https://vercel.com/academy/shadcn-ui/extending-shadcn-ui-with-custom-components.md'
docset_id: 'vercel-academy'
doc_version: '1.0'
last_updated: '2026-06-17T08:11:25.029Z'
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

# The Anatomy of shadcn/ui Components

While Radix UI primitives provide excellent building blocks for common interface patterns, professional
applications often require specialized components that don't map directly to existing primitives. The art lies
in creating these custom components while maintaining the design consistency, theming capabilities, and
accessibility standards that make shadcn/ui exceptional.

In this lesson, we'll build a custom `MetricCard` component step by step, learning the techniques that make
custom components feel native to the shadcn/ui ecosystem.

## Design System Integration Principles

Creating custom components that integrate seamlessly with shadcn/ui requires understanding the underlying
design philosophy and technical patterns. Every shadcn/ui component follows specific conventions for styling,
theming, accessibility, and API design. Our custom components must respect these patterns to maintain
consistency across the application.

\*\*Note: Consistency Pillars\*\*

Custom shadcn/ui components must maintain:

- **Visual consistency** through shared design tokens and styling patterns
- **Behavioral consistency** via similar APIs and interaction patterns
- **Accessibility consistency** by following WCAG guidelines and ARIA standards
- **Theming consistency** through CSS custom properties and theme integration
- **Developer experience consistency** with familiar prop patterns and TypeScript support

## Building a Custom MetricCard Component

Let's build a sophisticated data visualization component that demonstrates how to extend shadcn/ui with
specialized functionality. We'll construct this component step by step, starting with the foundation and
building up complexity.

### 1. Foundation and Type Safety

First, let's establish our component's foundation with proper TypeScript definitions. This ensures type safety
and provides excellent developer experience:

```tsx
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  value: string | number
  change?: {
    value: number
    period: string
    trend: 'up' | 'down' | 'neutral'
  }
  variant?: 'default' | 'compact' | 'detailed'
  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
}
```

Notice how we start with the essential imports and interfaces. We extend
`React.HTMLAttributes<HTMLDivElement>` to inherit all standard div props, ensuring our component behaves like
a native HTML element. The props interface defines our component's API clearly with optional properties for
flexibility.

### 2. Variant Styling System

Next, let's add the styling system using `class-variance-authority` to create consistent, theme-aware
variants:

```tsx
const metricCardVariants = cva(
  'transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'p-6',
        compact: 'p-4',
        detailed: 'p-6 space-y-4',
      },
      status: {
        success: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50',
        warning: 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50',
        error: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50',
        info: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50',
        neutral: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      status: 'neutral',
    },
  }
)
```

The `cva` function creates a variant system that follows shadcn/ui patterns. Notice how we:

- Use CSS custom properties that work with both light and dark themes
- Apply the same transition classes that other shadcn/ui components use
- Define semantic status colors that map to the design system

### 3. Helper Functions

Before building the main component, let's create utility functions that handle data formatting and trend
visualization:

```tsx
// Helper function to format numeric values with locale-aware formatting
const formatValue = (val: string | number) => {
  if (typeof val === 'number') {
    return new Intl.NumberFormat().format(val)
  }
  return val
}

// Helper function to get appropriate trend icon
const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
    case 'neutral':
      return <Minus className="h-4 w-4 text-muted-foreground" />
  }
}

// Helper function to get trend-appropriate text colors
const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return 'text-green-600 dark:text-green-400'
    case 'down':
      return 'text-red-600 dark:text-red-400'
    case 'neutral':
      return 'text-muted-foreground'
  }
}
```

These helper functions demonstrate important patterns:

- **Internationalization**: Using `Intl.NumberFormat` for locale-aware number formatting
- **Theme awareness**: Color classes that adapt to light/dark themes
- **Consistent iconography**: Using Lucide React icons that match shadcn/ui's aesthetic

### 4. Main Component Structure

Now let's build the main component function, starting with the basic structure and props destructuring:

```tsx
function MetricCard({
  title,
  description,
  value,
  change,
  variant = 'default',
  status = 'neutral',
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card
      {...props}
    >
      {/* Card Header with title and description */}
      <CardHeader className={cn(
        'flex flex-row items-center justify-between space-y-0',
        variant === 'compact' && 'pb-2'
      )}>
        <div className="space-y-1">
          <CardTitle className={cn(
            variant === 'compact' ? 'text-sm' : 'text-base'
          )}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className={cn(
              variant === 'compact' && 'text-xs'
            )}>
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      {/* Card Content with value and trend indicator */}
      <CardContent className={cn(
        variant === 'compact' && 'pt-0'
      )}>
        <div className="flex items-baseline gap-2">
          <div className={cn(
            'font-bold',
            variant === 'compact' ? 'text-xl' : 'text-2xl lg:text-3xl'
          )}>
            {formatValue(value)}
          </div>

          {change && (
            <div className={cn(
              'flex items-center gap-1 text-sm',
              getTrendColor(change.trend)
            )}>
              {getTrendIcon(change.trend)}
              <span className="font-medium">
                {Math.abs(change.value)}%
              </span>
              <span className="text-muted-foreground">
                {change.period}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

MetricCard.displayName = 'MetricCard'
```

### 5. Using the Component

Now that we've built our MetricCard component, let's see how to use it:

```tsx
export { MetricCard }

// Usage examples
function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Revenue"
        description="Last 30 days"
        value={45231.89}
        change={{ value: 20.1, period: "from last month", trend: "up" }}
        variant="default"
        status="success"
      />

      <MetricCard
        title="Active Users"
        value={2350}
        change={{ value: 180.1, period: "from last month", trend: "up" }}
        variant="compact"
      />

      <MetricCard
        title="Conversion Rate"
        description="Sales conversion"
        value="12.5%"
        change={{ value: 2.5, period: "from last week", trend: "down" }}
        variant="default"
        status="warning"
      />
    </div>
  )
}
```

## Key Architectural Decisions

Our MetricCard component demonstrates several important patterns for custom shadcn/ui components:

- **Composition over Inheritance**: We build on existing shadcn/ui components (`Card`, `CardHeader`,
  `CardContent`) rather than creating everything from scratch. This ensures visual consistency and reduces
  code duplication.
- **Type Safety First**: The comprehensive TypeScript interfaces provide excellent developer experience with
  autocomplete, validation, and clear documentation of what props are available.
- **Theme Integration**: Using CSS custom properties and semantic color classes ensures our component works
  seamlessly with both light and dark themes.
- **Variant System**: The `class-variance-authority` pattern allows for flexible styling while maintaining
  consistency with other shadcn/ui components.
- **Accessibility by Default**: Proper semantic HTML structure, ARIA labels, and keyboard navigation support
  ensure the component works for all users.

```yaml
quiz:
  question:
    'When creating custom components that extend shadcn/ui, what is the most critical factor for maintaining
    design system consistency?'
  choices:
    - id: 'colors'
      text: 'Using the exact same color palette'
    - id: 'tokens'
      text: 'Following the same design token system and CSS custom properties'
    - id: 'sizing'
      text: 'Matching component sizes exactly'
    - id: 'animations'
      text: 'Implementing identical animation patterns'
  correctAnswerId: 'tokens'
  feedback:
    "{\n    correct: 'Correct! Following the same design token system and CSS custom properties ensures your
    custom components adapt to theme changes, maintain visual consistency, and integrate seamlessly with
    existing components.',\n    incorrect: 'Consider what makes shadcn/ui components work together cohesively
    across different themes and contexts. The key is the underlying token system that powers the design
    language.'\n  }"
```

## Complex Component Patterns

For more advanced components like file uploads, timelines, or data visualizations, the same foundational
principles apply but with additional considerations:

### Key Patterns for Complex Components

**State Management**

- Use multiple related state pieces thoughtfully
- Implement proper cleanup for event listeners and async operations
- Consider state reduction patterns for complex interactions

**Event Handling**

- Optimize callbacks with `useCallback` to prevent unnecessary re-renders
- Handle browser events properly (preventDefault, stopPropagation)
- Implement accessibility patterns (keyboard navigation, screen reader support)

**Progressive Enhancement**

- Start with basic functionality that works without JavaScript
- Layer on enhanced interactions (drag-and-drop, real-time updates)
- Provide fallbacks for unsupported features

**Component Architecture**

- Break complex components into smaller, focused sub-components
- Use composition patterns to allow customization
- Provide render props or children functions for maximum flexibility

\*\*Note: Component API Design Principles\*\*

When creating custom shadcn/ui components:

- **Follow familiar patterns** from existing shadcn/ui components
- **Use consistent component patterns** for proper composition
- **Implement variant props** with class-variance-authority
- **Support theming** through CSS custom properties
- **Maintain accessibility** with proper ARIA attributes and keyboard navigation
- **Provide extensibility** through render props or composition patterns

\*\*Reflection:\*\* Consider a complex component your application needs that doesn't exist in shadcn/ui. How
would you approach designing its API to be both powerful and easy to use? What are the key interaction
patterns, customization options, and integration points you'd need to consider? How would you ensure it feels
native to the shadcn/ui ecosystem?

## Next Steps

Creating custom components that extend shadcn/ui requires balancing innovation with consistency. By following
established patterns for theming, accessibility, and API design, we can build sophisticated components that
feel native to the shadcn/ui ecosystem while solving unique application needs.

Remember these key principles for successful custom component development:

- **Maintain design token consistency** through CSS custom properties and theming
- **Follow established API patterns** for familiarity and predictability
- **Implement proper accessibility** with ARIA attributes and keyboard navigation
- **Provide extensibility** through composition and render prop patterns

In our next lesson, we'll explore strategies for sharing these custom components across teams, including
documentation approaches, testing patterns, and distribution strategies that make your components truly
reusable in professional environments.

---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
