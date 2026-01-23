export default function DocsHome() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-semibold mb-4">Documentation</h1>
      <p className="text-gray-700">
        Welcome to AutoIntegrate documentation. Select a topic from the sidebar.
      </p>

      <h2 className="text-xl font-medium mt-8 mb-3">Quick Links</h2>
      <ul className="space-y-2">
        <li>
          <a href="/docs/getting-started" className="text-blue-600 hover:underline">
            Getting Started →
          </a>
        </li>
        <li>
          <a href="/docs/templates" className="text-blue-600 hover:underline">
            Browse Templates →
          </a>
        </li>
        <li>
          <a href="/docs/api" className="text-blue-600 hover:underline">
            API Reference →
          </a>
        </li>
      </ul>
    </div>
  );
}
