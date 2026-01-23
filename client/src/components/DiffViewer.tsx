import { useState } from "react";

export interface FileDiff {
  path: string;
  exists: boolean;
  isNew: boolean;
  oldContent: string;
  newContent: string;
  diff: string;
  additions: number;
  deletions: number;
}

interface DiffViewerProps {
  diffs: FileDiff[];
  onApprove?: (paths: string[]) => void;
}

export default function DiffViewer({ diffs, onApprove }: DiffViewerProps) {
  const [selectedDiff, setSelectedDiff] = useState<FileDiff | null>(
    diffs.length > 0 ? diffs[0] : null
  );
  const [approvedPaths, setApprovedPaths] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"diff" | "split">("diff");
  
  const toggleApproved = (path: string) => {
    const newApproved = new Set(approvedPaths);
    if (newApproved.has(path)) {
      newApproved.delete(path);
    } else {
      newApproved.add(path);
    }
    setApprovedPaths(newApproved);
  };
  
  const approveAll = () => {
    setApprovedPaths(new Set(diffs.map(d => d.path)));
  };
  
  const handleApply = () => {
    if (onApprove) {
      onApprove(Array.from(approvedPaths));
    }
  };
  
  if (diffs.length === 0) {
    return (
      <div className="bg-white rounded shadow p-6 text-center text-gray-500">
        No changes to preview
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Changes Preview</h3>
          <span className="text-sm text-gray-500">
            {diffs.length} files • 
            <span className="text-green-600 ml-1">
              +{diffs.reduce((sum, d) => sum + d.additions, 0)}
            </span>
            <span className="text-red-600 ml-1">
              -{diffs.reduce((sum, d) => sum + d.deletions, 0)}
            </span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "diff" ? "split" : "diff")}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            {viewMode === "diff" ? "Split View" : "Unified View"}
          </button>
          <button
            onClick={approveAll}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            Select All
          </button>
          {onApprove && (
            <button
              onClick={handleApply}
              disabled={approvedPaths.size === 0}
              className="px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply ({approvedPaths.size})
            </button>
          )}
        </div>
      </div>
      
      <div className="flex h-[500px]">
        {/* File List */}
        <div className="w-64 border-r overflow-y-auto">
          {diffs.map((d) => (
            <div
              key={d.path}
              className={`flex items-center gap-2 p-3 cursor-pointer border-b ${
                selectedDiff?.path === d.path 
                  ? "bg-blue-50 border-l-4 border-l-blue-500" 
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedDiff(d)}
            >
              <input
                type="checkbox"
                checked={approvedPaths.has(d.path)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleApproved(d.path);
                }}
                className="rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" title={d.path}>
                  {d.path.split("/").pop()}
                </div>
                <div className="text-xs text-gray-500 truncate">{d.path}</div>
              </div>
              <div className="flex flex-col items-end text-xs">
                {d.isNew ? (
                  <span className="text-green-600 font-medium">NEW</span>
                ) : (
                  <>
                    <span className="text-green-600">+{d.additions}</span>
                    <span className="text-red-600">-{d.deletions}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Diff Content */}
        <div className="flex-1 overflow-auto">
          {selectedDiff ? (
            viewMode === "diff" ? (
              <UnifiedDiffView diff={selectedDiff} />
            ) : (
              <SplitDiffView diff={selectedDiff} />
            )
          ) : (
            <div className="p-4 text-gray-500 text-center">
              Select a file to view changes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Unified diff view
function UnifiedDiffView({ diff }: { diff: FileDiff }) {
  const lines = diff.diff.split("\n");
  
  return (
    <div className="font-mono text-sm">
      <div className="bg-gray-100 px-4 py-2 border-b sticky top-0">
        <span className={diff.isNew ? "text-green-600" : ""}>
          {diff.isNew ? "📄 New file: " : "📝 Modified: "}
        </span>
        {diff.path}
      </div>
      <pre className="p-4 whitespace-pre-wrap">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${
              line.startsWith("+") && !line.startsWith("+++")
                ? "bg-green-100 text-green-800"
                : line.startsWith("-") && !line.startsWith("---")
                ? "bg-red-100 text-red-800"
                : line.startsWith("@@")
                ? "bg-blue-100 text-blue-800"
                : ""
            }`}
          >
            {line}
          </div>
        ))}
      </pre>
    </div>
  );
}

// Split diff view
function SplitDiffView({ diff }: { diff: FileDiff }) {
  const oldLines = diff.oldContent.split("\n");
  const newLines = diff.newContent.split("\n");
  
  return (
    <div className="font-mono text-sm flex">
      {/* Old content */}
      <div className="flex-1 border-r">
        <div className="bg-red-50 px-4 py-2 border-b sticky top-0 text-red-700">
          Original
        </div>
        <pre className="p-2 whitespace-pre-wrap text-xs">
          {oldLines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 text-gray-400 text-right pr-2 select-none">
                {i + 1}
              </span>
              <span>{line}</span>
            </div>
          ))}
        </pre>
      </div>
      
      {/* New content */}
      <div className="flex-1">
        <div className="bg-green-50 px-4 py-2 border-b sticky top-0 text-green-700">
          Modified
        </div>
        <pre className="p-2 whitespace-pre-wrap text-xs">
          {newLines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 text-gray-400 text-right pr-2 select-none">
                {i + 1}
              </span>
              <span>{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
