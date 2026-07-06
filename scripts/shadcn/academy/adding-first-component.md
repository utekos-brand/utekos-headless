---
title: 'Adding Your First Component'
description:
  'Walk through the complete process of adding your first shadcn/ui component, understanding what happens
  behind the scenes, and exploring how to use it effectively.'
canonical_url: 'https://vercel.com/academy/shadcn-ui/adding-your-first-component'
md_url: 'https://vercel.com/academy/shadcn-ui/adding-your-first-component.md'
docset_id: 'vercel-academy'
doc_version: '1.0'
last_updated: '2026-06-17T08:04:49.298Z'
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

# Adding Your First Component

Now it's time to experience the shadcn/ui workflow firsthand. We'll walk through adding your first component
step by step, understanding exactly what happens when you run the CLI command, and exploring how to use the
component effectively. This hands-on experience will solidify your understanding of how all the concepts we've
covered work together in practice.

## The shadcn/ui CLI Workflow

The shadcn/ui CLI is the bridge between the component registry and your project. It handles downloading,
configuring, and installing components with all the necessary dependencies and configurations.

Let's start with a practical example by adding a Card component to your project.

## Adding the Card Component

From your project root directory, run:

```bash
npx shadcn@latest add card
```

You'll see output similar to this:

```
✔ Checking registry.
✔ Created 1 file:
  - components/ui/card.tsx
```

Let's examine what just happened behind the scenes.

## Understanding What Was Created

The CLI created the complete Card component implementation in the components folder (specified in our
`components.json` file):

```tsx title="components/ui/card.tsx"
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
```

This is a complete, production-ready component that you now own. Let's break down what you're looking at.

\*\*Note: You Own This Code\*\*

This component is now part of your codebase. You can modify any aspect of it – change the styling, add new
variants, adjust the behavior, or even completely rewrite it. There's no external dependency to worry about.

## Using Your First Component

Let's put the Card component to work. Update your `src/app/page.tsx`:

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">My shadcn/ui Project</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Learn the basics of shadcn/ui component development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card demonstrates the basic structure and styling of shadcn/ui components.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design System</CardTitle>
            <CardDescription>
              Explore the systematic approach to UI development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>shadcn/ui provides a complete design system with consistent tokens and patterns.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customization</CardTitle>
            <CardDescription>
              Discover how to customize components for your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Since you own the component code, you can modify anything to match your requirements.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
```

When you save this file and check your browser, you'll see three beautifully styled cards with consistent
spacing, typography, and visual hierarchy.

## Adding More Components

Let's add a few more components to build a more complete interface:

```bash
npx shadcn@latest add button badge avatar
```

The CLI will install all three components and their dependencies:

```
✔ Checking registry.
✔ Installing dependencies.
✔ Created 3 files:
  - components/ui/button.tsx
  - components/ui/badge.tsx
  - components/ui/avatar.tsx
```

Now let's enhance our page with these new components:

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My shadcn/ui Project</h1>
        <Button>Get Started</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Getting Started</CardTitle>
              <Badge>New</Badge>
            </div>
            <CardDescription>
              Learn the basics of shadcn/ui component development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">shadcn</p>
                <p className="text-xs text-muted-foreground">Component Author</p>
              </div>
            </div>
            <p className="text-sm">
              This card demonstrates the basic structure and styling of shadcn/ui components.
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              Learn More
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Design System</CardTitle>
              <Badge variant="secondary">Core</Badge>
            </div>
            <CardDescription>
              Explore the systematic approach to UI development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              shadcn/ui provides a complete design system with consistent tokens and patterns.
            </p>
            <div className="flex gap-2">
              <Button variant="default" size="sm">Primary</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customization</CardTitle>
              <Badge variant="outline">Advanced</Badge>
            </div>
            <CardDescription>
              Discover how to customize components for your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Since you own the component code, you can modify anything to match your requirements.
            </p>
            <Button variant="destructive" size="sm" className="w-full">
              Customize Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
```

```yaml
quiz:
  question: "What happens when you run 'npx shadcn@latest add button'?"
  choices:
    - id: 'package'
      text: 'It installs the button component as an npm package'
    - id: 'copy'
      text: 'It copies the button component source code into your project'
    - id: 'cdn'
      text: 'It links to the button component from a CDN'
    - id: 'template'
      text: 'It creates a template file that you need to fill out'
  correctAnswerId: 'copy'
  feedback:
    "{\n    correct: 'Correct! The shadcn/ui CLI copies the complete source code of the component into your
    project, giving you full ownership and control.',\n    incorrect: 'The shadcn/ui CLI follows the
    copy-paste model, downloading the complete source code into your project rather than creating a
    dependency.'\n  }"
```

## Component Variants and Props

Most shadcn/ui components come with built-in variants that you can use immediately:

### Button Variants

Let's look at some examples of how to use the Button component with different variants:

```tsx title="button-examples.tsx"
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Button Sizes

Buttons also have different sizes:

```tsx title="button-sizes.tsx"
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Star className="h-4 w-4" />
</Button>
```

### Badge Variants

Badges have different variants to control their appearance:

```tsx title="badge-variants.tsx"
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

## Adding All Components

If you want to add all components at once, you can run the following command:

```bash
npx shadcn@latest add --all
```

This will install all components and their dependencies.

## What's Next

Congratulations! You've successfully added your first shadcn/ui components and understand the complete
workflow. You can now:

✅ **Add components** using the CLI ✅ **Understand component structure** and patterns ✅ **Use variants and
props** effectively ✅ **Read component source code** for insights

In our next lesson, we'll dive into customization by learning how to override styles with Tailwind CSS. You'll
discover how to modify component appearance while maintaining the systematic approach that makes shadcn/ui so
powerful.

---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
