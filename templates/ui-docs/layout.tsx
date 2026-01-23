export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r p-6 bg-gray-50">
        <h2 className="font-semibold mb-4">Docs</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="/docs/getting-started" className="hover:underline">
              Getting Started
            </a>
          </li>
          <li>
            <a href="/docs/templates" className="hover:underline">
              Templates
            </a>
          </li>
          <li>
            <a href="/docs/api" className="hover:underline">
              API Reference
            </a>
          </li>
        </ul>
      </aside>
      <main className="p-10 flex-1">{children}</main>
    </div>
  );
}
