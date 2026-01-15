import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = env.PORT ? parseInt(env.PORT) : 8000
  
  return {
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
