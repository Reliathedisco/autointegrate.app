import { useNavigate } from "react-router-dom";

interface TemplateCardProps {
  template: any;
  onDelete?: (name: string) => void;
}

export default function TemplateCard({ template, onDelete }: TemplateCardProps) {
  const navigate = useNavigate();
  const fileCount = Array.isArray(template.files) 
    ? template.files.length 
    : Object.keys(template.files || {}).length;

  const handleUseTemplate = () => {
    navigate(`/sandbox?template=${encodeURIComponent(template.name)}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-semibold text-lg">{template.name}</p>
          {template.description && (
            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            {fileCount} file{fileCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUseTemplate}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Use Template
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(template.name)}
              className="px-3 py-1.5 text-red-500 text-sm hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

