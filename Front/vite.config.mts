import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replaces Create React App (react-scripts 5). Kept as CRA had it:
// - output in build/ (the Dockerfile copies Front/build into Back/dist/public), served at `/`;
// - dev server on :3000 (the Back's DEV CORS origin), `public/` copied as is;
// - browser support close to CRA's browserslist (">0.2%, not dead"): ES2020-era browsers.
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: true,
    target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'],
    rolldownOptions: {
      // mdast-util-to-hast (react-markdown) starts its files with a no-op '' directive: harmless, just noise
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.id?.includes('node_modules')) return;
        warn(warning);
      },
    },
  },
});
