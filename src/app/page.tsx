'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState('');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [memoryHistory, setMemoryHistory] = useState([
    { id: 1, name: 'Shawn', type: 'Person', time: '2 min ago', memory: 'College roommate, loves coffee' },
    { id: 2, name: 'Red Coffee Mug', type: 'Object', time: '15 min ago', memory: 'Favorite morning cup' },
    { id: 3, name: 'Mom', type: 'Person', time: '1 hour ago', memory: 'Lives in Chicago, calls every Sunday' }
  ]);
  const webcamRef = useRef<HTMLVideoElement>(null);

  const startDetection = () => {
    setIsDetecting(true);
    setResult('Analyzing...');
    
    // Simulate detection process
    setTimeout(() => {
      setResult('This is Shawn, your college roommate. He loves coffee and lives downtown.');
      setIsDetecting(false);
    }, 2000);
  };

  const speakResult = () => {
    if (result && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(result);
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Simulate webcam activation
    setIsWebcamActive(true);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black">
                CareLink
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-Time Intent Translator for Accessibility
              </p>
            </div>

            {/* Right side - User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9 ring-2 ring-gray-200">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-black text-white text-sm font-semibold">T</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">Hi John</p>
                      <p className="text-xs text-gray-500">Premium User</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 p-0" align="end">
                {/* Profile Header */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-black text-white text-lg font-semibold">T</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Tobi Salawu</p>
                      <p className="text-sm text-gray-600">tobi@memorylens.com</p>
                      <div className="flex items-center mt-1">
                        <Badge variant="default" className="bg-black text-white text-xs px-2 py-1">
                          Premium User
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="p-2">
                  <DropdownMenuItem className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Profile Settings</p>
                      <p className="text-xs text-gray-500">Manage your account</p>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Memory Settings</p>
                      <p className="text-xs text-gray-500">Configure AI preferences</p>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Usage Analytics</p>
                      <p className="text-xs text-gray-500">View your statistics</p>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Help & Support</p>
                      <p className="text-xs text-gray-500">Get assistance</p>
                    </div>
                  </DropdownMenuItem>
                </div>
                
                {/* Divider */}
                <Separator className="my-2" />
                
                {/* Sign Out */}
                <div className="p-2">
                  <DropdownMenuItem className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 cursor-pointer text-red-600 hover:text-red-700">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Sign Out</p>
                      <p className="text-xs text-red-500">End your session</p>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column - Webcam & Quick Actions */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Webcam Section */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Live Camera</CardTitle>
                <CardDescription>Point your camera at a person or object to recognize them</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Webcam Display */}
                <div className="relative">
                  <div className="bg-gray-50 rounded-xl overflow-hidden aspect-video flex items-center justify-center border-2 border-dashed border-gray-200">
                    {isWebcamActive ? (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-700 font-medium">Camera Active</p>
                        <p className="text-sm text-gray-500">Point at a person or object</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <p className="text-gray-500">Camera Inactive</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Detection Button */}
                  <Button
                    onClick={startDetection}
                    disabled={isDetecting}
                    size="lg"
                    className="mt-6 w-full h-12 text-base font-medium bg-black hover:bg-gray-800 text-white"
                  >
                    {isDetecting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      'Recognize Person/Object'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-24 flex-col space-y-2 bg-white hover:bg-gray-50 border-gray-200">
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Add Memory</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex-col space-y-2 bg-white hover:bg-gray-50 border-gray-200">
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Search</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex-col space-y-2 bg-white hover:bg-gray-50 border-gray-200">
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Gallery</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex-col space-y-2 bg-white hover:bg-gray-50 border-gray-200">
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Help</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results & Stats */}
          <div className="space-y-8">
            
            {/* Results Section */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Memory Results</CardTitle>
                <CardDescription>AI recognition results and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[200px] bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                  {result ? (
                    <div className="space-y-4">
                      <p className="text-lg leading-relaxed text-gray-800">{result}</p>
                      <Button
                        onClick={speakResult}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        Speak Result
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="font-medium">Click "Recognize" to start</p>
                      <p className="text-sm text-gray-400 mt-1">Point your camera at a person or object</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Memory History */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Recent Memories</CardTitle>
                <CardDescription>Your latest memory entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {memoryHistory.map((memory) => (
                    <div key={memory.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">{memory.name}</span>
                        <span className="text-xs text-gray-500">{memory.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                          {memory.type}
                        </Badge>
                        <span className="text-xs text-gray-600 max-w-[120px] truncate">{memory.memory}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">System Status</CardTitle>
                <CardDescription>Current system health and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Camera</span>
                    <Badge variant={isWebcamActive ? "default" : "destructive"} className="bg-black text-white">
                      {isWebcamActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">AI Models</span>
                    <Badge variant="default" className="bg-green-600 text-white">
                      Ready
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Memory Database</span>
                    <Badge variant="default" className="bg-green-600 text-white">
                      Connected
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Storage</span>
                    <Badge variant="outline" className="border-gray-300 text-gray-700">
                      2.4 GB / 10 GB
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
