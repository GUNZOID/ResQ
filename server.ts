import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getLlama, LlamaChatSession, type LlamaModel, type LlamaContext } from 'node-llama-cpp';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_MODEL_PATH = path.resolve(__dirname, 'qwen2.5-0.5b-instruct-q4_k_m.gguf');

const SYSTEM_PROMPT = `You are "Guardian AI", a direct, calm, and concise offline emergency survival assistant powered by a local Qwen LLM.
Provide actionable, step-by-step guidance for survival, first aid, disaster safety (floods, earthquakes, fires, storms), water purification, and emergency preparedness.
If a question involves complex surgery, prescription medications, or dangerous medical procedures beyond basic field first aid, clearly acknowledge uncertainty and urge seeking professional medical assistance when available.
Keep your answers clear, well-structured, and concise with bullet points.`;

function getPort(): number {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' || args[i] === '-p') {
      const p = parseInt(args[i + 1], 10);
      if (!isNaN(p)) return p;
    }
    if (args[i].startsWith('--port=')) {
      const p = parseInt(args[i].split('=')[1], 10);
      if (!isNaN(p)) return p;
    }
    if (args[i].startsWith('-p=')) {
      const p = parseInt(args[i].split('=')[1], 10);
      if (!isNaN(p)) return p;
    }
  }
  if (process.env.PORT) {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p)) return p;
  }
  return 3000;
}

let llamaModel: LlamaModel | null = null;
let llamaContext: LlamaContext | null = null;
let chatSession: LlamaChatSession | null = null;
let isModelInitializing = false;
let modelInitError: string | null = null;

async function initLocalLlama(): Promise<void> {
  if (llamaModel && chatSession) return;
  if (isModelInitializing) return;

  isModelInitializing = true;
  modelInitError = null;

  try {
    console.log(`[ResQ LLM] Loading local Qwen model from: ${LOCAL_MODEL_PATH}`);
    const llama = await getLlama();
    llamaModel = await llama.loadModel({
      modelPath: LOCAL_MODEL_PATH,
    });
    llamaContext = await llamaModel.createContext();
    chatSession = new LlamaChatSession({
      contextSequence: llamaContext.getSequence(),
      systemPrompt: SYSTEM_PROMPT,
    });
    console.log(`[ResQ LLM] Local Qwen 2.5 (0.5B GGUF) model initialized and ready for 100% offline inference.`);
  } catch (err: any) {
    modelInitError = err?.message || String(err);
    console.error(`[ResQ LLM] Failed to initialize local Qwen model:`, modelInitError);
  } finally {
    isModelInitializing = false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Enable CORS & expose Range headers for MapLibre & PMTiles
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization');
    res.header('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges, ETag');
    next();
  });

  const port = getPort();
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  // Initialize local LLM in background on startup
  initLocalLlama().catch((err) => {
    console.error('[ResQ LLM] Background model init failed:', err);
  });

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      model: 'qwen2.5-0.5b-instruct-q4_k_m.gguf',
      modelLoaded: Boolean(chatSession),
      offlineOnly: true,
      error: modelInitError,
    });
  });

  // Reset conversation session
  app.post('/api/chat/reset', async (_req, res) => {
    try {
      if (chatSession) {
        chatSession.resetChatHistory();
      }
      res.json({ status: 'ok', message: 'Chat history reset successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // LLM Chat endpoint using local Qwen GGUF model
  app.post('/api/chat', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!chatSession) {
        // Attempt one-time retry initialization if not ready yet
        if (!isModelInitializing) {
          await initLocalLlama();
        }
        if (!chatSession) {
          return res.status(503).json({
            error: `Local Qwen 2.5 model is not ready: ${modelInitError || 'Model initialization in progress'}`,
            source: 'local-model-error',
          });
        }
      }

      const abortController = new AbortController();
      res.on('close', () => {
        if (!res.writableEnded) {
          abortController.abort();
        }
      });

      const responseText = await chatSession.prompt(message, {
        signal: abortController.signal,
        maxTokens: 512,
        temperature: 0.6,
      });

      return res.json({
        reply: responseText.trim(),
        source: 'local-qwen2.5-0.5b',
        model: 'qwen2.5-0.5b-instruct-q4_k_m.gguf',
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return res.status(499).json({ error: 'Client cancelled request' });
      }
      console.error('[ResQ LLM] Inference error:', err);
      return res.status(500).json({
        error: `Local Qwen inference failed: ${err.message || String(err)}`,
        source: 'local-model-error',
      });
    }
  });

  // Serve public assets (including PMTiles) with native HTTP Range request support
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`ResQ-Mesh server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
