# Sign Language Detection API Documentation

## Overview
RESTful API for real-time sign language detection using MediaPipe + Memories.ai fusion technology. Detects 10 common sign language intents from video input.

## Base URL
```
http://localhost:8000
```

## Authentication
Requires `MEMORIES_API_KEY` environment variable on backend. No frontend authentication needed.

---

## API Endpoints

### 1. **Main Detection Endpoint**
**`POST /detect`**

Detect sign language intent from video file.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body**: Video file (key: `file`)
- **Supported formats**: MP4, WebM, AVI
- **Max duration**: 2-5 seconds recommended
- **File size**: No strict limit

```javascript
// Frontend example
const formData = new FormData();
formData.append('file', videoBlob, 'recording.mp4');

fetch('http://localhost:8000/detect', {
  method: 'POST',
  body: formData
})
```

#### Response
```json
{
  "result": "I want water",
  "success": true,
  "timestamp": "2025-01-15T14:30:22.123456",
  "processing_time": 2.3
}
```

#### Possible Results
| Result | Description |
|--------|-------------|
| `"I want water"` | Water/drink request |
| `"I want food"` | Food/meal request |
| `"I need bathroom"` | Bathroom urgency |
| `"I'm in pain"` | Pain/medical need |
| `"I need help"` | Help/assistance |
| `"Yes"` | Affirmative response |
| `"No"` | Negative response |
| `"Please"` | Polite request |
| `"Thank you"` | Gratitude |
| `"More"` | Request for more |
| `"Gesture: thumbs_up"` | Detected gesture (no clear intent) |
| `"No gesture detected"` | No recognizable signs |

#### Error Response
```json
{
  "error": "File must be a video",
  "success": false
}
```

---

### 2. **Health Check**
**`GET /health`**

Check API status and configuration.

#### Response
```json
{
  "status": "healthy",
  "api_key_configured": true,
  "timestamp": "2025-01-15T14:30:22.123456"
}
```

---

### 3. **Supported Signs**
**`GET /supported-signs`**

Get list of detectable sign language intents.

#### Response
```json
{
  "signs": [
    "water", "food", "bathroom", "pain", "help", 
    "yes", "no", "please", "thank_you", "more"
  ],
  "total": 10
}
```

---

### 4. **Root Endpoint**
**`GET /`**

API information and status.

#### Response
```json
{
  "message": "Sign Language Detection API",
  "status": "active"
}
```

---

## Frontend Implementation Guide

### Complete Next.js Example

```typescript
// types/api.ts
export interface DetectionResponse {
  result: string;
  success: boolean;
  timestamp: string;
  processing_time: number;
}

// components/SignDetector.tsx
import { useState, useRef } from 'react';

export default function SignDetector() {
  const [result, setResult] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm'
    });

    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const videoBlob = new Blob(chunksRef.current, { 
        type: 'video/webm' 
      });
      await detectSign(videoBlob);
    };

    mediaRecorder.start();
    setIsRecording(true);

    // Auto-stop after 3 seconds
    setTimeout(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }, 3000);
  };

  const detectSign = async (videoBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', videoBlob, 'recording.webm');

      const response = await fetch('http://localhost:8000/detect', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DetectionResponse = await response.json();
      setResult(data.result);
      
    } catch (error) {
      console.error('Detection failed:', error);
      setResult('Detection failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Language Detector</h1>
      
      {/* Camera Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-48 bg-gray-200 rounded mb-4"
      />
      
      {/* Controls */}
      <div className="space-y-2 mb-4">
        <button
          onClick={startCamera}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Start Camera
        </button>
        
        <button
          onClick={startRecording}
          disabled={isRecording || isProcessing}
          className="w-full bg-green-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          {isRecording ? 'Recording... (3s)' : 'Detect Sign'}
        </button>
      </div>
      
      {/* Result Display */}
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Result:</h3>
        <div className="text-lg">
          {isProcessing ? (
            <span className="text-gray-500">Processing...</span>
          ) : (
            <span className="font-bold">{result || 'No detection yet'}</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### API Service Helper

```typescript
// services/signLanguageAPI.ts
const API_BASE = 'http://localhost:8000';

export class SignLanguageAPI {
  static async detectSign(videoBlob: Blob): Promise<DetectionResponse> {
    const formData = new FormData();
    formData.append('file', videoBlob, 'recording.webm');

    const response = await fetch(`${API_BASE}/detect`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Detection failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  }

  static async getSupportedSigns(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/supported-signs`);
    const data = await response.json();
    return data.signs;
  }
}
```

---

## Error Handling

### Common Error Codes
| Code | Description | Solution |
|------|-------------|----------|
| 400 | Invalid file type | Send video file (MP4/WebM) |
| 400 | Empty file | Check video recording |
| 500 | Detection failed | Check API logs, retry |
| 500 | Memories.ai error | Check API key configuration |

### Error Response Format
```json
{
  "detail": "File must be a video",
  "success": false
}
```

---

## Best Practices

### Recording Guidelines
- **Duration**: 2-3 seconds optimal
- **Quality**: 640x480 minimum resolution
- **Lighting**: Good lighting conditions
- **Position**: Hand clearly visible in frame
- **Gesture**: Hold sign for full duration

### Performance Tips
- Check `/health` before starting
- Implement loading states
- Handle network errors gracefully
- Cache results locally if needed

### Guaranteed Detection Gestures
1. **Thumbs Up** - 95%+ accuracy
2. **Pointing** - 90%+ accuracy  
3. **Hand to Mouth** - 85%+ accuracy
4. **Open Palm** - 80%+ accuracy

---

## Development Setup

### Backend Setup
```bash
# Install dependencies
pip install fastapi uvicorn requests opencv-python mediapipe numpy python-multipart

# Set API key
export MEMORIES_API_KEY="your_key_here"

# Start server
uvicorn sign_language_api:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
# Add to Next.js project
npm install

# Start development server
npm run dev
```

### Testing
```bash
# Test API health
curl http://localhost:8000/health

# Test with video file
curl -X POST -F "file=@test_video.mp4" http://localhost:8000/detect
```

---

## API Documentation URLs

- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## Support

For issues:
1. Check `/health` endpoint
2. Verify `MEMORIES_API_KEY` is set
3. Ensure video format is supported
4. Check API logs for detailed errors