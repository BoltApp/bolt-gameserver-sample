import { defineConfig, loadEnv } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = env.PORT ? parseInt(env.PORT) : 4264
  
  return {
    plugins: [preact()],
    resolve: {
      alias: {
        '@shared-types': '../src/server/types/shared'
      }
    },
    server: {
      port,
      allowedHosts: [
        'localhost',
        '.ngrok.io',
        'dev.bolt.me',
      ]
    }
  }
})
