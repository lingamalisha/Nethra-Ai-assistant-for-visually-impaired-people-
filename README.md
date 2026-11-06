# AI-Powered Accessibility Assistant for Visually Impaired Users

> A mobile-first, voice-guided Progressive Web App (PWA) designed specifically for visually impaired individuals in India. Features multilingual OCR in English, Hindi, and Kannada, AI scene description, Indian currency recognition (₹10 to ₹2000), and hands-free trilingual voice controls.

---

## 🌟 Key Capabilities

1. **Multilingual Text Reading (OCR)**:
   - Captures printed books, medicine packages, food labels, and bills.
   - Extracts text across **English, Hindi (Devanagari), and Kannada (ಕನ್ನಡ)** scripts.
   - Reads extracted text aloud with natural regional cadence.

2. **AI Scene Description**:
   - Analyzes surroundings to announce visible objects, surfaces, and obstacles.
   - Provides localized descriptions in English, Hindi, or Kannada.
   - Includes safety disclaimers to prevent unsafe navigation reliance.

3. **Indian Currency Recognition**:
   - Identifies Indian Rupee banknotes: **₹10, ₹20, ₹50, ₹100, ₹200, ₹500, ₹2000**.
   - Incorporates a confidence threshold safeguard that requests note flattening/repositioning when uncertain.
   - Explicitly disclaims counterfeit detection.

4. **Trilingual Voice-Controlled Assistant**:
   - Hands-free voice operation across English, Hindi, and Kannada.
   - Voice commands: *"Read this"* / *"यह पढ़ो"* / *"ಇದನ್ನು ಓದಿ"*, *"Describe"* / *"वर्णन करो"* / *"ವಿವರಿಸಿ"*, *"Currency"* / *"नोट पहचानो"* / *"ಹಣ ನೋಡು"*, *"Stop"*, *"Repeat"*, *"Slower"*, *"Faster"*, *"Change language"*.
   - Push-to-talk button fallback for noisy environments.

5. **Accessibility-First Design**:
   - WCAG AAA compliance with high-contrast safety yellow (`#FACC15`) on dark slate (`#0A0A0C`).
   - Tactile touch targets exceeding 72px for thumb navigation.
   - Audio earcons (Web Audio API) for instant non-visual feedback on taps, shutter, and results.
   - Dual ARIA live regions (`assertive` and `polite`) fully compatible with Android TalkBack.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Progressive Web App (PWA with Service Worker & Web App Manifest).
- **Backend**: Node.js, Express, TypeScript (`server.ts`).
- **Vision & Multimodal AI**: Server-side Google GenAI SDK (`@google/genai`) with Gemini multimodal models.
- **Speech & Audio**: Web Speech API (`SpeechSynthesis` & `SpeechRecognition`), Web Audio API for earcons.
- **Deployment**: Docker container on Google Cloud Run.

---

## 🚀 Live Deployment & PWA Installation

- **Production URL**: Available live in the AI Studio header.
- **PWA Installation on Android**:
  1. Open the app URL in Chrome on Android.
  2. Tap **"Install App"** in the top bar or select **"Add to Home Screen"** in Chrome menu.
  3. The app installs as a standalone fullscreen app on your phone.
- **PWA Installation on iOS**:
  1. Open in Safari.
  2. Tap the **Share** button.
  3. Select **Add to Home Screen**.

---

## 💻 Local Development Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/accessibility-assistant.git
   cd accessibility-assistant
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set environment variable**:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY in .env
   ```

4. **Start full-stack development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

5. **Production build & run**:
   ```bash
   npm run build
   npm start
   ```

---

## 🐳 Docker Deployment

```bash
# Build Docker image
docker build -t accessibility-assistant .

# Run container
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key" accessibility-assistant
```

Or using Docker Compose:
```bash
docker-compose up --build
```

---

## 🛡️ Privacy Statement

All captured camera frames are processed in-memory directly within RAM buffers and discarded immediately following inference. No user photographs are persistently written to disk or stored.
