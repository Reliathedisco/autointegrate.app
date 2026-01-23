"use client";
import ReactDiffViewer from "react-diff-viewer-continued";

export default function DiffView({
  oldText,
  newText,
  title,
}: {
  oldText: string;
  newText: string;
  title?: string;
}) {
  return (
    <div className="border rounded overflow-hidden">
      {title && (
        <div className="bg-gray-100 px-4 py-2 font-medium border-b">
          {title}
        </div>
      )}
      <ReactDiffViewer
        oldValue={oldText}
        newValue={newText}
        splitView={true}
        showDiffOnly={false}
        useDarkTheme={false}
        leftTitle="Before"
        rightTitle="After"
      />
    </div>
  );
}
