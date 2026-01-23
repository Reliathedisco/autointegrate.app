# Docs Generator UI

Sidebar + MDX-ready content area.

## Usage

```
app/docs/layout.tsx  → DocsLayout
app/docs/page.tsx    → DocsHome
```

## Structure

```
app/docs/
├── layout.tsx
├── page.tsx
├── getting-started/
│   └── page.mdx
├── templates/
│   └── page.mdx
└── api/
    └── page.mdx
```

## MDX Support

Install `@next/mdx` for markdown docs:

```bash
npm install @next/mdx @mdx-js/loader
```
