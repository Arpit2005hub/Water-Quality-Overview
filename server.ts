import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Initialize server-side Gemini client if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Server-side AI assistant proxy endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    const { message, context, history, language } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      // Return 503 so client-side domain engine seamlessly handles with offline intelligence
      return res.status(503).json({
        error: 'Gemini API key not configured on server',
        fallbackNeeded: true,
      });
    }

    try {
      const languageInstruction = language === 'hi'
        ? '\nPlease respond in clear, formal Hindi (हिन्दी) using appropriate limnological terminology (e.g. घुलित ऑक्सीजन, बीओडी, जल गुणवत्ता बेंचमार्क).'
        : '';

      const systemInstruction = `You are the Visarjan Ghat Watch Environmental Intelligence Assistant, a senior limnologist and environmental data specialist specializing in lake water quality monitoring in Bhopal, Madhya Pradesh, India.
Analyze water-quality observations across Bhopal ghats (Upper Lake/Bhojtal, Lower Lake/Chhota Talab, Shahpura Lake, reservoirs).
Ground your answers on CPCB Designated Best Use Class B Criteria (Outdoor Bathing/Immersion):
- Dissolved Oxygen (DO): ≥ 5.0 mg/L (Critical hypoxia: < 4.0 mg/L)
- Biochemical Oxygen Demand (BOD, 3-day at 27°C): ≤ 3.0 mg/L
- pH: 6.5 to 8.5
- Total Coliforms: Desirable ≤ 500 MPN/100ml, Max ≤ 2500 MPN/100ml.

Strictly adhere to:
1. Always clarify that historical screening observations do not represent real-time conditions.
2. Emphasize differences between enclosed basins (Lower Lake / Khatlapura Ghat) and engineered mitigation sites (Upper Lake Prempura Ghat with artificial eco-immersion pits).
3. Do not invent non-existent government violations or punitive actions. Use scientific framing like "out-of-benchmark reading" and "confirmatory priority screening".
4. Clarify that data is an illustrative historical screening dataset calibrated to CPCB standards.
5. Provide structured, precise responses with scientific explanations (aerobic decomposition, hypoxia, organic loading).${languageInstruction}

Context provided from dataset:
${context || 'No specific context provided'}`;

      const contents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history) {
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content || '' }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const reply = response.text || 'No response generated.';
      return res.json({
        reply,
        citations: [
          'Central Pollution Control Board (CPCB) Designated Best Use Criteria (Class B)',
          'Illustrative Historical Screening Dataset (Calibrated to CPCB Standards)',
          'Bhopal Lake Hydrological Basin Profile',
        ],
        suggestedFollowUps: [
          'Explain why Lower Lake is more vulnerable than Upper Lake',
          'What are the CPCB Class B thresholds?',
          'How do engineered eco-immersion pits protect open lake water?',
        ],
      });
    } catch (err: unknown) {
      console.error('Gemini API Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return res.status(500).json({ error: errorMessage, fallbackNeeded: true });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Visarjan Ghat Watch Server',
      timestamp: new Date().toISOString(),
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Mount Vite middlewares in development or serve static in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Visarjan Ghat Watch server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
