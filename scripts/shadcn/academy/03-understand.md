---
title: 'Understanding components.json'
description:
  'Learn how the components.json file serves as the central configuration for your shadcn/ui setup,
  controlling everything from file paths to styling preferences.'
canonical_url: 'https://vercel.com/academy/shadcn-ui/components-json'
md_url: 'https://vercel.com/academy/shadcn-ui/components-json.md'
docset_id: 'vercel-academy'
doc_version: '1.0'
last_updated: '2026-06-17T08:15:16.377Z'
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

# Understanding components.json

The `components.json` file is the central nervous system of your shadcn/ui setup. It tells the CLI where to
put files, how to structure imports, and what styling approach to use. Understanding this file is crucial
because it controls how every component gets added to your project.

Let's explore what this file does and how to configure it for your specific needs.

## A Complete components.json Example

Here's what a typical `components.json` file looks like:

```json title="components.json"
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

Let's break down each section and understand what it controls.

## Schema Validation

The schema reference provides IDE support with autocompletion and validation. This helps prevent configuration
errors and makes it easier to discover available options.

```json title="components.json"
{
  "$schema": "https://ui.shadcn.com/schema.json"
}
```

When you have this schema reference, your editor will:

- Provide autocompletion for configuration options
- Validate your configuration and show errors
- Display documentation for each field
- Suggest valid values for enum fields

## Style Configuration

The `style` field determines which visual style variant to use. Currently, shadcn/ui primarily uses
`"default"`, but this field allows for future style variants or custom themes.

```json title="components.json"
{
  "style": "default"
}
```

This configuration affects:

- The base component styling
- Default color schemes
- Typography choices
- Spacing and sizing defaults

## React Server Components Support

The `rsc` (React Server Components) flag tells the CLI whether your project uses React Server Components. This
affects how components are generated. When set to true, client-side components are generated with
`"use client"` directives when needed.

```json title="components.json"
{
  "rsc": true
}
```

\*\*Note: Next.js App Router Default\*\*

If you're using Next.js 13+ with the App Router, set `rsc: true`. This ensures components work correctly in
both server and client contexts.

## TypeScript Configuration

The `tsx` field determines whether components are generated as TypeScript (`.tsx`) or JavaScript (`.jsx`)
files. When set to true, components include full TypeScript type definitions and interfaces.

```json title="components.json"
{
  "tsx": true
}
```

Most developers should use `tsx: true` for the superior developer experience.

## Tailwind CSS Configuration

The `tailwind` section is the most complex part of the configuration:

```json
{
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  }
}
```

### Config File Path

When using an older version of shadcn/ui, this tells the CLI where your Tailwind configuration file is located
e.g. `tailwind.config.js`. The CLI needs to modify this file to add component-specific configuration. Starting
from the fourth major update of shadcn/ui, this is not needed as Tailwind uses the `globals.css` file instead.

```json
{
  "config": ""
}
```

### CSS File Path

This specifies where your global CSS file is located. The CLI will add CSS custom properties and base styles
to this file.

```json
{
  "css": "app/globals.css"
}
```

### Base Color

The base color determines the default neutral color palette for your components.

```json
{
  "baseColor": "slate"
}
```

Available options include:

- `slate`
- `gray`
- `zinc`
- `neutral`
- `stone`

This affects the appearance of borders, muted text, and other neutral elements throughout your components.

### CSS Variables

This is a crucial setting that determines how your design system is implemented. When set to true, design
tokens are implemented as CSS custom properties.

```json
{
  "cssVariables": true
}
```

This makes it easy to customize and theme your components. Most projects should use `cssVariables: true` for
maximum flexibility.

### Tailwind Prefix

If your Tailwind configuration uses a prefix (e.g., `tw-`), specify it here. The CLI will ensure all generated
classes use the correct prefix.

```json
{
  "prefix": ""
}
```

Specifying a prefix of `tw-` would generate classes like `tw-bg-primary` instead of `bg-primary`.

## Path Aliases

Path aliases determine where components and utilities are placed in your project:

```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Components Alias

This tells the CLI where to place component files.

```json
{
  "components": "@/components"
}
```

With this configuration:

```bash
npx shadcn@latest add button
```

Will create: `components/ui/button.tsx`

### Utils Alias

This specifies where utility functions are located.

```json
{
  "utils": "@/lib/utils"
}
```

Components will import the `cn` function from this path:

```tsx
import { cn } from "@/lib/utils"
```

```yaml
quiz:
  question: "What happens when you set 'cssVariables: false' in components.json?"
  choices:
    - id: 'no-css'
      text: 'CSS custom properties are not used at all'
    - id: 'direct-values'
      text: 'Design tokens are implemented as direct Tailwind color values'
    - id: 'inline-styles'
      text: 'Components use inline styles instead of CSS classes'
    - id: 'scss-variables'
      text: 'SCSS variables are used instead of CSS custom properties'
  correctAnswerId: 'direct-values'
  feedback:
    "{\n    correct: 'Correct! When cssVariables is false, design tokens are implemented as direct Tailwind
    color values rather than CSS custom properties.',\n    incorrect: 'The cssVariables setting specifically
    controls whether CSS custom properties are used for design tokens or if direct Tailwind values are used
    instead.'\n  }"
```

## The CLI's Role

The `components.json` file is consumed by the shadcn/ui CLI to:

1. **Determine file placement**: Where to create component files
2. **Configure imports**: How components should import utilities and other dependencies
3. **Apply styling**: Which classes and styling approach to use
4. **Update configuration**: How to modify your Tailwind config and CSS files
5. **Handle TypeScript**: Whether to generate TypeScript or JavaScript files

## Initializing components.json

You can create a `components.json` file using the CLI:

```bash
npx shadcn@latest init
```

This command will:

1. Ask you questions about your project setup
2. Generate a `components.json` file based on your answers
3. Update your `tailwind.config.js` file
4. Add necessary CSS custom properties to your global CSS file
5. Create a `lib/utils.ts` file with the `cn` utility function

The interactive setup ensures your configuration matches your project structure and preferences.

\*\*Common Configuration Issues\*\*

Wrong file paths: Make sure your `css` and `config` paths match your actual file locations

Import alias conflicts: Ensure your aliases don't conflict with existing imports in your project

RSC mismatch: Set `rsc: true` for Next.js App Router projects, `false` for others

Tailwind prefix: If you use a Tailwind prefix, make sure it's specified in the config

## Modifying Your Configuration

You can update your `components.json` file at any time. Changes will affect newly added components, but won't
modify existing components automatically.

If you change fundamental settings (like `cssVariables` or `baseColor`), you may need to:

1. Regenerate existing components
2. Update your global CSS file
3. Modify your Tailwind configuration

## Configuration Best Practices

1. **Use TypeScript**: Set `tsx: true` for better developer experience
2. **Enable CSS variables**: Set `cssVariables: true` for maximum flexibility
3. **Choose appropriate RSC setting**: Match your React setup
4. **Use semantic aliases**: Stick with `@/components` and `@/lib/utils` for consistency
5. **Document your choices**: Add comments to explain project-specific decisions

\*\*Reflection:\*\* Think about a project you're working on or planning. What would your ideal components.json
configuration look like? Consider your project structure, TypeScript usage, and styling approach.

## What's Next

Now that you understand how `components.json` configures your entire shadcn/ui setup, you're ready to dive
deeper into the foundation that makes it all possible. In the next section, we'll explore Radix UI primitives
– the accessible, unstyled components that provide the robust behavior underlying every shadcn/ui component.

Understanding primitives is crucial because they're what makes shadcn/ui components so reliable and
accessible. They handle all the complex interaction patterns so you can focus on styling and customization.

---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
