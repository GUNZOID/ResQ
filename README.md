# ResQ — Offline Decentralized Disaster Communication & Emergency Lifeline
Ctrl+Think 2.0

**ResQ** is an offline-first decentralized emergency communications platform designed to function during total cellular, electrical grid, and internet blackouts.

---

## Key Features

1. **Decentralized Local P2P Mesh Network**:
   - Multi-hop packet relay (up to 5 radio hops) across nearby nodes.
   - Pinned **Public Mesh Network Channel** for neighborhood broadcasts and Civil Defence dispatches.
   - 1-on-1 encrypted direct messaging between trusted family circle nodes.

2. **100% On-Device Offline AI (Guardian AI)**:
   - Powered locally by **Qwen 2.5 (0.5B Instruct GGUF)** via `node-llama-cpp`.
   - Zero cloud inference, zero external API calls, zero telemetry.
   - Instant field triage, disaster safety, water purification, and survival guidance.

3. **Tactical Mapping & Offline Infrastructure**:
   - Google Maps Tactical Dark Theme with GPS pinpointing across Delhi NCR.
   - 100% offline PMTiles vector map archive fallback for zero-connectivity environments.
   - Pre-loaded offline database of hospitals, police stations, fire brigades, and verified safe zones with pincode/area search.

4. **Instant Distress SOS & Emergency Hotkeys**:
   - Direct emergency hotkeys for **Police (112 / 100)**, **Ambulance (108 / 102)**, and **Fire Brigade (101)**.
   - Anti-accidental swipe-to-activate circular SOS slider knob.
   - Optical distress strobe flashlight and audible locator chime.

5. **On-Device Emergency Medical ID & Account**:
   - Offline storage for name, age, blood group, emergency contacts, and medical conditions/allergies.
   - Attached to distress packets during active emergency SOS.

---

## Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **bun**

### 2. Installation
```bash
git clone https://github.com/GUNZOID/ResQ.git
cd ResQ
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=3001
VITE_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
```

### 4. Local Model Setup (For Guardian AI)
Download the Qwen 2.5 (0.5B GGUF) model into the project root:
- Model file: `qwen2.5-0.5b-instruct-q4_k_m.gguf`

### 5. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3001`** in your browser.

---

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Leaflet / Google Maps API / MapLibre GL
- **Backend / Inference**: Express, Node.js, `node-llama-cpp`, `dotenv`
- **Database & Storage**: Dexie.js (IndexedDB), LocalStorage, SQLite
