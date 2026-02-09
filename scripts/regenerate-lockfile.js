import { execSync } from "child_process";

console.log("Regenerating package-lock.json...");
try {
  execSync("npm install --package-lock-only", {
    cwd: "/vercel/share/v0-project",
    stdio: "inherit",
  });
  console.log("Successfully regenerated package-lock.json");
} catch (error) {
  console.error("Failed to regenerate lock file:", error.message);
  process.exit(1);
}
