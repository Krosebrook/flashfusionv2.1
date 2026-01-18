import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true'
    }),
    react(),
  ],
  server: {
    // Support dynamic port assignment for Replit and other cloud platforms
    // Replit automatically sets PORT environment variable
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5173,
    host: true, // Listen on all addresses (0.0.0.0) for Replit
    strictPort: false, // Allow fallback to another port if specified port is in use
  },
  preview: {
    // Same port configuration for production preview
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4173,
    host: true,
    strictPort: false,
  }
});