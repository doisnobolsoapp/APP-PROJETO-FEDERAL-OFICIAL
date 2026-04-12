import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Define a raiz como a pasta atual (onde está o index.html)
  base: '/',
  build: {
    outDir: 'dist',
    // Garante que o build não tente processar arquivos fora do escopo do front-end
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 3000,
    // Proxy opcional para desenvolvimento local:
    // Redireciona chamadas /api para o servidor local se necessário
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      // Mantém seu alias para facilitar imports na pasta src
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Removido o plugin 'api-server' que causava o erro de importação
  plugins: [],
});
