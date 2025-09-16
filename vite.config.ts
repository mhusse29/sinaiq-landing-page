import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages: https://<user>.github.io/sinaiq-landing-page/
  // Ensures assets resolve correctly when deployed under a subpath
  base: '/sinaiq-landing-page/',
  plugins: [react()],
})
