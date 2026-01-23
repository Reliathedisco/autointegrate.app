# Repo Tree UI

Pass a folder/file JSON to render a real-time expandable tree.

## Usage

```tsx
import RepoTree from "./RepoTree";

const tree = [
  {
    name: "src",
    type: "folder",
    children: [
      { name: "index.ts", type: "file" },
      { name: "utils.ts", type: "file" },
    ],
  },
  { name: "README.md", type: "file" },
];

<RepoTree tree={tree} />
```

## Features

- Zero server load (client-side only)
- Expandable folders
- Works with any JSON tree structure
