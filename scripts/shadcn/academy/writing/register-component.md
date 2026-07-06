---
title: 'Publishing Your Components'
description:
  'Learn how to host and distribute your custom shadcn/ui registry items on the internet, making them
  installable via direct URLs and accessible to your team or the community.'
canonical_url: 'https://vercel.com/academy/shadcn-ui/publishing-your-components'
md_url: 'https://vercel.com/academy/shadcn-ui/publishing-your-components.md'
docset_id: 'vercel-academy'
doc_version: '1.0'
last_updated: '2026-06-17T08:12:10.632Z'
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

# Publishing Your Components

Publishing your components shouldn't require a full app or custom registry. If you just want to share a
component as fast as possible, you can use Vercel’s static hosting.

Here’s the simplest way to get your new `MetricCard` component live in seconds with Vercel.

## Step 1: Create a Folder

Make a folder with this structure:

```
my-component/
├── public/
│   └── metric-card.json
└── vercel.json
```

Put your registry item JSON (e.g. `metric-card.json`) in the `public/` folder.

## Step 2: Add a `vercel.json`

Create a `vercel.json` file next to `public/` with the following:

```json title="vercel.json"
{
  "headers": [
    {
      "source": "/(.*).json",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ]
    }
  ]
}
```

This ensures your JSON is served with the correct CORS and content headers.

## Step 3: Deploy to Vercel

From the root of your folder, run:

```bash
vercel --prod
```

and answer the prompts to deploy your project.

When it's done, your file will be live at something like:

```
https://your-project-name.vercel.app/metric-card.json
```

## Step 4: Install the Component

Anyone can now run:

```bash
npx shadcn@latest add https://your-project-name.vercel.app/metric-card.json
```

No npm package, no build step, no complexity. How cool is that?

## Next Steps

In the next chapter, we'll explore advanced patterns for building sophisticated and interactive components
that showcase the full power of the shadcn/ui ecosystem.

---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
