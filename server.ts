import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Increase body parser payload size to accommodate high-res camera frames
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initialize GoogleGenAI SDK with server-side API Key
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Helper to sanitize base64 image data strings
 */
function cleanBase64(dataUrlOrBase64: string): { data: string; mimeType: string } {
  if (dataUrlOrBase64.includes(';base64,')) {
    const parts = dataUrlOrBase64.split(';base64,');
    const mimeType = parts[0].replace('data:', '');
    return { data: parts[1], mimeType };
  }
  return { data: dataUrlOrBase64, mimeType: 'image/jpeg' };
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(apiKey),
    capabilities: [
      'multilingual_ocr (eng, hin, kan)',
      'scene_description',
      'indian_currency_recognition (₹10-₹2000)',
    ],
  });
});

/**
 * Feature 1: Multilingual Text Reading (OCR)
 * Supports English, Hindi, and Kannada script extraction.
 */
app.post('/api/ocr', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { image, language_hint = 'auto' } = req.body;
    if (!image) {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    const { data, mimeType } = cleanBase64(image);

    let langInstruction = 'Extract all visible text in English, Hindi (Devanagari script), or Kannada script accurately.';
    if (language_hint === 'kn') {
      langInstruction = 'Focus on extracting Kannada script text (ಕನ್ನಡ) and English text.';
    } else if (language_hint === 'hi') {
      langInstruction = 'Focus on extracting Hindi text in Devanagari script (हिन्दी) and English text.';
    }

    const prompt = `You are a high-precision computer vision OCR engine for an accessibility assistant for visually impaired users.
${langInstruction}
Transcribe all text from this image faithfully.
If text is angled, crumpled, or partially shadowed, do your best to reconstruct it.
If the image has NO readable text or is too blurry to decipher, indicate so clearly.

Respond in structured JSON format with:
- "text": The extracted text verbatim as a string. If no text, return empty string.
- "detected_scripts": Array of detected script names (e.g. ["Latin", "Devanagari", "Kannada"]).
- "primary_language": "en" | "hi" | "kn" | "mixed" | "unknown".
- "confidence": Estimated percentage confidence (0-100).
- "is_confident": Boolean (true if confidence >= 45, false otherwise).
- "warning": Null if confident, or friendly guidance for the visually impaired user if unreadable (e.g., "Text is blurry. Please hold camera closer and steady.").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            detected_scripts: { type: Type.ARRAY, items: { type: Type.STRING } },
            primary_language: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            is_confident: { type: Type.BOOLEAN },
            warning: { type: Type.STRING, nullable: true },
          },
          required: ['text', 'detected_scripts', 'primary_language', 'confidence', 'is_confident'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const processingTimeMs = Date.now() - startTime;

    res.json({
      status: 'success',
      text: parsed.text || '',
      detected_scripts: parsed.detected_scripts || ['Latin'],
      primary_language: parsed.primary_language || 'en',
      confidence: parsed.confidence ?? 85,
      is_confident: parsed.is_confident ?? true,
      warning: parsed.warning || null,
      processing_time_ms: processingTimeMs,
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message || 'Failed to process OCR request',
      processing_time_ms: Date.now() - startTime,
    });
  }
});

/**
 * Feature 2: AI Scene Description
 * Supports English, Hindi, and Kannada semantic descriptions with safety warnings.
 */
app.post('/api/describe', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { image, target_language = 'en' } = req.body;
    if (!image) {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    const { data, mimeType } = cleanBase64(image);

    let langNote = 'Provide the description in concise, natural English.';
    if (target_language === 'kn') {
      langNote = 'Provide the description in natural Kannada (ಕನ್ನಡದಲ್ಲಿ). Do not output English.';
    } else if (target_language === 'hi') {
      langNote = 'Provide the description in natural Hindi (हिन्दी में). Do not output English.';
    }

    const prompt = `You are an AI scene describer for a visually impaired user in India.
Look at this camera image and describe the scene in 1 to 2 clear, helpful sentences.
Identify:
1. The primary objects, surfaces, or persons directly in front.
2. Immediate spatial relationships or potential obstacles (e.g. door, table edge, stairs, person standing).
Keep it conversational, concise, and easy to understand when read aloud by text-to-speech.
${langNote}

Respond in JSON format with:
- "description": The spoken 1-2 sentence description.
- "detected_objects": Array of key detected objects/elements.
- "safety_warning": Any immediate safety notice if applicable (or null).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            detected_objects: { type: Type.ARRAY, items: { type: Type.STRING } },
            safety_warning: { type: Type.STRING, nullable: true },
          },
          required: ['description', 'detected_objects'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const processingTimeMs = Date.now() - startTime;

    res.json({
      status: 'success',
      text: parsed.description,
      detected_objects: parsed.detected_objects || [],
      safety_warning: parsed.safety_warning || null,
      disclaimer: 'Scene descriptions may be inaccurate. Do not rely on them for road crossing or critical navigation.',
      processing_time_ms: processingTimeMs,
    });
  } catch (error: any) {
    console.error('Scene Describe Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message || 'Failed to describe scene',
      processing_time_ms: Date.now() - startTime,
    });
  }
});

/**
 * Feature 4: Indian Currency Recognition (₹10 to ₹2000)
 * Classifies denomination and applies uncertainty threshold.
 */
app.post('/api/currency', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { image, target_language = 'en' } = req.body;
    if (!image) {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    const { data, mimeType } = cleanBase64(image);

    const prompt = `You are an expert Indian currency note recognition engine for a visually impaired user.
Identify the Indian Rupee banknote in this image.
Valid denominations: 10, 20, 50, 100, 200, 500, 2000.
Also consider if the note is partially visible, folded, soiled, or if no currency note is present.

If confidence is below 70% or the note is unclear/obscured/not a valid rupee note, set "is_uncertain": true and denomination to "unknown".

Respond in JSON with:
- "denomination": String: "10" | "20" | "50" | "100" | "200" | "500" | "2000" | "unknown"
- "confidence": Number between 0 and 100
- "is_uncertain": Boolean (true if not clearly identifiable or confidence < 70)
- "note_condition": String (e.g. "crisp", "folded", "soiled", "partial", "clear")
- "announcement_en": English spoken announcement (e.g. "500 Rupees note detected")
- "announcement_hi": Hindi spoken announcement (e.g. "500 रुपये का नोट पहचाना गया")
- "announcement_kn": Kannada spoken announcement (e.g. "500 ರೂಪಾಯಿ ನೋಟು ಪತ್ತೆಯಾಗಿದೆ")`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            denomination: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            is_uncertain: { type: Type.BOOLEAN },
            note_condition: { type: Type.STRING },
            announcement_en: { type: Type.STRING },
            announcement_hi: { type: Type.STRING },
            announcement_kn: { type: Type.STRING },
          },
          required: [
            'denomination',
            'confidence',
            'is_uncertain',
            'announcement_en',
            'announcement_hi',
            'announcement_kn',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const processingTimeMs = Date.now() - startTime;

    let announcement = parsed.announcement_en;
    if (target_language === 'kn') announcement = parsed.announcement_kn;
    else if (target_language === 'hi') announcement = parsed.announcement_hi;

    let warning: string | null = null;
    if (parsed.is_uncertain) {
      warning =
        target_language === 'kn'
          ? 'ನೋಟು ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ನೋಟನ್ನು ಮಡಚದೆ ನೇರವಾಗಿ ಹಿಡಿದು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
          : target_language === 'hi'
          ? 'नोट स्पष्ट नहीं है। कृपया नोट को सीधा करके दोबारा प्रयास करें।'
          : 'Cannot confirm denomination clearly. Please flatten the note and try again.';
      announcement = warning;
    }

    res.json({
      status: 'success',
      denomination: parsed.denomination,
      confidence: parsed.confidence,
      is_uncertain: parsed.is_uncertain,
      text: announcement,
      warning,
      disclaimer: 'Currency recognition does not verify authenticity or detect counterfeit notes.',
      processing_time_ms: processingTimeMs,
    });
  } catch (error: any) {
    console.error('Currency Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message || 'Failed to classify currency',
      processing_time_ms: Date.now() - startTime,
    });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Asset Serving
// -------------------------------------------------------------
async function startServer() {
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
