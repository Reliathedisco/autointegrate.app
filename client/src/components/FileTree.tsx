import { useState } from "react";

export interface TreeNode {
  name: string;
  path: string;
  relativePath: string;
  type: "folder" | "file";
  children: TreeNode[];
  size?: number;
  extension?: string;
}

interface FileTreeProps {
  tree: TreeNode[];
  onFileSelect: (node: TreeNode) => void;
  selectedFile?: string;
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  onFileSelect: (node: TreeNode) => void;
  selectedFile?: string;
}

function TreeItem({ node, depth, onFileSelect, selectedFile }: TreeItemProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  
  const isSelected = node.relativePath === selectedFile;
  const isFolder = node.type === "folder";
  
  const icon = isFolder 
    ? (expanded ? "📂" : "📁") 
    : getFileIcon(node.extension || "");
  
  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-sm transition-colors ${
          isSelected 
            ? "bg-blue-100 text-blue-800" 
            : "hover:bg-gray-100"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            setExpanded(!expanded);
          } else {
            onFileSelect(node);
          }
        }}
      >
        <span className="w-4 text-center">
          {isFolder && (
            <span className="text-xs text-gray-400">
              {expanded ? "▼" : "▶"}
            </span>
          )}
        </span>
        <span>{icon}</span>
        <span className="truncate flex-1">{node.name}</span>
        {node.size && (
          <span className="text-xs text-gray-400">
            {formatSize(node.size)}
          </span>
        )}
      </div>
      
      {isFolder && expanded && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.relativePath}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ tree, onFileSelect, selectedFile }: FileTreeProps) {
  if (tree.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4 text-center">
        No files loaded
      </div>
    );
  }
  
  return (
    <div className="text-sm">
      {tree.map((node) => (
        <TreeItem
          key={node.relativePath}
          node={node}
          depth={0}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
}

// Get icon based on file extension
function getFileIcon(ext: string): string {
  const icons: Record<string, string> = {
    ts: "📘",
    tsx: "⚛️",
    js: "📒",
    jsx: "⚛️",
    json: "📋",
    md: "📝",
    html: "🌐",
    css: "🎨",
    scss: "🎨",
    svg: "🖼️",
    png: "🖼️",
    jpg: "🖼️",
    env: "🔐",
    yml: "⚙️",
    yaml: "⚙️",
    toml: "⚙️",
    prisma: "🗃️",
    sql: "🗃️",
    sh: "💻",
    py: "🐍",
    go: "🔷",
    rs: "🦀",
  };
  
  return icons[ext.toLowerCase()] || "📄";
}

// Format file size
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
