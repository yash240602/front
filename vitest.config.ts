import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // --- START: Aggressive Fix for "Too Many Open Files" Error ---
    pool: 'forks',
    poolOptions: {
      forks: {
        // This forces tests to run in a single process.
        singleFork: true,
        // Disabling isolation can reduce overhead and file handles.
        isolate: false,
      }
    },
    // Explicitly limit concurrency to 1.
    maxConcurrency: 1,
    // --- END: Aggressive Fix for "Too Many Open Files" Error ---
  },
})