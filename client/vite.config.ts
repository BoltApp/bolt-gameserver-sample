import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

declare const process: {
  env: any
}


// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@shared-types': '../src/server/types/shared'
    }
  },
})
