import { useNavigate } from "react-router-dom";

interface JobCardProps {
  job: any;
  onDelete?: (jobId: string) => void;
}

export default function JobCard({ job, onDelete }: JobCardProps) {
  const navigate = useNavigate();
  
  const statusColors: Record<string, string> = {
    pending: "text-yellow-600 bg-yellow-50",
    processing: "text-blue-600 bg-blue-50",
    done: "text-green-600 bg-green-50",
    error: "text-red-600 bg-red-50"
  };

  const handleUseJob = () => {
    navigate(`/sandbox?job=${job.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      onDelete?.(job.id);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{job.repo || "Local Job"}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {(job.integrations || []).map((int: string) => (
              <span
                key={int}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {int}
              </span>
            ))}
          </div>
          {job.createdAt && (
            <p className="text-xs text-gray-400 mt-2">
              Created: {new Date(job.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="text-right ml-4 flex flex-col items-end gap-2">
          <span className={`px-2 py-1 rounded text-sm font-medium ${statusColors[job.status] || "text-gray-600 bg-gray-50"}`}>
            {job.status}
          </span>
          {job.pr && (
            <a
              href={job.pr.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              View PR
            </a>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t">
        <button
          onClick={handleUseJob}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Use Job
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-2 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors border border-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
