import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.REPLICATE_API_TOKEN': JSON.stringify(env.REPLICATE_API_TOKEN)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            configure: (proxy, options) => {
              // Fallback for when Vercel dev is not running
              proxy.on('error', (err, req, res) => {
                console.warn('API proxy error - make sure to run "npm run dev:vercel" in another terminal');
                res.writeHead(503, {
                  'Content-Type': 'application/json',
                });
                res.end(JSON.stringify({
                  error: 'API server not available. Run "npm run dev:vercel" in another terminal for full functionality.'
                }));
              });
            }
          }
        }
      }
    };
});
