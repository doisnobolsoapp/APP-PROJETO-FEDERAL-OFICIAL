import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// API Handlers
import parseEditalHandler from "./api/parse-edital.ts";
import analyzeMockHandler from "./api/analyze-mock.ts";
import generateCycleHandler from "./api/generate-cycle.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/parse-edital", parseEditalHandler);
  app.post("/api/analyze-mock", analyzeMockHandler);
  app.post("/api/generate-cycle", generateCycleHandler);

  // In production, serve the dist folder
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production server running on http://localhost:${PORT}`);
  });
}

startServer();
