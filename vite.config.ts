import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Replace '<YOUR_REPOSITORY_NAME>' with the name of your GitHub repository
  base: '/<YOUR_REPOSITORY_NAME>/',
})
