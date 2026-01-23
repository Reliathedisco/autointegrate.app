# Browser Sandbox Terminal

Lightweight bash-like environment in the browser.

## Usage

```tsx
import Terminal from "./Terminal";

<Terminal />
```

## Supported Commands

- `help` - Show available commands
- `ls` - List directory contents
- `cd <dir>` - Change directory
- `pwd` - Print working directory
- `cat <file>` - Display file contents
- `tree` - Show directory tree
- `clear` - Clear terminal

## Customization

Modify `fakeFS` and `fileContents` objects to match your project structure.

## Use Cases

- Interactive demos
- Sandbox environments
- Template exploration
- Learning tools
