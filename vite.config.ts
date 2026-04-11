import path from 'path';
import { defineConfig } from 'vite';
import express from 'express';

// API Handlers
import parseEditalHandler from './api/parse-edital.ts';
import analyzeMockHandler from './api/analyze-mock.ts';
import generateCycleHandler from './api/generate-cycle.ts';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
  },
  server: {
    host: true,
    port: 3000,
    hmr: false, // Disabled as requested
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    {
      name: 'api-server',
      configureServer(server) {
        server.middlewares.use(express.json());
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/parse-edital' && req.method === 'POST') {
            return parseEditalHandler(req, res);
          }
          if (req.url === '/api/analyze-mock' && req.method === 'POST') {
            return analyzeMockHandler(req, res);
          }
          if (req.url === '/api/generate-cycle' && req.method === 'POST') {
            return generateCycleHandler(req, res);
          }
          next();
        });
      },
    },
  ],
});
