# File Patch Diff Generator

Side-by-side visual diff for code comparison.

## Installation

```bash
npm install react-diff-viewer-continued diff
```

## Usage

```tsx
import DiffView from "./DiffView";

<DiffView
  oldText="const x = 1;"
  newText="const x = 2;"
  title="config.ts"
/>
```

## Use Cases

- AI code fixes
- Merge suggestions
- Template comparison
- Showing users exactly what changed
