import fs from 'node:fs';
import { execSync } from 'node:child_process';

console.log('[Build] Starting build process (ESM)...');
console.log('[Build] Working directory:', process.cwd());

if (fs.existsSync('frontend') && fs.existsSync('frontend/package.json')) {
  console.log('[Build] Building from root into frontend/dist ...');
  execSync('npm --prefix frontend install && npm --prefix frontend run build', { stdio: 'inherit' });
  try {
    fs.rmSync('dist', { recursive: true, force: true });
    fs.cpSync('frontend/dist', 'dist', { recursive: true });
  } catch (e) {
    console.log('[Build Notice] Mirroring dist error:', e.message);
  }
} else {
  console.log('[Build] Building inside frontend directory ...');
  execSync('npm install && npm run build', { stdio: 'inherit' });
  try {
    fs.mkdirSync('frontend', { recursive: true });
    fs.rmSync('frontend/dist', { recursive: true, force: true });
    fs.cpSync('dist', 'frontend/dist', { recursive: true });
  } catch (e) {
    console.log('[Build Notice] Mirroring frontend/dist error:', e.message);
  }
}

console.log('[Build] Build completed successfully.');
