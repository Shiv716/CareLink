'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SignLanguageAPI } from '@/services/signLanguageAPI';
import { DetectionResponse } from '@/types/api';

export default function SignDetector() {
  const [result, setResult] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);
  const [supportedSigns, setSupportedSigns] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check API health on component mount
  useEffect(() => {
    checkAPIHealth();
    getSupportedSigns();
  }, []);

  const checkAPIHealth = async () => {
    const health = await SignLanguageAPI.checkHealth();
    setApiHealth(health);
  };

  const getSupportedSigns = async () => {
    const signs = await SignLanguageAPI.getSupportedSigns();
    setSupportedSigns(signs);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Camera access denied. Please allow camera access.');
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
      const data: DetectionResponse = await SignLanguageAPI.detectSign(videoBlob);
      setResult(data.result);
      
      // Update API health after successful detection
      setApiHealth(true);
    } catch (error) {
      console.error('Detection failed:', error);
      setResult('Detection failed - check backend connection');
      setApiHealth(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResult = async () => {
    if (!result) return;
    
    setIsSpeaking(true);
    
    // Debug: Check if OpenAI API key is loaded
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    console.log('OpenAI API Key loaded:', apiKey ? 'Yes' : 'No');
    console.log('API Key length:', apiKey?.length || 0);
    console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'None');
    
    try {
      // Try OpenAI TTS first (high quality)
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: result,
          voice: 'alloy',
          response_format: 'mp3'
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        console.error('OpenAI TTS API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        
        // Fallback to browser speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(result);
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('OpenAI TTS failed, using fallback:', error);
      // Fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(result);
        speechSynthesis.speak(utterance);
      }
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Language Detection</CardTitle>
        <CardDescription>Detect sign language gestures in real-time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Status */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Backend Status:</span>
          <Badge 
            variant={apiHealth === null ? "outline" : apiHealth ? "default" : "destructive"}
            className={apiHealth === null ? "border-gray-300" : apiHealth ? "bg-green-600" : "bg-red-600"}
          >
            {apiHealth === null ? 'Checking...' : apiHealth ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {/* Camera Video */}
        <div className="relative">
          {/* Simple Video Container */}
          <div className="bg-black rounded-xl overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
          
          {/* Controls */}
          <div className="mt-4 space-y-3">
            <Button
              onClick={startCamera}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-100"
            >
              {isCameraActive ? 'Restart Camera' : 'Start Camera'}
            </Button>
            
            {/* Debug Button */}
            <Button
              onClick={() => {
                if (videoRef.current) {
                  console.log('Video element:', videoRef.current);
                  console.log('Video srcObject:', videoRef.current.srcObject);
                  console.log('Video readyState:', videoRef.current.readyState);
                }
              }}
              variant="outline"
              size="sm"
              className="w-full border-gray-300 hover:bg-gray-100 text-xs"
            >
              Debug Camera
            </Button>
            
            <Button
              onClick={startRecording}
              disabled={!isCameraActive || isRecording || isProcessing}
              size="lg"
              className="w-full h-12 text-base font-medium bg-black hover:bg-gray-800 text-white disabled:bg-gray-400"
            >
              {isRecording ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recording... (3s)
                </>
              ) : isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Detect Sign Language'
              )}
            </Button>
          </div>
        </div>

        {/* Supported Signs */}
        {supportedSigns.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Supported Signs:</h4>
            <div className="flex flex-wrap gap-2">
              {supportedSigns.map((sign) => (
                <Badge key={sign} variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                  {sign}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Detection Result:</h4>
            <p className="text-lg text-gray-800 mb-3">{result}</p>
            <Button
              onClick={speakResult}
              disabled={isSpeaking}
              variant="outline"
              size="sm"
              className="border-gray-300 hover:bg-gray-100"
            >
              {isSpeaking ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Speaking...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Speak Result
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
