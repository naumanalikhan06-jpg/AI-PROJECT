/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { getTutorResponse, generateTutorVoice } from './services/geminiService';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  MessageSquare, 
  Terminal, 
  Activity, 
  Shield, 
  Zap, 
  ChevronRight,
  BrainCircuit,
  User,
  Settings
} from 'lucide-react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-entity': any;
      'a-sphere': any;
      'a-sky': any;
      'a-camera': any;
      'a-cursor': any;
      'a-text': any;
      'a-light': any;
      'a-ring': any;
      'a-assets': any;
      'a-asset-item': any;
      'a-box': any;
      'a-plane': any;
      'a-cylinder': any;
      'a-torus-knot': any;
    }
  }
}

const LEARNING_MODULES = [
  { id: 'quantum', title: 'Quantum Computing', icon: <Cpu className="w-4 h-4" /> },
  { id: 'neuro', title: 'Neural Networks', icon: <BrainCircuit className="w-4 h-4" /> },
  { id: 'ethics', title: 'AI Ethics', icon: <Shield className="w-4 h-4" /> },
  { id: 'robotics', title: 'Advanced Robotics', icon: <Settings className="w-4 h-4" /> },
];

export default function App() {
  const [showEntry, setShowEntry] = useState(true);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeModule, setActiveModule] = useState(LEARNING_MODULES[0]);
  const [logs, setLogs] = useState<string[]>(['System initialized.', 'Aura online.']);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const MODULE_VIDEOS: Record<string, string> = {
    quantum: 'https://assets.mixkit.co/videos/preview/mixkit-connection-of-a-technological-network-in-space-4417-large.mp4',
    neuro: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-human-brain-32616-large.mp4',
    ethics: 'https://assets.mixkit.co/videos/preview/mixkit-shield-icon-on-a-digital-background-4317-large.mp4',
    robotics: 'https://assets.mixkit.co/videos/preview/mixkit-robot-hand-typing-on-a-keyboard-4316-large.mp4',
    aura_avatar: 'https://assets.mixkit.co/videos/preview/mixkit-artificial-intelligence-face-animation-4319-large.mp4',
    intro: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-circuit-board-background-4414-large.mp4'
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), msg]);
  };

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsThinking(true);
    setResponse('');
    setAudioUrl(null);
    setVideoUrl(MODULE_VIDEOS.aura_avatar); // Show Aura avatar immediately while thinking
    setCaptions('Aura is analyzing your request...');
    addLog(`Processing query: ${query.substring(0, 20)}...`);
    
    const result = await getTutorResponse(query, activeModule.title);
    setResponse(result);
    setCaptions(result.replace(/[#*`]/g, '').substring(0, 100) + '...');
    
    // Generate Voice
    addLog('Synthesizing voice...');
    const voice = await generateTutorVoice(result);
    if (voice) {
      setAudioUrl(voice);
      addLog('Voice ready.');
    }

    // Set Simulation Video (or keep Aura if no specific simulation)
    const simulationVideo = MODULE_VIDEOS[activeModule.id];
    if (simulationVideo) {
      setVideoUrl(simulationVideo);
    }
    
    setIsThinking(false);
    addLog('Response generated.');
    setQuery('');
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [audioUrl]);

  if (showEntry) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden font-sans">
        <video 
          autoPlay 
          loop 
          muted 
          className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
          src={MODULE_VIDEOS.intro}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10 text-center px-6"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <h1 className="text-8xl font-black tracking-tighter text-white mb-2 uppercase italic">
              Aura
            </h1>
            <p className="text-indigo-400 font-mono text-sm tracking-[0.5em] uppercase mb-12">
              The Agentic AI Tutor
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 1)", color: "#000" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEntry(false)}
            className="px-10 py-4 bg-transparent border border-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all backdrop-blur-sm"
          >
            Initialize System
          </motion.button>

          <div className="mt-24 flex justify-center gap-12 opacity-30">
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-[8px] uppercase tracking-widest">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BrainCircuit className="w-5 h-5" />
              <span className="text-[8px] uppercase tracking-widest">Neural</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-[8px] uppercase tracking-widest">Fast</span>
            </div>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 border-l border-t border-white/10 w-20 h-20"></div>
        <div className="absolute bottom-10 right-10 border-r border-b border-white/10 w-20 h-20"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden font-sans text-white">
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}
      {/* VR Scene: Professional AI Lab */}
      <a-scene embedded cursor="rayOrigin: mouse">
        <a-sky color="#020205"></a-sky>
        
        {/* Grid Floor */}
        <a-plane 
          rotation="-90 0 0" 
          width="100" 
          height="100" 
          color="#111" 
          material="opacity: 0.5; transparent: true; src: url(https://img.freepik.com/free-vector/abstract-digital-grid-background-with-flowing-particles_1017-23154.jpg)"
        ></a-plane>

        {/* The Character: Aura (Stylized Robot/Avatar) */}
        <a-entity position="0 0 -4">
          {/* Floating Base */}
          <a-cylinder position="0 0.1 0" radius="0.5" height="0.1" color="#4f46e5" material="emissive: #4f46e5; emissiveIntensity: 0.5"></a-cylinder>
          
          {/* Body */}
          <a-entity animation="property: position; to: 0 0.2 0; dir: alternate; dur: 2000; loop: true; easing: easeInOutSine">
            <a-box position="0 1.2 0" width="0.6" height="0.8" depth="0.4" color="#1a1a1a" material="metalness: 0.8; roughness: 0.2">
              {/* Core Light */}
              <a-sphere position="0 0 0.21" radius="0.1" color={isThinking ? "#f59e0b" : "#10b981"} material="emissive: #10b981; emissiveIntensity: 1"></a-sphere>
            </a-box>
            
            {/* Head */}
            <a-box position="0 1.9 0" width="0.4" height="0.3" depth="0.3" color="#1a1a1a">
              {/* Eyes */}
              <a-sphere position="-0.1 0 0.16" radius="0.03" color="#fff" material="emissive: #fff"></a-sphere>
              <a-sphere position="0.1 0 0.16" radius="0.03" color="#fff" material="emissive: #fff"></a-sphere>
            </a-box>

            {/* Floating Arms */}
            <a-box position="-0.5 1.2 0" width="0.1" height="0.4" depth="0.1" color="#4f46e5"></a-box>
            <a-box position="0.5 1.2 0" width="0.1" height="0.4" depth="0.1" color="#4f46e5"></a-box>

            {/* Thinking Ring */}
            {isThinking && (
              <a-torus-knot 
                position="0 2.4 0" 
                radius="0.2" 
                radius-tubular="0.02" 
                color="#f59e0b" 
                animation="property: rotation; to: 0 360 0; loop: true; dur: 1000; easing: linear"
              ></a-torus-knot>
            )}
          </a-entity>
        </a-entity>

        {/* Environment Lights */}
        <a-light type="ambient" color="#333"></a-light>
        <a-light type="point" position="2 4 -2" intensity="1" color="#4f46e5"></a-light>
        <a-light type="point" position="-2 4 -2" intensity="1" color="#10b981"></a-light>

        <a-camera position="0 1.6 0">
          <a-cursor color="#4f46e5"></a-cursor>
        </a-camera>
      </a-scene>

      {/* UI Overlay: Professional Dashboard */}
      <div className="vr-overlay">
        {/* Top Bar: System Status */}
        <div className="w-full flex justify-between items-center mb-6 pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tighter uppercase">Aura Interface</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Neural Link Active</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {LEARNING_MODULES.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveModule(m)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  activeModule.id === m.id 
                    ? 'bg-white text-black border-white' 
                    : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                }`}
              >
                {m.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Interaction Panel */}
        <div className={`tutor-panel transition-all duration-700 ${response ? 'w-[900px]' : 'w-[450px]'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Session Terminal</span>
            </div>
            <div className={`status-tag ${isThinking ? 'border-amber-500 text-amber-500' : 'border-emerald-500 text-emerald-500'}`}>
              {isThinking ? 'Reasoning' : 'Idle'}
            </div>
          </div>

          <div className="flex gap-8">
            {/* Left: Explanation */}
            <div className="flex-1 space-y-6">
              <div className="markdown-body max-h-[400px] overflow-y-auto pr-4 custom-scrollbar min-h-[100px]">
                {response ? (
                  <ReactMarkdown>{response}</ReactMarkdown>
                ) : (
                  <div className="text-gray-500 italic text-sm">
                    Waiting for input... Aura is ready to assist with your {activeModule.title} studies.
                  </div>
                )}
              </div>

              {/* Input Area */}
              <form onSubmit={handleAsk} className="relative mt-4">
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Inquire about the current module..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors pr-12"
                  disabled={isThinking}
                />
                <button 
                  type="submit"
                  disabled={isThinking}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Right: Simulation Video & Captions */}
            <AnimatePresence>
              {videoUrl && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-[350px] flex flex-col gap-4"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black shadow-2xl">
                    {/* Main Simulation Video */}
                    <video 
                      key={videoUrl}
                      src={videoUrl} 
                      autoPlay 
                      loop 
                      muted 
                      className="w-full h-full object-cover opacity-80"
                    />
                    
                    {/* Picture-in-Picture: AI Character Avatar */}
                    <div className="absolute bottom-2 right-2 w-24 h-24 rounded-lg overflow-hidden border border-indigo-500/50 shadow-lg z-20 bg-black">
                      <video 
                        src={MODULE_VIDEOS.aura_avatar}
                        autoPlay
                        loop
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 flex gap-0.5">
                        <div className={`w-1 h-3 bg-indigo-500 rounded-full ${audioUrl ? 'animate-bounce' : ''}`}></div>
                        <div className={`w-1 h-4 bg-indigo-500 rounded-full ${audioUrl ? 'animate-bounce' : ''}`} style={{ animationDelay: '0.1s' }}></div>
                        <div className={`w-1 h-2 bg-indigo-500 rounded-full ${audioUrl ? 'animate-bounce' : ''}`} style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>

                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] uppercase tracking-widest border border-white/10 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                      Live Simulation
                    </div>
                  </div>
                  
                  {/* Captions */}
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 min-h-[60px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-3 h-3 text-indigo-400" />
                      <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-400">Aura Transcription</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-indigo-100/80 italic">
                      {captions}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* System Logs */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">System Logs</span>
            </div>
            <div className="font-mono text-[10px] text-gray-600 space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile Mini */}
        <div className="mt-auto w-full flex justify-end pointer-events-auto">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-bold uppercase tracking-wider">Student 01</p>
              <p className="text-[9px] text-gray-500 uppercase">Level 4 Researcher</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#4f46e5_0%,transparent_70%)]"></div>
      </div>
    </div>
  );
}
