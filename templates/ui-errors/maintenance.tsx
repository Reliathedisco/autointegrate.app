export default function Maintenance() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10">
      <h1 className="text-3xl font-semibold">We'll be right back</h1>
      <p className="text-gray-500 mt-4 mb-8">
        We're performing scheduled maintenance.
      </p>
      <div className="text-sm text-gray-400">
        Expected downtime: ~30 minutes
      </div>
    </div>
  );
}
