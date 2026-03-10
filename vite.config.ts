import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function resolveBasePath(): string {
  if (!process.env.GITHUB_ACTIONS) {
    return '/';
  }

  const repoSlug = process.env.GITHUB_REPOSITORY?.split('/')[1];
  return repoSlug ? `/${repoSlug}/` : '/';
}

export default defineConfig({
  base: resolveBasePath(),
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    allowedHosts: ['nodcursor.onrender.com']
  }
});
