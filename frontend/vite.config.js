import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function cjsShim() {
  return {
    name: 'cjs-shim',
    transform(code, id) {
      if (id.includes('NotificationTypes.js')) {
        return `
          const __module = { exports: {} }
          ;(function(module) { ${code} })(__module)
          export const { NotificationType } = __module.exports
        `
      }
      if (id.includes('TransportModes.js')) {
        return `
          const __module = { exports: {} }
          ;(function(module) { ${code} })(__module)
          export const { TransportMode } = __module.exports
        `
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cjsShim()],
  server: {
    port: 5173,
    // Proxy added later when backend started
  },
})
