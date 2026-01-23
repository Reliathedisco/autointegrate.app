import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import FileTree, { TreeNode } from "../components/FileTree";
import DiffViewer, { FileDiff } from "../components/DiffViewer";
import IntegrationSidebar from "../components/IntegrationSidebar";
import EnvValidation, { EnvValidationResult } from "../components/EnvValidation";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

interface DemoRepo {
  id: string;
  name: string;
  description: string;
  icon: string;
  suggestedIntegrations: string[];
}

interface CustomTemplate {
  name: string;
  description?: string;
  files: Array<{ path: string; content: string }> | Record<string, string>;
}

interface LoadedJob {
  id: string;
  repo: string;
  integrations: string[];
  status: string;
  createdAt?: string;
}

// Get language from file extension
function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    css: 'css',
    scss: 'scss',
    html: 'html',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    sh: 'shell',
    bash: 'shell',
    sql: 'sql',
    graphql: 'graphql',
    dockerfile: 'dockerfile',
  };
  return languageMap[ext] || 'plaintext';
}

type ViewMode = "tree" | "diff" | "preview";

interface Session {
  id: string;
  repoUrl: string;
  tree: TreeNode[];
  appliedIntegrations: string[];
  isDemo?: boolean;
}

export default function Sandbox() {
  const [searchParams] = useSearchParams();
  
  // Session state
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input state
  const [repoUrl, setRepoUrl] = useState("");
  const [token, setToken] = useState("");

  // Demo state
  const [showDemoSelector, setShowDemoSelector] = useState(false);
  const [demoRepos, setDemoRepos] = useState<DemoRepo[]>([]);
  const [loadingDemoRepos, setLoadingDemoRepos] = useState(false);

  // Template state
  const [customTemplate, setCustomTemplate] = useState<CustomTemplate | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Job state
  const [loadedJob, setLoadedJob] = useState<LoadedJob | null>(null);
  const [loadingJob, setLoadingJob] = useState(false);

  // Load a job
  async function loadJob(jobId: string) {
    setLoadingJob(true);
    try {
      const res = await api.get(`/jobs/${jobId}`);
      if (res.data && res.data.id) {
        setLoadedJob(res.data);
        // Pre-fill repo URL
        if (res.data.repo) {
          setRepoUrl(res.data.repo);
        }
        // Pre-select integrations
        if (res.data.integrations?.length > 0) {
          setSelectedIntegrations(res.data.integrations);
        }
      }
    } catch (err: any) {
      console.error("Failed to load job:", err);
      setError("Job not found");
    } finally {
      setLoadingJob(false);
    }
  }

  // Load a custom template
  async function loadTemplate(templateName: string) {
    setLoadingTemplate(true);
    try {
      const res = await api.get(`/templates/${encodeURIComponent(templateName)}`);
      if (res.data.ok) {
        setCustomTemplate(res.data.template);
      }
    } catch (err: any) {
      console.error("Failed to load template:", err);
      setError("Template not found");
    } finally {
      setLoadingTemplate(false);
    }
  }

  // Apply custom template to sandbox
  function applyCustomTemplate() {
    if (!session || !customTemplate) return;

    setGeneratingDiffs(true);
    setError(null);

    try {
      const templateFiles = Array.isArray(customTemplate.files) 
        ? customTemplate.files 
        : Object.entries(customTemplate.files).map(([path, content]) => ({ path, content }));

      const newDiffs: FileDiff[] = templateFiles.map(file => ({
        path: file.path,
        exists: false,
        isNew: true,
        oldContent: "",
        newContent: file.content,
        diff: file.content.split('\n').map(line => `+${line}`).join('\n'),
        additions: file.content.split('\n').length,
        deletions: 0,
      }));

      setDiffs(newDiffs);
      setViewMode("diff");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingDiffs(false);
    }
  }

  // Check if demo, template, or job mode was requested via URL
  useEffect(() => {
    const templateName = searchParams.get("template");
    const jobId = searchParams.get("job");
    
    if (jobId) {
      loadJob(jobId);
    } else if (templateName) {
      loadTemplate(templateName);
    } else if (searchParams.get("demo") === "true") {
      const autoloadRepo = searchParams.get("autoload");
      if (autoloadRepo) {
        loadDemoSession(autoloadRepo);
      } else {
        setShowDemoSelector(true);
        loadDemoRepos();
      }
    }
  }, [searchParams]);

  // Load demo repos
  async function loadDemoRepos() {
    setLoadingDemoRepos(true);
    try {
      const res = await api.get("/demo/repos");
      if (res.data.ok) {
        setDemoRepos(res.data.repos);
      }
    } catch (err: any) {
      console.error("Failed to load demo repos:", err);
    } finally {
      setLoadingDemoRepos(false);
    }
  }

  // Load a demo session
  async function loadDemoSession(repoId: string) {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.post("/demo/load", { repoId });
      
      if (res.data.ok) {
        setSession({
          id: res.data.sessionId,
          repoUrl: `Demo: ${res.data.repoName}`,
          tree: res.data.tree,
          appliedIntegrations: [],
          isDemo: true,
        });
        setShowDemoSelector(false);
        setViewMode("tree");
        setSelectedIntegrations(["Stripe"]);
      } else {
        setError(res.data.error);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  // Integration state
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [diffs, setDiffs] = useState<FileDiff[]>([]);
  const [generatingDiffs, setGeneratingDiffs] = useState(false);
  const [envValidation, setEnvValidation] = useState<EnvValidationResult | null>(null);

  // Explanation state
  const [explanation, setExplanation] = useState<string>("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [showExplanationPanel, setShowExplanationPanel] = useState(false);

  // Load repository
  async function loadRepo() {
    if (!repoUrl) {
      setError("Please enter a repository URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/sandbox/load", { repoUrl, token: token || undefined });

      if (res.data.ok) {
        setSession({
          id: res.data.sessionId,
          repoUrl,
          tree: res.data.tree,
          appliedIntegrations: [],
        });
        setViewMode("tree");
      } else {
        setError(res.data.error);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  // Apply integrations (preview diffs)
  async function applyIntegrations() {
    if (!session || selectedIntegrations.length === 0) return;

    setGeneratingDiffs(true);
    setError(null);

    try {
      const res = await api.post("/sandbox/apply", {
        sessionId: session.id,
        integrations: selectedIntegrations,
      });

      if (res.data.ok) {
        setDiffs(res.data.diffs);
        setEnvValidation(res.data.envValidation || null);
        setViewMode("diff");
      } else {
        setError(res.data.error);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setGeneratingDiffs(false);
    }
  }

  // Commit approved changes
  async function commitChanges(approvedPaths: string[]) {
    if (!session) return;

    const filesToCommit = diffs
      .filter((d) => approvedPaths.includes(d.path))
      .map((d) => ({ path: d.path, content: d.newContent }));

    try {
      const res = await api.post("/sandbox/commit", {
        sessionId: session.id,
        files: filesToCommit,
      });

      if (res.data.ok) {
        setSession({
          ...session,
          tree: res.data.tree,
          appliedIntegrations: [...session.appliedIntegrations, ...selectedIntegrations],
        });
        setDiffs([]);
        setEnvValidation(null);
        setSelectedIntegrations([]);
        setViewMode("tree");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  }

  // Load file content
  async function loadFileContent(node: TreeNode) {
    if (!session || node.type === "folder") return;

    setSelectedFile(node);
    setShowExplanationPanel(false);
    setExplanation("");

    try {
      const res = await api.get(
        `/sandbox/session/${session.id}/file?path=${encodeURIComponent(node.relativePath)}`
      );

      if (res.data.ok) {
        setFileContent(res.data.content);
      }
    } catch (err: any) {
      setFileContent(`Error loading file: ${err.message}`);
    }
  }

  // Export as ZIP
  async function exportZip() {
    if (!session) return;

    try {
      const res = await api.get(`/sandbox/session/${session.id}/export`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `autointegrate-${session.id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  }

  // Explain selected file
  async function explainFile() {
    if (!session || !selectedFile) return;

    setLoadingExplanation(true);
    setShowExplanationPanel(true);

    try {
      const res = await api.post("/sandbox/explain", {
        sessionId: session.id,
        filePath: selectedFile.relativePath,
        integrationName: session.appliedIntegrations.length > 0 
          ? session.appliedIntegrations.join(", ") 
          : undefined,
      });

      if (res.data.ok) {
        setExplanation(res.data.explanation || "No explanation available.");
      } else {
        setExplanation(`Error: ${res.data.error}`);
      }
    } catch (err: any) {
      setExplanation(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoadingExplanation(false);
    }
  }

  // Render loading state for initial repo load
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Sandbox</h1>

        {/* Template Loading/Loaded Banner */}
        {loadingTemplate && (
          <div className="mb-6 p-4 bg-purple-100 text-purple-700 rounded-lg flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Loading template...
          </div>
        )}
        {customTemplate && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h2 className="font-semibold text-lg">Template Ready: {customTemplate.name}</h2>
                  {customTemplate.description && (
                    <p className="text-purple-100 text-sm">{customTemplate.description}</p>
                  )}
                  <p className="text-purple-200 text-sm mt-1">
                    {Array.isArray(customTemplate.files) ? customTemplate.files.length : Object.keys(customTemplate.files).length} files will be added
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCustomTemplate(null)}
                className="px-2 py-1 text-purple-200 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-purple-100 text-sm">
              Load a repository below, then click "Apply Template" to add these files.
            </p>
          </div>
        )}

        {/* Job Loading/Loaded Banner */}
        {loadingJob && (
          <div className="mb-6 p-4 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Loading job...
          </div>
        )}
        {loadedJob && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <h2 className="font-semibold text-lg">Job Ready: {loadedJob.id.slice(0, 8)}</h2>
                  <p className="text-blue-100 text-sm truncate max-w-md">{loadedJob.repo}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {loadedJob.integrations.map((int) => (
                      <span key={int} className="px-2 py-0.5 bg-white/20 rounded text-xs">
                        {int}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setLoadedJob(null);
                  setRepoUrl("");
                  setSelectedIntegrations([]);
                }}
                className="px-2 py-1 text-blue-200 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-blue-100 text-sm">
              Repository and integrations pre-filled. Click "Load" to continue, then "Apply Integrations" to generate the code.
            </p>
          </div>
        )}

        {/* Demo Mode Selector */}
        {showDemoSelector ? (
          <div className="bg-white rounded shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">🎮 Try Demo Mode</h2>
              <button
                onClick={() => setShowDemoSelector(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Explore AutoIntegrate with sample repositories. No GitHub account required!
            </p>

            {loadingDemoRepos ? (
              <div className="flex items-center justify-center py-8">
                <span className="animate-spin text-2xl mr-2">⏳</span>
                Loading sample repos...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => loadDemoSession(repo.id)}
                    disabled={loading}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{repo.icon}</span>
                      <h3 className="font-semibold text-lg">{repo.name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{repo.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {repo.suggestedIntegrations.map((int) => (
                        <span
                          key={int}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {int}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Creating demo session...
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow p-6 mb-6 text-white">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎮</span>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">Try Demo Mode</h2>
                <p className="text-emerald-100 text-sm">
                  Explore instantly with sample repositories. No GitHub required!
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDemoSelector(true);
                  loadDemoRepos();
                }}
                className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
              >
                Try Demo
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Load Your Repository</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Token (optional, for private repos)
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && !showDemoSelector && (
              <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <button
              onClick={loadRepo}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && !showDemoSelector ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Cloning Repository...
                </>
              ) : (
                <>
                  <span>📂</span>
                  Load Repository
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main sandbox view
  return (
    <div className="h-[calc(100vh-3rem)]">
      {/* Demo Mode Banner */}
      {session.isDemo && (
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎮</span>
            <div>
              <span className="font-semibold">Demo Mode</span>
              <span className="mx-2">·</span>
              <span className="text-amber-100 text-sm">
                Explore freely! Export as ZIP to save changes.
              </span>
            </div>
          </div>
          <div className="relative group">
            <span className="cursor-help text-lg">ℹ️</span>
            <div className="absolute right-0 top-8 w-64 p-3 bg-white text-gray-700 rounded-lg shadow-lg text-sm invisible group-hover:visible z-50">
              <p className="font-medium mb-2">Demo Mode Restrictions:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Commits and PRs disabled</li>
                <li>ZIP export works normally</li>
                <li>Diff preview available</li>
              </ul>
              <p className="mt-2 text-gray-500 text-xs">Load your own repo for full features</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Template Banner */}
      {loadingTemplate && (
        <div className="mb-4 p-3 bg-purple-100 text-purple-700 rounded-lg flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          Loading template...
        </div>
      )}
      {customTemplate && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <div>
              <span className="font-semibold">Template: {customTemplate.name}</span>
              {customTemplate.description && (
                <>
                  <span className="mx-2">·</span>
                  <span className="text-purple-100 text-sm">{customTemplate.description}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={applyCustomTemplate}
              disabled={generatingDiffs}
              className="px-4 py-1.5 bg-white text-purple-600 rounded font-medium hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              {generatingDiffs ? "Applying..." : "Apply Template"}
            </button>
            <button
              onClick={() => setCustomTemplate(null)}
              className="px-2 py-1 text-purple-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Job Banner */}
      {loadedJob && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔄</span>
            <div>
              <span className="font-semibold">Job: {loadedJob.id.slice(0, 8)}</span>
              <span className="mx-2">·</span>
              <span className="text-blue-100 text-sm">
                {loadedJob.integrations.join(", ")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-100 text-sm">
              Integrations pre-selected
            </span>
            <button
              onClick={() => {
                setLoadedJob(null);
                setSelectedIntegrations([]);
              }}
              className="px-2 py-1 text-blue-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">🧪 Sandbox</h1>
            <p className="text-sm text-gray-500">{session.repoUrl}</p>
          </div>
          {session.isDemo && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              DEMO
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View mode tabs */}
          <div className="flex bg-gray-100 rounded p-1">
            {(["tree", "diff", "preview"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-sm capitalize ${
                  viewMode === mode
                    ? "bg-white shadow"
                    : "hover:bg-gray-200"
                }`}
              >
                {mode === "tree" && "📁 "}
                {mode === "diff" && "📝 "}
                {mode === "preview" && "👁️ "}
                {mode}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={exportZip}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm flex items-center gap-1"
          >
            📦 Export ZIP
          </button>

          {/* New session button */}
          <button
            onClick={() => {
              setSession(null);
              setDiffs([]);
              setEnvValidation(null);
              setSelectedIntegrations([]);
              setSelectedFile(null);
              setFileContent("");
              setExplanation("");
              setShowExplanationPanel(false);
            }}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
          >
            🔄 New Session
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Applied integrations */}
      {session.appliedIntegrations.length > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Applied:</span>
          {session.appliedIntegrations.map((name) => (
            <span
              key={name}
              className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="flex gap-4 h-[calc(100%-8rem)]">
        {/* Integration Sidebar */}
        <div className="w-72 bg-white rounded shadow overflow-hidden flex flex-col">
          <IntegrationSidebar
            selectedIntegrations={selectedIntegrations}
            onSelectionChange={setSelectedIntegrations}
            onApply={applyIntegrations}
            loading={generatingDiffs}
            recommendedIntegration={session.isDemo ? "Stripe" : undefined}
            showTimeSavedHint={session.isDemo}
          />
        </div>

        {/* Main panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {viewMode === "tree" && (
            <div className="flex gap-4 flex-1 min-h-0">
              {/* File tree */}
              <div className="w-72 bg-white rounded shadow overflow-y-auto">
                <div className="p-3 border-b bg-gray-50 font-medium text-sm sticky top-0">
                  📁 Repository Files
                </div>
                <FileTree
                  tree={session.tree}
                  onFileSelect={loadFileContent}
                  selectedFile={selectedFile?.relativePath}
                />
              </div>

              {/* File preview with Monaco Editor */}
              <div className="flex-1 bg-[#0d1117] rounded shadow overflow-hidden flex flex-col">
                {selectedFile ? (
                  <>
                    <div className="p-3 border-b border-[#30363d] bg-[#161b22] text-sm flex items-center justify-between">
                      <div>
                        <span className="font-medium text-[#e6edf3]">{selectedFile.name}</span>
                        <span className="text-[#8b949e] ml-2">
                          {selectedFile.relativePath}
                        </span>
                      </div>
                      <button
                        onClick={explainFile}
                        disabled={loadingExplanation}
                        className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#238636]/50 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
                      >
                        {loadingExplanation ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Explaining...
                          </>
                        ) : (
                          <>
                            <span>💡</span>
                            Explain This Code
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex-1 flex min-h-0">
                      <div className={`${showExplanationPanel ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
                        <Editor
                          height="100%"
                          language={getLanguageFromPath(selectedFile.relativePath)}
                          value={fileContent || "// Loading..."}
                          theme="vs-dark"
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            automaticLayout: true,
                            padding: { top: 12, bottom: 12 },
                            renderLineHighlight: "line",
                            cursorBlinking: "smooth",
                            smoothScrolling: true,
                            contextmenu: true,
                            folding: true,
                            lineDecorationsWidth: 10,
                            lineNumbersMinChars: 4,
                          }}
                        />
                      </div>
                      {showExplanationPanel && (
                        <div className="w-1/2 border-l border-[#30363d] bg-[#161b22] flex flex-col">
                          <div className="p-3 border-b border-[#30363d] flex items-center justify-between">
                            <span className="text-sm font-medium text-[#e6edf3]">💡 Code Explanation</span>
                            <button
                              onClick={() => setShowExplanationPanel(false)}
                              className="text-[#8b949e] hover:text-[#e6edf3] text-lg"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4">
                            {loadingExplanation ? (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center text-[#8b949e]">
                                  <span className="animate-spin text-2xl block mb-2">⏳</span>
                                  Generating explanation...
                                </div>
                              </div>
                            ) : (
                              <div className="prose prose-invert prose-sm max-w-none text-[#e6edf3]">
                                <ReactMarkdown
                                  components={{
                                    h2: ({children}) => <h2 className="text-[#58a6ff] text-lg font-semibold mt-4 mb-2 first:mt-0">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-[#e6edf3] text-base font-medium mt-3 mb-1">{children}</h3>,
                                    p: ({children}) => <p className="text-[#c9d1d9] mb-3 leading-relaxed">{children}</p>,
                                    ul: ({children}) => <ul className="list-disc list-inside text-[#c9d1d9] mb-3 space-y-1">{children}</ul>,
                                    li: ({children}) => <li className="text-[#c9d1d9]">{children}</li>,
                                    code: ({children}) => <code className="bg-[#0d1117] px-1.5 py-0.5 rounded text-[#ff7b72] text-xs">{children}</code>,
                                    pre: ({children}) => <pre className="bg-[#0d1117] p-3 rounded overflow-x-auto text-xs">{children}</pre>,
                                    strong: ({children}) => <strong className="text-[#e6edf3] font-semibold">{children}</strong>,
                                  }}
                                >
                                  {explanation}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[#8b949e]">
                    Select a file to preview
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === "diff" && (
            <div className="flex flex-col gap-4 flex-1 min-h-0">
              {session.isDemo && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-amber-500 text-xl">⚠️</span>
                  <div>
                    <p className="font-medium text-amber-800">Demo Mode - Commits Disabled</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Preview changes below. Use <strong>Export ZIP</strong> to download all files, or load your own repository for full commit functionality.
                    </p>
                  </div>
                </div>
              )}
              {diffs.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
                  <span className="text-emerald-600 text-lg">⚡</span>
                  <p className="text-sm text-emerald-800">
                    <strong>AutoIntegrate generated this in seconds.</strong> Review every line before committing.
                  </p>
                </div>
              )}
              {envValidation && (
                <div className="bg-white rounded shadow p-4">
                  <EnvValidation validation={envValidation} />
                </div>
              )}
              <div className="flex-1 min-h-0">
                <DiffViewer 
                  diffs={diffs} 
                  onApprove={session.isDemo ? undefined : commitChanges} 
                />
              </div>
            </div>
          )}

          {viewMode === "preview" && (
            <div className="flex-1 bg-white rounded shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <p className="text-gray-500">
                Preview of generated code will appear here after applying
                integrations.
              </p>

              {diffs.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h3 className="font-medium">Generated Files:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {diffs.map((d) => (
                      <li key={d.path} className="text-sm">
                        <span
                          className={d.isNew ? "text-green-600" : "text-blue-600"}
                        >
                          {d.isNew ? "[NEW] " : "[MOD] "}
                        </span>
                        {d.path}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
