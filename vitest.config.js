import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// Safe: Vitest config for testing infrastructure
// Minimal setup that mirrors vite.config.js to ensure tests run in same environment
export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for React component testing
    environment: 'jsdom',
    // Make expect and other globals available
    globals: true,
    // Setup file for test utilities
    setupFiles: ['./src/test/setup.js'],
    // Include test files
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        'dist/',
      ],
    },
  },
  resolve: {
    // Match the alias from vite.config.js
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
