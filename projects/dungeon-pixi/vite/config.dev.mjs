import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    server: {
        port: 3002,
        host: true,
    }
})
