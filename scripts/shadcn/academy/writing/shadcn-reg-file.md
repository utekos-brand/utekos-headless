---
title: 'Creating a shadcn Registry File'
description:
  'Learn how to package your custom shadcn/ui components as registry items for easy sharing and distribution
  across projects and teams.'
canonical_url: 'https://vercel.com/academy/shadcn-ui/creating-a-shadcn-registry-file'
md_url: 'https://vercel.com/academy/shadcn-ui/creating-a-shadcn-registry-file.md'
docset_id: 'vercel-academy'
doc_version: '1.0'
last_updated: '2026-06-17T08:11:50.897Z'
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

# Creating a shadcn Registry File

Once you've built custom components that extend shadcn/ui, the next step is packaging them for distribution.
The shadcn/ui registry system allows you to create installable component packages that other developers can
add to their projects with a simple CLI command. This transforms your custom components from project-specific
code into reusable, shareable assets.

In this lesson, we'll take the `MetricCard` component from our previous lesson and create a proper registry
item file, following the same patterns used by the official shadcn/ui registry.

## Understanding Registry Structure

The shadcn/ui registry is a JSON-based system that defines component metadata, dependencies, and installation
instructions. Each registry item contains everything the CLI needs to properly install and configure a
component in a target project.

\*\*Note: Registry Benefits\*\*

Creating registry items for your custom components provides:

- **Easy installation** via `npx shadcn-ui@latest add <your-registry-url>`
- **Dependency management** with automatic installation of required packages
- **File organization** with proper component placement and structure
- **Version control** for component updates and maintenance
- **Documentation** through structured metadata and examples

## Registry Item Structure

Every registry item follows a specific JSON schema that defines the component's metadata, files, dependencies,
and installation requirements. Let's examine the key properties:

```json title="metric-card.json"
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "metric-card",
  "type": "registry:ui",
  "description": "A customizable metric display card with trend indicators and status variants.",
  "dependencies": ["class-variance-authority", "lucide-react"],
  "devDependencies": [],
  "registryDependencies": ["card", "badge"],
  "files": [
    {
      "path": "ui/metric-card.tsx",
      "type": "registry:component",
      "content": "..."
    }
  ],
  "tailwind": {
    "config": {
      "theme": {
        "extend": {}
      }
    }
  },
  "cssVars": {}
}
```

## Creating the MetricCard Registry Item

Let's build a complete registry item for our MetricCard component. We'll break this down into sections to
understand each part:

### 1. Basic Metadata

The metadata section provides essential information about the component:

- `name`: The identifier used in CLI commands
- `type`: Categorizes the component (registry:ui, registry:block, etc.)
- `description`: Clear explanation of what the component does
- `categories`: Searchable keywords for component discovery

```json title="metric-card.json"
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "metric-card",
  "type": "registry:ui",
  "description": "A customizable metric display card with trend indicators and status variants for displaying KPIs, analytics data, and performance metrics.",
  "categories": ["data-visualization", "metrics", "dashboard", "card"]
}
```

### 2. Dependencies Configuration

Dependencies are crucial for proper installation:

- `dependencies`: npm packages that need to be installed
- `devDependencies`: Development-only packages
- `registryDependencies`: Other shadcn/ui components this component relies on

```json title="metric-card.json"
{
  "dependencies": ["class-variance-authority", "lucide-react"],
  "devDependencies": [],
  "registryDependencies": ["card", "badge"]
}
```

### 3. Component Files

The `files` array contains the actual component code and any supporting files. To generate the `content`
property, you'll need to stringify the component code, like so:

```json title="metric-card.json"
{
  "files": [
    {
      "path": "ui/metric-card.tsx",
      "type": "registry:component",
      "content": "'use client'\n\nimport * as React from 'react'\nimport { cva, type VariantProps } from 'class-variance-authority'\nimport { cn } from '@/lib/utils'\nimport { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'\nimport { Badge } from '@/components/ui/badge'\nimport { TrendingUp, TrendingDown, Minus } from 'lucide-react'\n\ninterface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {\n  title: string\n  description?: string\n  value: string | number\n  change?: {\n    value: number\n    period: string\n    trend: 'up' | 'down' | 'neutral'\n  }\n  variant?: 'default' | 'compact' | 'detailed'\n  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral'\n}\n\nconst metricCardVariants = cva(\n  'transition-all duration-200',\n  {\n    variants: {\n      variant: {\n        default: 'p-6',\n        compact: 'p-4',\n        detailed: 'p-6 space-y-4',\n      },\n      status: {\n        success: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50',\n        warning: 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50',\n        error: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50',\n        info: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50',\n        neutral: '',\n      },\n    },\n    defaultVariants: {\n      variant: 'default',\n      status: 'neutral',\n    },\n  }\n)\n\n// Helper function to format numeric values with locale-aware formatting\nconst formatValue = (val: string | number) => {\n  if (typeof val === 'number') {\n    return new Intl.NumberFormat().format(val)\n  }\n  return val\n}\n\n// Helper function to get appropriate trend icon\nconst getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {\n  switch (trend) {\n    case 'up':\n      return <TrendingUp className=\"h-4 w-4 text-green-600 dark:text-green-400\" />\n    case 'down':\n      return <TrendingDown className=\"h-4 w-4 text-red-600 dark:text-red-400\" />\n    case 'neutral':\n      return <Minus className=\"h-4 w-4 text-muted-foreground\" />\n  }\n}\n\n// Helper function to get trend-appropriate text colors\nconst getTrendColor = (trend: 'up' | 'down' | 'neutral') => {\n  switch (trend) {\n    case 'up':\n      return 'text-green-600 dark:text-green-400'\n    case 'down':\n      return 'text-red-600 dark:text-red-400'\n    case 'neutral':\n      return 'text-muted-foreground'\n  }\n}\n\nfunction MetricCard({ \n  title, \n  description, \n  value, \n  change, \n  variant = 'default',\n  status = 'neutral',\n  className,\n  ...props \n}: MetricCardProps) {\n  return (\n    <Card\n      className={cn(metricCardVariants({ variant, status }), className)}\n      {...props}\n    >\n      <CardHeader className={cn(\n        'flex flex-row items-center justify-between space-y-0',\n        variant === 'compact' && 'pb-2'\n      )}>\n        <div className=\"space-y-1\">\n          <CardTitle className={cn(\n            variant === 'compact' ? 'text-sm' : 'text-base'\n          )}>\n            {title}\n          </CardTitle>\n          {description && (\n            <CardDescription className={cn(\n              variant === 'compact' && 'text-xs'\n            )}>\n              {description}\n            </CardDescription>\n          )}\n        </div>\n      </CardHeader>\n      \n      <CardContent className={cn(\n        variant === 'compact' && 'pt-0'\n      )}>\n        <div className=\"flex items-baseline gap-2\">\n          <div className={cn(\n            'font-bold',\n            variant === 'compact' ? 'text-xl' : 'text-2xl lg:text-3xl'\n          )}>\n            {formatValue(value)}\n          </div>\n          \n          {change && (\n            <div className={cn(\n              'flex items-center gap-1 text-sm',\n              getTrendColor(change.trend)\n            )}>\n              {getTrendIcon(change.trend)}\n              <span className=\"font-medium\">\n                {Math.abs(change.value)}%\n              </span>\n              <span className=\"text-muted-foreground\">\n                {change.period}\n              </span>\n            </div>\n          )}\n        </div>\n      </CardContent>\n    </Card>\n  )\n}\n\nMetricCard.displayName = 'MetricCard'\n\nexport { MetricCard, type MetricCardProps }"
    }
  ]
}
```

### 4. Configuration and Styling

This section handles:

- `tailwind`: Any additional Tailwind configuration needed
- `cssVars`: CSS custom properties for theming

Our `MetricCard` component doesn't need any additional Tailwind configuration, so we can leave it empty.

```json title="metric-card.json"
{
  "tailwind": {
    "config": {
      "theme": {
        "extend": {}
      }
    }
  },
  "cssVars": {
    "light": {},
    "dark": {}
  }
}
```

## Complete Registry Item File

Here's the complete registry item file for our MetricCard component:

```json title="metric-card.json"
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "metric-card",
  "type": "registry:ui",
  "description": "A customizable metric display card with trend indicators and status variants for displaying KPIs, analytics data, and performance metrics.",
  "categories": ["data-visualization", "metrics", "dashboard", "card"],
  "dependencies": ["class-variance-authority", "lucide-react"],
  "devDependencies": [],
  "registryDependencies": ["card", "badge"],
  "files": [
    {
      "path": "ui/metric-card.tsx",
      "type": "registry:component",
      "content": "'use client'\n\nimport * as React from 'react'\nimport { cva, type VariantProps } from 'class-variance-authority'\nimport { cn } from '@/lib/utils'\nimport { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'\nimport { Badge } from '@/components/ui/badge'\nimport { TrendingUp, TrendingDown, Minus } from 'lucide-react'\n\ninterface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {\n  title: string\n  description?: string\n  value: string | number\n  change?: {\n    value: number\n    period: string\n    trend: 'up' | 'down' | 'neutral'\n  }\n  variant?: 'default' | 'compact' | 'detailed'\n  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral'\n}\n\nconst metricCardVariants = cva(\n  'transition-all duration-200',\n  {\n    variants: {\n      variant: {\n        default: 'p-6',\n        compact: 'p-4',\n        detailed: 'p-6 space-y-4',\n      },\n      status: {\n        success: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50',\n        warning: 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50',\n        error: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50',\n        info: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50',\n        neutral: '',\n      },\n    },\n    defaultVariants: {\n      variant: 'default',\n      status: 'neutral',\n    },\n  }\n)\n\n// Helper function to format numeric values with locale-aware formatting\nconst formatValue = (val: string | number) => {\n  if (typeof val === 'number') {\n    return new Intl.NumberFormat().format(val)\n  }\n  return val\n}\n\n// Helper function to get appropriate trend icon\nconst getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {\n  switch (trend) {\n    case 'up':\n      return <TrendingUp className=\"h-4 w-4 text-green-600 dark:text-green-400\" />\n    case 'down':\n      return <TrendingDown className=\"h-4 w-4 text-red-600 dark:text-red-400\" />\n    case 'neutral':\n      return <Minus className=\"h-4 w-4 text-muted-foreground\" />\n  }\n}\n\n// Helper function to get trend-appropriate text colors\nconst getTrendColor = (trend: 'up' | 'down' | 'neutral') => {\n  switch (trend) {\n    case 'up':\n      return 'text-green-600 dark:text-green-400'\n    case 'down':\n      return 'text-red-600 dark:text-red-400'\n    case 'neutral':\n      return 'text-muted-foreground'\n  }\n}\n\nfunction MetricCard({ \n  title, \n  description, \n  value, \n  change, \n  variant = 'default',\n  status = 'neutral',\n  className,\n  ...props \n}: MetricCardProps) {\n  return (\n    <Card\n      className={cn(metricCardVariants({ variant, status }), className)}\n      {...props}\n    >\n      <CardHeader className={cn(\n        'flex flex-row items-center justify-between space-y-0',\n        variant === 'compact' && 'pb-2'\n      )}>\n        <div className=\"space-y-1\">\n          <CardTitle className={cn(\n            variant === 'compact' ? 'text-sm' : 'text-base'\n          )}>\n            {title}\n          </CardTitle>\n          {description && (\n            <CardDescription className={cn(\n              variant === 'compact' && 'text-xs'\n            )}>\n              {description}\n            </CardDescription>\n          )}\n        </div>\n      </CardHeader>\n      \n      <CardContent className={cn(\n        variant === 'compact' && 'pt-0'\n      )}>\n        <div className=\"flex items-baseline gap-2\">\n          <div className={cn(\n            'font-bold',\n            variant === 'compact' ? 'text-xl' : 'text-2xl lg:text-3xl'\n          )}>\n            {formatValue(value)}\n          </div>\n          \n          {change && (\n            <div className={cn(\n              'flex items-center gap-1 text-sm',\n              getTrendColor(change.trend)\n            )}>\n              {getTrendIcon(change.trend)}\n              <span className=\"font-medium\">\n                {Math.abs(change.value)}%\n              </span>\n              <span className=\"text-muted-foreground\">\n                {change.period}\n              </span>\n            </div>\n          )}\n        </div>\n      </CardContent>\n    </Card>\n  )\n}\n\nMetricCard.displayName = 'MetricCard'\n\nexport { MetricCard, type MetricCardProps }"
    }
  ],
  "tailwind": {
    "config": {
      "theme": {
        "extend": {}
      }
    }
  },
  "cssVars": {
    "light": {},
    "dark": {}
  }
}
```

## Installation and Usage

Once your registry item is published, developers can install it using the shadcn/ui CLI:

```bash
npx shadcn-ui@latest add <your-registry-url>
```

The CLI will automatically:

- Install required npm dependencies (`class-variance-authority`, `lucide-react`)
- Install registry dependencies (`card`, `badge` components)
- Create the component file in the correct location
- Update import paths and configurations

```yaml
quiz:
  question: 'What is the primary benefit of creating registry items for custom shadcn/ui components?'
  choices:
    - id: 'performance'
      text: 'Improved component performance and optimization'
    - id: 'distribution'
      text: 'Easy distribution and installation across projects with dependency management'
    - id: 'styling'
      text: 'Better styling and theming capabilities'
    - id: 'validation'
      text: 'Automatic prop validation and type checking'
  correctAnswerId: 'distribution'
  feedback:
    "{\n    correct: 'Correct! Registry items enable easy distribution and installation of custom components
    across projects, with automatic dependency management and proper file organization.',\n    incorrect:
    'Think about what the registry system primarily solves - it\\'s about making components easily shareable
    and installable across different projects and teams.'\n  }"
```

## Registry Best Practices

When creating registry items for your custom components, follow these best practices:

- **Complete Dependencies**: Ensure all required packages are listed in the appropriate dependency arrays.
  Missing dependencies will cause installation failures.
- **Proper Imports**: Use the standard shadcn/ui import patterns (`@/components/ui/*`, `@/lib/utils`) to
  ensure compatibility across projects.
- **TypeScript Support**: Include comprehensive TypeScript definitions and export both the component and its
  prop types.
- **Theme Compatibility**: Test your components in both light and dark themes to ensure proper color handling.

\*\*Reflection:\*\* Consider your organization's component development workflow. What types of custom
components would benefit most from being packaged as registry items? How would you structure a registry to
balance discoverability, maintainability, and ease of use? What governance and quality standards would you
establish for components in your registry?

## Next Steps

Creating registry items transforms your custom shadcn/ui components from project-specific code into reusable,
shareable assets. This approach enables component libraries, team collaboration, and consistent design systems
across multiple projects.

Key takeaways for successful registry item creation:

- **Structure follows standards** with proper metadata, dependencies, and file organization
- **Quality assurance** through comprehensive testing and documentation
- **Distribution strategy** that matches your team's needs and workflow
- **Maintenance planning** for updates, versioning, and breaking changes

But, how do we actually publish our registry items? In the next lesson, we'll explore how to publish our
components to our site, making them available to the entire shadcn/ui community.

---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
