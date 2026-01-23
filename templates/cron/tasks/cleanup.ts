export const cleanupTask = async () => {
  console.log("Running nightly cleanup task at", new Date().toISOString());
  // Add your cleanup logic here:
  // - Delete old sessions
  // - Clear expired tokens
  // - Archive old data
  return { ok: true, timestamp: new Date().toISOString() };
};
