import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
function resolveBasePath() {
    var _a;
    if (!process.env.GITHUB_ACTIONS) {
        return '/';
    }
    var repoSlug = (_a = process.env.GITHUB_REPOSITORY) === null || _a === void 0 ? void 0 : _a.split('/')[1];
    return repoSlug ? "/".concat(repoSlug, "/") : '/';
}
export default defineConfig({
    base: resolveBasePath(),
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        allowedHosts: 'all'
    }
});
