import { execSync } from 'child_process';
import { unlinkSync } from 'fs';
import { join } from 'path';

const projectRoot = join(import.meta.dirname, '..');
const lockfilePath = join(projectRoot, 'package-lock.json');

console.log('Removing stale package-lock.json...');
try {
  unlinkSync(lockfilePath);
  console.log('Removed package-lock.json');
} catch (e) {
  console.log('No existing package-lock.json to remove');
}

console.log('Regenerating package-lock.json with npm install...');
execSync('npm install --package-lock-only', {
  cwd: projectRoot,
  stdio: 'inherit',
});

console.log('Done! package-lock.json has been regenerated.');
