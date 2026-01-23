"use client";
import { useState } from "react";

type Node = {
  name: string;
  type: "file" | "folder";
  children?: Node[];
};

export default function RepoTree({ tree }: { tree: Node[] }) {
  return (
    <div className="text-sm font-mono">
      {tree.map((node) => (
        <NodeItem key={node.name} node={node} level={0} />
      ))}
    </div>
  );
}

function NodeItem({ node, level }: { node: Node; level: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginLeft: level * 12 }}>
      {node.type === "folder" ? (
        <>
          <div
            className="cursor-pointer font-medium hover:bg-gray-100 p-1 rounded"
            onClick={() => setOpen(!open)}
          >
            {open ? "📂" : "📁"} {node.name}
          </div>
          {open &&
            node.children?.map((child) => (
              <NodeItem key={child.name} node={child} level={level + 1} />
            ))}
        </>
      ) : (
        <div className="cursor-pointer hover:underline p-1">📄 {node.name}</div>
      )}
    </div>
  );
}
