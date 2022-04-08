import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginImp from 'vite-plugin-imp'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), vitePluginImp({
    libList: [
      {
        libName: 'antd',
        style: (name) => `antd/es/${name}/style/index.js`
      }
    ]
  })],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  }
})
