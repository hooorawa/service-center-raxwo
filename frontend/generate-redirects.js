import fs from 'fs';
import path from 'path';

const apiUrl = process.env.VITE_API_URL || '';
const distDir = path.resolve('dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

let redirectContent = '';

if (apiUrl) {
  redirectContent += `/api/* ${apiUrl}/api/:splat 200!\n`;
  console.log(`Configured API redirect to: ${apiUrl}`);
} else {
  console.log('Warning: VITE_API_URL is not set. API calls will resolve locally.');
}

// Fallback for Single Page Application routing (React Router)
redirectContent += `/* /index.html 200\n`;

fs.writeFileSync(path.join(distDir, '_redirects'), redirectContent);
console.log('Successfully generated _redirects for Netlify.');
