---
title: 'Overriding Styles with Tailwind'
description:
  'Master the art of customizing shadcn/ui components using Tailwind CSS, from simple class additions to
  systematic design token modifications.'
canonical_url: 'https://vercel.com/academy/shadcn-ui/overriding-styles-with-tailwind'
md_url: 'https://vercel.com/academy/shadcn-ui/overriding-styles-with-tailwind.md'
docset_id: 'vercel-academy'
doc_version: '1.0'
last_updated: '2026-06-17T08:08:16.973Z'
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

# Overriding Styles with Tailwind

One of shadcn/ui's greatest strengths is how easily you can customize components using Tailwind CSS. Whether
you need simple tweaks or complete visual overhauls, the systematic approach to styling makes customization
both powerful and maintainable. Let's explore the different levels of customization and learn how to modify
components effectively.

## Understanding the Customization Hierarchy

shadcn/ui provides multiple levels of customization, each with different use cases and implications:

- **Level 1: Utility Class Additions**: Add classes directly to component instances for one-off
  customizations.
- **Level 2: Design Token Modifications**: Change CSS custom properties to affect all components
  systematically.
- **Level 3: Component Source Editing**: Modify the component source code for project-wide changes.

Let's explore each level with practical examples.

## Level 1: Utility Class Additions

The most common and straightforward customization approach is adding Tailwind utility classes:

### Basic Class Addition

Let's start with a simple example of adding a class to a component:

```tsx title="button-customization.tsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CustomizedComponents() {
  return (
    <div className="p-8 space-y-6">
      {/* Add spacing and width utilities */}
      <Button className="w-full py-3">
        Full Width Button
      </Button>

      {/* Add border and shadow customizations */}
      <Card className="border-dashed border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-purple-600">
            Custom Styled Card
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-linear-to-r from-blue-50 to-purple-50">
          <p>This card has custom border, shadow, and background styling.</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Class Merging with `cn()`

The `cn()` utility intelligently merges classes, handling conflicts properly:

```tsx title="button-customization.tsx"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function CustomButton({ className, ...props }) {
  return (
    <Button
      className={cn(
        "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
        "shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}
```

The `cn()` function uses `tailwind-merge` to handle class conflicts intelligently:

```tsx
// Example of conflict resolution
cn("bg-red-500", "bg-blue-500") // Result: "bg-blue-500" (later class wins)
cn("px-4 py-2", "p-6")          // Result: "p-6" (more specific class wins)
```

\*\*Note: Tailwind Merge Magic\*\*

The `tailwind-merge` utility understands Tailwind's class precedence and automatically resolves conflicts.
This means you can confidently override default styles without worrying about CSS specificity issues.

### Responsive Customizations

You can use responsive classes to customize the component for different screen sizes:

```tsx title="button-customization.tsx"
<Card className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  <CardContent className="p-4 md:p-6 lg:p-8">
    <Button className="w-full sm:w-auto sm:px-8">
      Responsive Button
    </Button>
  </CardContent>
</Card>
```

### State-Based Customizations

You can also use state-based classes to customize the component for different states:

```tsx title="button-customization.tsx"
<Button className="
  data-[state=open]:bg-green-500
  data-[state=closed]:bg-gray-500
  hover:scale-105
  active:scale-95
  disabled:opacity-50
  disabled:cursor-not-allowed
">
  State-Aware Button
</Button>
```

## Level 2: Design Token Modifications

For systematic changes that affect multiple components, we can modify the CSS custom properties.

### Understanding the Token System

Your `globals.css` file contains the design token definitions. You can read more about this on the
[shadcn/ui docs](https://ui.shadcn.com/docs/theming).

```css title="app/globals.css"
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.269 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.371 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.439 0 0);
}
```

### Customizing Brand Colors

You can customize the brand colors by modifying the design tokens in your `globals.css` file.

```css title="app/globals.css"
/* Update primary colors for your brand */
:root {
  --primary: 260 100% 65%; /* Purple brand color */
  --primary-foreground: 0 0% 100%; /* White text */
  --accent: 260 50% 95%; /* Light purple accent */
  --accent-foreground: 260 100% 40%; /* Dark purple text */
}

.dark {
  --primary: 260 100% 70%; /* Lighter purple for dark mode */
  --primary-foreground: 260 20% 10%; /* Dark text */
  --accent: 260 20% 15%; /* Dark purple accent */
  --accent-foreground: 260 50% 80%; /* Light purple text */
}
```

### Customizing Border Radius

You can customize the border radius by modifying the design tokens in your `globals.css` file.

```css title="app/globals.css"
/* Make everything more rounded */
:root {
  --radius: 1rem; /* Increased from 0.5rem */
}

/* Or make everything more square */
:root {
  --radius: 0.25rem; /* Decreased from 0.5rem */
}
```

### Creating Theme Variants

You can also create theme variants by creating a new class in your `globals.css` file.

```css title="app/globals.css"
.theme-ocean {
  --primary: 200 100% 50%; /* Ocean blue */
  --primary-foreground: 0 0% 100%;
  --secondary: 200 20% 90%;
  --secondary-foreground: 200 100% 30%;
  --accent: 180 100% 85%;
  --accent-foreground: 180 100% 25%;
  --muted: 200 20% 95%;
  --muted-foreground: 200 20% 40%;
}

.theme-forest {
  --primary: 120 60% 40%; /* Forest green */
  --primary-foreground: 0 0% 100%;
  --secondary: 120 20% 90%;
  --secondary-foreground: 120 60% 20%;
  --accent: 80 60% 85%;
  --accent-foreground: 80 60% 25%;
  --muted: 120 20% 95%;
  --muted-foreground: 120 20% 40%;
}
```

Then apply themes at the component or page level:

```tsx title="button-customization.tsx"
<div className="theme-ocean">
  <Card>
    <CardHeader>
      <CardTitle>Ocean Theme</CardTitle>
    </CardHeader>
    <CardContent>
      <Button>Ocean Button</Button>
    </CardContent>
  </Card>
</div>

<div className="theme-forest">
  <Card>
    <CardHeader>
      <CardTitle>Forest Theme</CardTitle>
    </CardHeader>
    <CardContent>
      <Button>Forest Button</Button>
    </CardContent>
  </Card>
</div>
```

```yaml
quiz:
  question:
    'What is the advantage of modifying CSS custom properties instead of adding Tailwind classes for brand
    color changes?'
  choices:
    - id: 'performance'
      text: 'Better performance and smaller bundle size'
    - id: 'systematic'
      text: 'Changes apply systematically to all components using those tokens'
    - id: 'compatibility'
      text: 'Better browser compatibility for older browsers'
    - id: 'specificity'
      text: 'Avoids CSS specificity conflicts'
  correctAnswerId: 'systematic'
  feedback:
    "{\n    correct: 'Correct! Modifying CSS custom properties changes the design tokens used throughout your
    entire design system, ensuring consistent brand colors across all components.',\n    incorrect: 'While CSS
    custom properties may have other benefits, their primary advantage for theming is systematic application
    across all components that use those design tokens.'\n  }"
```

## Level 3: Component Source Editing

For project-wide changes, edit the component source code directly:

### Adding Default Classes

By going into the component source code, you can modify the default and variant classes for the component.

```tsx title="components/ui/button.tsx"
const buttonVariants = cva(
  // Add your default classes here
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        // ... other variants
      },
      // ... rest of variants
    }
  }
)
```

### Modifying Default Styling

You can also modify the default styling for the component.

```tsx title="components/ui/card.tsx"
// Change the default card styling
const Card = ({ className, ...props }) => (
  <div
    className={cn(
      // Modified default styling
      "rounded-xl border-2 bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow duration-300",
      className
    )}
    {...props}
  />
);
```

### Adding New Props

You can add new props to the component. This is useful for programatic styling.

```tsx title="components/ui/card.tsx"
interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  highlight?: boolean
  size?: "sm" | "md" | "lg"
}

const Card = ({ className, highlight, size = "md", ...props }) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      highlight && "border-primary shadow-md",
      size === "sm" && "p-4",
      size === "md" && "p-6",
      size === "lg" && "p-8",
      className
    )}
    {...props}
  />
);
```

\*\*Reflection:\*\* Consider a project where you need to match a specific brand. What combination of
customization levels would you use? When would you modify design tokens vs. add utility classes vs. edit
component source?

## What's Next

You now have the complete toolkit for customizing shadcn/ui components:

✅ **Utility class additions** for one-off customizations ✅ **Design token modifications** for systematic
theming ✅ **Component source editing** for project-wide changes

In our next lesson, we'll explore how to update and maintain your components as your project evolves,
including strategies for handling updates, managing breaking changes, and keeping your component library
healthy over time.

---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
