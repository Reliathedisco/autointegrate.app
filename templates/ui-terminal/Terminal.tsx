"use client";

import { useState, useRef, useEffect } from "react";

const fakeFS: Record<string, string[]> = {
  "/": ["templates", "src", "README.md"],
  "/templates": ["stripe", "clerk", "resend", "openai"],
  "/src": ["index.ts", "utils.ts", "config.ts"],
};

const fileContents: Record<string, string> = {
  "README.md": "# AutoIntegrate\n\nThe ultimate integration platform.",
  "index.ts": "export * from './utils';",
};

export default function Terminal() {
  const [lines, setLines] = useState<string[]>([
    "AutoIntegrate Terminal v1.0",
    "Type 'help' to see available commands",
    "",
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("/");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const run = (cmd: string): string => {
    const [command, ...args] = cmd.trim().split(" ");

    switch (command) {
      case "help":
        return "Commands: ls, cd <dir>, cat <file>, pwd, tree, clear";
      case "ls":
        return fakeFS[cwd]?.join("  ") || "Directory not found";
      case "pwd":
        return cwd;
      case "cd":
        const target = args[0];
        if (target === "..") {
          setCwd("/");
          return "";
        }
        const newPath = cwd === "/" ? `/${target}` : `${cwd}/${target}`;
        if (fakeFS[newPath]) {
          setCwd(newPath);
          return "";
        }
        return `cd: no such directory: ${target}`;
      case "cat":
        return fileContents[args[0]] || `cat: ${args[0]}: No such file`;
      case "tree":
        return Object.entries(fakeFS)
          .map(([path, files]) => `${path}\n  ${files.join("\n  ")}`)
          .join("\n");
      case "clear":
        setLines([]);
        return "";
      default:
        return `command not found: ${command}`;
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const out = run(input);
    setLines((prev) => [...prev, `${cwd} $ ${input}`, ...(out ? [out] : [])]);
    setInput("");
  };

  return (
    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-80 overflow-auto">
      {lines.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap">{l}</div>
      ))}
      <form onSubmit={submit} className="flex">
        <span>{cwd} $ </span>
        <input
          className="bg-transparent text-green-400 outline-none flex-1 ml-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
      </form>
      <div ref={bottomRef} />
    </div>
  );
}
