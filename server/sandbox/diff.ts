// Diff Engine for Sandbox

import fs from "fs";
import path from "path";

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

// Generate diffs for all files being applied
export function diffFolder(baseDir: string, files: Array<{ path: string; content: string }>): FileDiff[] {
  const diffs: FileDiff[] = [];
  
  for (const f of files) {
    const fullPath = path.join(baseDir, f.path);
    const exists = fs.existsSync(fullPath);
    const oldContent = exists ? fs.readFileSync(fullPath, "utf8") : "";
    const newContent = f.content;
    
    const { diff, additions, deletions } = createUnifiedDiff(oldContent, newContent, f.path);
    
    diffs.push({
      path: f.path,
      exists,
      isNew: !exists,
      oldContent,
      newContent,
      diff,
      additions,
      deletions,
    });
  }
  
  return diffs;
}

// Create a unified diff between two strings with proper multi-hunk support
function createUnifiedDiff(
  oldStr: string,
  newStr: string,
  filePath: string
): { diff: string; additions: number; deletions: number } {
  const oldLines = oldStr.split("\n");
  const newLines = newStr.split("\n");
  const CONTEXT_LINES = 3;
  
  let diff = "";
  let totalAdditions = 0;
  let totalDeletions = 0;
  
  diff += `--- a/${filePath}\n`;
  diff += `+++ b/${filePath}\n`;
  
  // Find all change regions
  const maxLen = Math.max(oldLines.length, newLines.length);
  const changes: Array<{ index: number; oldLine?: string; newLine?: string }> = [];
  
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    
    if (oldLine !== newLine) {
      changes.push({ index: i, oldLine, newLine });
    }
  }
  
  if (changes.length === 0) {
    return { diff: `No changes in ${filePath}\n`, additions: 0, deletions: 0 };
  }
  
  // Group changes into hunks (changes within 2*CONTEXT_LINES of each other belong to same hunk)
  const hunks: Array<{ startIndex: number; changes: typeof changes }> = [];
  let currentHunk: { startIndex: number; changes: typeof changes } | null = null;
  
  for (const change of changes) {
    if (!currentHunk) {
      currentHunk = { startIndex: change.index, changes: [change] };
    } else {
      const lastChange = currentHunk.changes[currentHunk.changes.length - 1];
      // If this change is within 2*CONTEXT_LINES of the last, add to current hunk
      if (change.index - lastChange.index <= CONTEXT_LINES * 2) {
        currentHunk.changes.push(change);
      } else {
        // Start a new hunk
        hunks.push(currentHunk);
        currentHunk = { startIndex: change.index, changes: [change] };
      }
    }
  }
  if (currentHunk) {
    hunks.push(currentHunk);
  }
  
  // Output each hunk
  for (const hunk of hunks) {
    const firstChangeIndex = hunk.changes[0].index;
    const lastChangeIndex = hunk.changes[hunk.changes.length - 1].index;
    
    // Calculate hunk boundaries with context
    const hunkStartOld = Math.max(0, firstChangeIndex - CONTEXT_LINES);
    const hunkEndOld = Math.min(oldLines.length - 1, lastChangeIndex + CONTEXT_LINES);
    const hunkStartNew = Math.max(0, firstChangeIndex - CONTEXT_LINES);
    const hunkEndNew = Math.min(newLines.length - 1, lastChangeIndex + CONTEXT_LINES);
    
    const hunkLines: string[] = [];
    let hunkOldCount = 0;
    let hunkNewCount = 0;
    let hunkAdditions = 0;
    let hunkDeletions = 0;
    
    // Build set of change indices for quick lookup
    const changeIndices = new Set(hunk.changes.map(c => c.index));
    
    // Iterate through the hunk range
    const hunkEnd = Math.max(hunkEndOld, hunkEndNew);
    for (let i = hunkStartOld; i <= hunkEnd; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];
      
      if (changeIndices.has(i)) {
        // This is a changed line
        if (oldLine !== undefined && oldLine !== newLine) {
          hunkLines.push(`-${oldLine}`);
          hunkOldCount++;
          hunkDeletions++;
        }
        if (newLine !== undefined && newLine !== oldLine) {
          hunkLines.push(`+${newLine}`);
          hunkNewCount++;
          hunkAdditions++;
        }
      } else if (i <= hunkEndOld && oldLine !== undefined) {
        // Context line
        hunkLines.push(` ${oldLine}`);
        hunkOldCount++;
        hunkNewCount++;
      }
    }
    
    // Output hunk header and content
    const oldStart = hunkStartOld + 1; // 1-indexed
    const newStart = hunkStartNew + 1; // 1-indexed
    diff += `@@ -${oldStart},${hunkOldCount} +${newStart},${hunkNewCount} @@\n`;
    diff += hunkLines.join("\n") + "\n";
    
    totalAdditions += hunkAdditions;
    totalDeletions += hunkDeletions;
  }
  
  return { diff, additions: totalAdditions, deletions: totalDeletions };
}

// Apply diffs to the file system
export function applyDiffs(baseDir: string, files: Array<{ path: string; content: string }>): void {
  for (const f of files) {
    const fullPath = path.join(baseDir, f.path);
    const dir = path.dirname(fullPath);
    
    // Create directory if needed
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write file
    fs.writeFileSync(fullPath, f.content, "utf8");
    console.log(`[Diff] Applied: ${f.path}`);
  }
}

// Get summary of changes
export function getDiffSummary(diffs: FileDiff[]): {
  totalFiles: number;
  newFiles: number;
  modifiedFiles: number;
  totalAdditions: number;
  totalDeletions: number;
} {
  return {
    totalFiles: diffs.length,
    newFiles: diffs.filter(d => d.isNew).length,
    modifiedFiles: diffs.filter(d => !d.isNew && d.additions + d.deletions > 0).length,
    totalAdditions: diffs.reduce((sum, d) => sum + d.additions, 0),
    totalDeletions: diffs.reduce((sum, d) => sum + d.deletions, 0),
  };
}
