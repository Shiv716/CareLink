#!/usr/bin/env python3
"""
Sign Language Detection API Backend
FastAPI backend to expose sign language detection features to Next.js frontend

Requirements:
- pip install fastapi uvicorn requests opencv-python mediapipe numpy python-multipart
- Set MEMORIES_API_KEY environment variable

Usage:
    uvicorn sign_language_api:app --reload --host 0.0.0.0 --port 8000
"""

import os
import sys
import time
import cv2
import requests
import mediapipe as mp
import numpy as np
from datetime import datetime
from typing import List, Dict, Optional, Any, Tuple
import tempfile
import math
import base64
from io import BytesIO

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configuration
API_KEY = os.environ.get("MEMORIES_API_KEY")
API_BASE = "https://api.memories.ai"
UNIQUE_ID = "sign-language-api"

# MediaPipe setup
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Sign patterns (same as before)
SIGN_PATTERNS = {
    "water": {
        "visual_cues": ["hand to mouth", "drinking motion", "cup shape", "pouring", "tapping lips", "finger to mouth"],
        "keywords": ["water", "drink", "thirsty", "liquid", "beverage", "sip"],
        "gestures": ["W handshape", "index finger tapping chin", "drinking gesture"],
        "landmarks": "hand_to_mouth"
    },
    "food": {
        "visual_cues": ["hand to mouth eating", "chewing motion", "fork motion", "spoon motion", "bite gesture"],
        "keywords": ["food", "eat", "hungry", "meal", "snack", "bite", "chew"],
        "gestures": ["fingers to mouth", "eating motion", "food handshape"],
        "landmarks": "fingers_to_mouth"
    },
    "help": {
        "visual_cues": ["raised hand", "waving", "both hands up", "reaching out", "urgent gesture"],
        "keywords": ["help", "assistance", "emergency", "aid", "support", "rescue"],
        "gestures": ["help sign", "SOS gesture", "raised arms", "beckoning"],
        "landmarks": "hands_raised"
    },
    "bathroom": {
        "visual_cues": ["T handshape", "shaking motion", "pointing down", "urgent movement"],
        "keywords": ["bathroom", "toilet", "restroom", "urgent", "need to go", "potty"],
        "gestures": ["T sign", "restroom sign", "bathroom gesture"],
        "landmarks": "t_handshape"
    },
    "pain": {
        "visual_cues": ["pointing to body part", "holding area", "grimacing", "touching head", "clutching"],
        "keywords": ["pain", "hurt", "ache", "sore", "ouch", "injury", "medical"],
        "gestures": ["pain sign", "pointing to hurt area", "holding gesture"],
        "landmarks": "pointing_gesture"
    },
    "yes": {
        "visual_cues": ["nodding", "thumbs up", "fist nodding", "head movement up down"],
        "keywords": ["yes", "agree", "okay", "correct", "right", "positive"],
        "gestures": ["yes sign", "thumbs up", "nodding fist", "affirmative"],
        "landmarks": "thumbs_up"
    },
    "no": {
        "visual_cues": ["head shaking", "thumbs down", "hand waving", "dismissive gesture"],
        "keywords": ["no", "disagree", "wrong", "stop", "negative", "refuse"],
        "gestures": ["no sign", "head shake", "dismissive wave", "negative"],
        "landmarks": "hand_wave"
    },
    "please": {
        "visual_cues": ["hand on chest", "circular motion", "polite gesture", "open palm"],
        "keywords": ["please", "request", "polite", "ask", "kindly"],
        "gestures": ["please sign", "chest circular motion", "polite gesture"],
        "landmarks": "hand_on_chest"
    },
    "thank_you": {
        "visual_cues": ["hand from chin forward", "grateful gesture", "bowing motion"],
        "keywords": ["thank you", "thanks", "grateful", "appreciate", "gratitude"],
        "gestures": ["thank you sign", "chin to forward motion", "grateful gesture"],
        "landmarks": "chin_to_forward"
    },
    "more": {
        "visual_cues": ["fingertips together", "tapping motion", "repeat gesture"],
        "keywords": ["more", "again", "repeat", "additional", "extra"],
        "gestures": ["more sign", "fingertips touching", "repeat motion"],
        "landmarks": "fingertips_together"
    }
}


# Pydantic models
class DetectionResponse(BaseModel):
    result: str
    success: bool
    timestamp: str
    processing_time: float


class ErrorResponse(BaseModel):
    error: str
    success: bool = False


# FastAPI app
app = FastAPI(title="Sign Language Detection API", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SignLanguageDetector:
    def __init__(self):
        if not API_KEY:
            raise Exception("MEMORIES_API_KEY environment variable not set")
        self.headers = {"Authorization": API_KEY}

        # Initialize MediaPipe (optimized for speed)
        self.hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.3,
            model_complexity=0
        )

    def analyze_hand_landmarks(self, hand_landmarks) -> List[str]:
        """Fast hand landmark analysis."""
        detected_patterns = []

        if not hand_landmarks:
            return detected_patterns

        # Get key landmarks
        thumb_tip = hand_landmarks.landmark[4]
        index_tip = hand_landmarks.landmark[8]
        middle_tip = hand_landmarks.landmark[12]
        wrist = hand_landmarks.landmark[0]

        # Fast pattern detection
        if thumb_tip.y < wrist.y and index_tip.y > wrist.y:
            detected_patterns.append("thumbs_up")

        if index_tip.y < wrist.y and middle_tip.y > index_tip.y:
            detected_patterns.append("pointing_gesture")

        if index_tip.y < 0.3:
            detected_patterns.append("hand_to_mouth")

        finger_spread = abs(thumb_tip.x - index_tip.x)
        if finger_spread > 0.1:
            detected_patterns.append("open_palm")

        return detected_patterns

    def process_video_frames(self, video_data: bytes) -> List[str]:
        """Process video data and return MediaPipe patterns."""
        try:
            # Save video data to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
                temp_file.write(video_data)
                temp_path = temp_file.name

            # Process video with OpenCV
            cap = cv2.VideoCapture(temp_path)
            all_patterns = []
            frame_count = 0

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                frame_count += 1

                # Process every 3rd frame for speed
                if frame_count % 3 == 0:
                    small_frame = cv2.resize(frame, (320, 240))
                    rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

                    hand_results = self.hands.process(rgb_frame)

                    if hand_results.multi_hand_landmarks:
                        for hand_landmarks in hand_results.multi_hand_landmarks:
                            patterns = self.analyze_hand_landmarks(hand_landmarks)
                            all_patterns.extend(patterns)

            cap.release()
            os.unlink(temp_path)

            return list(set(all_patterns))

        except Exception as e:
            print(f"Error processing video: {e}")
            return []

    def upload_to_memories_ai(self, video_data: bytes) -> Optional[str]:
        """Upload video to Memories.ai."""
        try:
            files = {"file": ("video.mp4", video_data, "video/mp4")}
            data = {"unique_id": UNIQUE_ID}

            response = requests.post(
                f"{API_BASE}/serve/api/v1/upload",
                files=files,
                data=data,
                headers=self.headers,
                timeout=30
            )

            result = response.json()
            if result.get("code") == "0000":
                return result["data"]["videoNo"]
            return None

        except Exception as e:
            print(f"Upload error: {e}")
            return None

    def get_ai_analysis(self, video_no: str) -> Optional[List[Dict[str, Any]]]:
        """Get analysis from Memories.ai."""
        for _ in range(15):  # 30 second timeout
            try:
                params = {"video_no": video_no, "unique_id": UNIQUE_ID}
                response = requests.get(
                    f"{API_BASE}/serve/api/v1/get_video_transcription",
                    headers=self.headers,
                    params=params,
                    timeout=10
                )

                result = response.json()
                if result.get("code") == "0000":
                    return result["data"]["transcriptions"]
            except:
                pass
            time.sleep(1)
        return None

    def fusion_analysis(self, transcriptions: List[Dict], mediapipe_patterns: List[str]) -> str:
        """Combine analysis and return final result."""

        # Combine AI text
        all_text = ""
        for segment in transcriptions or []:
            content = segment.get("content", "").lower()
            all_text += " " + content

        # Score intents
        intent_scores = {}

        for intent_name, patterns in SIGN_PATTERNS.items():
            score = 0

            # AI analysis scoring
            for cue in patterns["visual_cues"]:
                if cue in all_text:
                    score += 3
            for keyword in patterns["keywords"]:
                if keyword in all_text:
                    score += 2
            for gesture in patterns["gestures"]:
                if gesture in all_text:
                    score += 4

            # MediaPipe patterns (highest weight)
            landmark_pattern = patterns.get("landmarks", "")
            if landmark_pattern in mediapipe_patterns:
                score += 8

            if score > 0:
                intent_scores[intent_name] = score

        # Return result
        if not intent_scores:
            if mediapipe_patterns:
                return f"Gesture: {mediapipe_patterns[0]}"
            else:
                return "No gesture detected"

        # Get best intent
        best_intent = max(intent_scores, key=intent_scores.get)

        # Simple intent messages
        intent_messages = {
            "water": "I want water",
            "food": "I want food",
            "bathroom": "I need bathroom",
            "pain": "I'm in pain",
            "help": "I need help",
            "yes": "Yes",
            "no": "No",
            "please": "Please",
            "thank_you": "Thank you",
            "more": "More"
        }

        return intent_messages.get(best_intent, best_intent)

    def detect_sign(self, video_data: bytes) -> str:
        """Main detection method."""
        start_time = time.time()

        # Process with MediaPipe
        mediapipe_patterns = self.process_video_frames(video_data)

        # Upload to Memories.ai
        video_no = self.upload_to_memories_ai(video_data)

        if video_no:
            # Get AI analysis
            transcriptions = self.get_ai_analysis(video_no)
            # Fusion analysis
            result = self.fusion_analysis(transcriptions, mediapipe_patterns)
        else:
            # Fall back to MediaPipe only
            if mediapipe_patterns:
                result = f"Gesture: {mediapipe_patterns[0]}"
            else:
                result = "No gesture detected"

        return result


# Global detector instance
detector = SignLanguageDetector()


@app.get("/")
async def root():
    return {"message": "Sign Language Detection API", "status": "active"}


@app.post("/detect", response_model=DetectionResponse)
async def detect_sign_language(file: UploadFile = File(...)):
    """
    Detect sign language from uploaded video file.

    Accepts: MP4, WebM, AVI video files
    Returns: Detected intent or gesture
    """
    try:
        start_time = time.time()

        # Validate file type
        if not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File must be a video")

        # Read video data
        video_data = await file.read()

        if len(video_data) == 0:
            raise HTTPException(status_code=400, detail="Empty file received")

        # Detect sign language
        result = detector.detect_sign(video_data)

        processing_time = time.time() - start_time

        return DetectionResponse(
            result=result,
            success=True,
            timestamp=datetime.now().isoformat(),
            processing_time=round(processing_time, 2)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "api_key_configured": bool(API_KEY),
        "timestamp": datetime.now().isoformat()
    }


@app.get("/supported-signs")
async def get_supported_signs():
    """Get list of supported sign language intents."""
    return {
        "signs": list(SIGN_PATTERNS.keys()),
        "total": len(SIGN_PATTERNS)
    }


if __name__ == "__main__":
    if not API_KEY:
        print("❌ Error: Set MEMORIES_API_KEY environment variable")
        sys.exit(1)

    print("🚀 Starting Sign Language Detection API...")
    print("📡 API will be available at: http://localhost:8000")
    print("📖 API docs at: http://localhost:8000/docs")

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)