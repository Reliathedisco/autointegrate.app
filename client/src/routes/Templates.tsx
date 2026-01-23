import { useEffect, useState } from "react";
import api from "../lib/api";
import TemplateCard from "../components/TemplateCard";

interface TemplateFile {
  path: string;
  content: string;
}

export default function Templates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [files, setFiles] = useState<TemplateFile[]>([{ path: "", content: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  async function loadTemplates() {
    try {
      const res = await api.get("/templates");
      setTemplates(res.data.templates || []);
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    loadTemplates().finally(() => setIsLoading(false));
  }, []);

  const addFile = () => {
    setFiles([...files, { path: "", content: "" }]);
  };

  const removeFile = (index: number) => {
    if (files.length > 1) {
      setFiles(files.filter((_, i) => i !== index));
    }
  };

  const updateFile = (index: number, field: keyof TemplateFile, value: string) => {
    const newFiles = [...files];
    newFiles[index][field] = value;
    setFiles(newFiles);
  };

  const handleCreateTemplate = async () => {
    if (!templateName || files.every(f => !f.path || !f.content)) return;
    
    const validFiles = files.filter(f => f.path && f.content);
    if (validFiles.length === 0) return;

    setIsCreating(true);
    try {
      await api.post("/templates", {
        name: templateName,
        description: templateDescription,
        files: validFiles
      });
      setShowModal(false);
      setTemplateName("");
      setTemplateDescription("");
      setFiles([{ path: "", content: "" }]);
      await loadTemplates();
    } catch (err) {
      console.error("Failed to create template:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setTemplateName("");
    setTemplateDescription("");
    setFiles([{ path: "", content: "" }]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Templates</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Template
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500 mb-4">No templates yet. Create your first custom template!</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Template
              </button>
            </div>
          ) : (
            templates.map((t) => (
              <TemplateCard 
                key={t.name} 
                template={t} 
                onDelete={async (name) => {
                  try {
                    await api.delete(`/templates/${encodeURIComponent(name)}`);
                    await loadTemplates();
                  } catch (err) {
                    console.error("Failed to delete template:", err);
                  }
                }}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Create Custom Template</h2>
              <p className="text-gray-500 text-sm mt-1">
                Create a reusable code template for your integrations
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., My Custom Auth"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="What does this template do?"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Template Files
                  </label>
                  <button
                    onClick={addFile}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add File
                  </button>
                </div>
                
                <div className="space-y-4">
                  {files.map((file, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-600">
                          File {index + 1}
                        </label>
                        {files.length > 1 && (
                          <button
                            onClick={() => removeFile(index)}
                            className="text-sm text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={file.path}
                        onChange={(e) => updateFile(index, "path", e.target.value)}
                        placeholder="File path (e.g., src/lib/auth.ts)"
                        className="w-full px-3 py-2 border rounded-lg mb-2 text-sm"
                      />
                      <textarea
                        value={file.content}
                        onChange={(e) => updateFile(index, "content", e.target.value)}
                        placeholder="File content..."
                        rows={6}
                        className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={resetModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!templateName || files.every(f => !f.path || !f.content) || isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

