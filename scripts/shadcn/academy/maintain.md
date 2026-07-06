---
title: 'Updating and Maintaining Components'
description:
  'Learn strategies for keeping your shadcn/ui components up-to-date, managing breaking changes, and
  maintaining a healthy component library over time.'
canonical_url: 'https://vercel.com/academy/shadcn-ui/updating-and-maintaining-components'
md_url: 'https://vercel.com/academy/shadcn-ui/updating-and-maintaining-components.md'
docset_id: 'vercel-academy'
doc_version: '1.0'
last_updated: '2026-06-17T08:08:39.857Z'
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

# Updating and Maintaining Components

One of the most important aspects of owning your component code is understanding how to maintain it over time.
Unlike traditional npm packages that update automatically, shadcn/ui components become part of your codebase,
which means you need strategies for updates, maintenance, and evolution. Let's explore how to keep your
components healthy and current.

## The Ownership Model: Benefits and Responsibilities

When you copy shadcn/ui components into your project, you gain complete ownership, but with that comes
responsibility:

### What You Gain

- **Complete control** over component behavior and styling
- **No breaking changes** from external updates
- **Custom modifications** that persist over time
- **Project-specific optimizations**

### What You Own

- **Security updates** for component dependencies
- **Bug fixes** and improvements
- **Feature additions** and enhancements
- **Breaking change management**

Understanding this balance is crucial for long-term success with shadcn/ui.

\*\*Note: Ownership vs. Maintenance\*\*

The copy-paste model means you control when and how components change, but you're also responsible for keeping
them secure, functional, and up-to-date. This trade-off gives you stability and control at the cost of
automatic updates.

## Proxying components

One way of customize shadcn/ui components without overwriting them is to proxy them - re-exporting or
pre-composing them with your own code. This makes the components much easier to update, however it effectively
doubles the component design system size and makes the ownership concept redundant.

A pre-composed / proxied component might look like this:

```tsx title="tooltip.tsx"
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type MyTooltipProps = {
  text: string;
  children: ReactNode;
}

export const MyTooltip = ({ text }: MyTooltipProps) => (
  <Tooltip>
    <TooltipTrigger>
      {children}
    </TooltipTrigger>
    <TooltipContent className="bg-black text-white">
      <p>{text}</p>
    </TooltipContent>
  </Tooltip>
)
```

Since this component doesn't directly overwrite the original `tooltip.tsx`, we can update the component like
so:

```sh
npx shadcn@latest add tooltip --overwrite
```

Or, to update all components:

```sh
npx shadcn@latest add --all --overwrite
```

## Overwriting components

The most common way to customize shadcn/ui components is to install the files and overwrite them directly as
intended. This breaks upstream updates, however you can use the shadcn/ui `diff` command to compare your
components with the latest versions:

```bash
# Check if a specific component has updates
npx shadcn@latest diff button

# Check all components
npx shadcn@latest diff
```

Then, you'll need to apply the new updates manually.

```yaml
quiz:
  question:
    "What is the recommended approach when shadcn/ui releases an update to a component you've heavily
    customized?"
  choices:
    - id: 'automatic'
      text: 'Automatically apply the update and lose your customizations'
    - id: 'ignore'
      text: 'Ignore the update to preserve your customizations'
    - id: 'review'
      text: 'Review the changes and selectively apply updates while preserving customizations'
    - id: 'recreate'
      text: 'Delete your component and reinstall from scratch'
  correctAnswerId: 'review'
  feedback:
    "{\n    correct: 'Correct! The best approach is to review updates carefully and selectively apply changes
    while preserving your custom modifications. This gives you the benefits of improvements while maintaining
    your customizations.',\n    incorrect: 'When you own component code, updates should be handled
    thoughtfully. Review changes and apply them selectively to maintain your customizations while getting
    benefits of improvements.'\n  }"
```

In our next lesson, we'll explore the `globals.css` file that powers shadcn/ui's theming system and learn how
CSS variables create a flexible, maintainable design language.

---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
