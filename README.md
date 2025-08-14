# CareLink: Real-Time Intent Translation for Accessibility

CareLink is an AI-powered platform designed to translate sign language gestures into spoken intent, enabling accessible communication for users with speech or hearing impairments. Built for the AI Engine Dawn Capital x memories.ai Hackathon, it leverages Next.js for the frontend and FastAPI for the backend, integrating MediaPipe and Memories.ai for robust gesture detection.

## Features

- **Real-Time Sign Language Detection:** Uses webcam video to detect and interpret common sign language gestures.
- **Intent Translation:** Converts gestures into clear, spoken intent using AI fusion (MediaPipe + Memories.ai).
- **Accessible UI:** Clean, responsive interface with quick actions and memory history.
- **Speech Output:** Detected intent can be spoken aloud using OpenAI TTS or browser speech synthesis.
- **Health & Status Monitoring:** Displays backend/API health and supported gestures.

## Demo

Watch the demo: [YouTube Video](https://youtu.be/kW9okYbBqXc)

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.8+
- [MEMORIES_API_KEY](https://memories.ai) (for backend)

### Backend Setup

```bash
cd backend
pip install fastapi uvicorn requests opencv-python mediapipe numpy python-multipart
export MEMORIES_API_KEY="your_key_here"
uvicorn sign_language_api:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Start both backend and frontend servers.
2. Open the web app and start the camera.
3. Record a sign language gesture (2-3 seconds).
4. View detected intent and optionally play it as speech.
5. Explore quick actions and memory history.

## API Endpoints

- `POST /detect` — Detect sign language intent from video.
- `GET /health` — Check backend health.
- `GET /supported-signs` — List supported gestures.

See [backend/readme.md](backend/readme.md) for full API documentation.

## Technologies

- **Frontend:** Next.js, React, Tailwind CSS, Radix UI
- **Backend:** FastAPI, MediaPipe, OpenCV, Memories.ai API
- **AI Fusion:** Combines hand landmark analysis and cloud-based video transcription

## Contributors

- [Shivang Chaudhary](https://www.linkedin.com/in/shivang-chaudhary-2235831b5/)
- [Aryan Kaushik](https://www.linkedin.com/in/aryankaushikdev/)
- [Mmesoma Nwachukwu](https://www.linkedin.com/in/mmesoma-nwachukwu-3a3862263/)
- [Tobi Salawu](https://www.linkedin.com/in/oluwatobi-s/)

## License

This project is for hackathon/demo purposes.

---

For issues or support, check the `/health` endpoint, verify your API key, and consult backend
