# AI Auto-Fix Assistant

AI-powered code fixing for TypeScript and JavaScript.

## Environment Variables

```env
OPENAI_API_KEY=
```

## Usage

```tsx
import AutoFix from "./AutoFix";

<AutoFix />
```

## API Endpoint

```
POST /api/ai/fix
Body: { "code": "broken code here" }
Response: { "fixed": "corrected code" }
```

## Features

- Paste broken code
- Get instant AI-powered fixes
- Works with TypeScript, JavaScript, and more
