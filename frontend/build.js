const fs = require('fs');
const { execSync } = require('child_process');

console.log('[Build] Starting build process...');
console.log('[Build] Current working directory:', process.cwd());

if (fs.existsSync('frontend') && fs.existsSync('frontend/package.json')) {
  console.log('[Build] Detected repo root. Running build in frontend/ ...');
  execSync('npm --prefix frontend install && npm --prefix frontend run build', { stdio: 'inherit' });
  try {
    fs.rmSync('dist', { recursive: true, force: true });
    fs.cpSync('frontend/dist', 'dist', { recursive: true });
  } catch (e) {
    console.log('[Build Notice] Mirroring dist error:', e.message);
  }
} else {
  console.log('[Build] Detected frontend folder. Running local build...');
  execSync('npm install && npm run build', { stdio: 'inherit' });
  try {
    fs.mkdirSync('frontend', { recursive: true });
    fs.rmSync('frontend/dist', { recursive: true, force: true });
    fs.cpSync('dist', 'frontend/dist', { recursive: true });
  } catch (e) {
    console.log('[Build Notice] Mirroring frontend/dist error:', e.message);
  }
}

console.log('[Build] Build finished successfully.');
