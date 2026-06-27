import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, Play, Music } from "lucide-react";
import { fetchAI } from "../utils/aiClient";

interface VoiceAssistantProps {
  onActionExtracted: (action: { type: string; title: string; time?: string }) => void;
}

// Ensure SpeechRecognition is defined
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceAssistant({ onActionExtracted }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptInput, setTranscriptInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [readAloudEnabled, setReadAloudEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscriptInput(transcript);
        handleProcessVoice(transcript);
      };
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);
      
      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const presets = [
    { label: "🎙️ 'I'm feeling overwhelmed with work'", value: "I'm feeling overwhelmed with work and I have three slide presentations due tomorrow at noon." },
    { label: "🎙️ 'Schedule CS homework slot'", value: "Schedule a Computer Science deep study focus slot for tomorrow at 9 AM." },
    { label: "🎙️ 'Track habit: drink water'", value: "Log water intake habit streak today." }
  ];

  const handleProcessVoice = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setAiResponse("");

    try {
      const data = await fetchAI("/api/voice-process", { transcript: text });
      
      setAiResponse(data.response);
      setIsProcessing(false);

      // Speak aloud if enabled
      if (readAloudEnabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      }

      // Execute extracted actions in parent
      if (data.extractedActions && data.extractedActions.length > 0) {
        data.extractedActions.forEach((action: any) => {
          onActionExtracted(action);
        });
      }
    } catch (err) {
      console.warn("Voice processing offline fallback triggered:", err);
      const lowercaseText = text.toLowerCase();
      let replyText = "Understood. Local voice intelligence has processed your request.";
      let offlineActions = [];

      if (lowercaseText.includes("schedule") || lowercaseText.includes("session") || lowercaseText.includes("slot")) {
        replyText = "Got it. I've created a study focus slot in your offline planner for tomorrow morning.";
        offlineActions.push({
          type: "schedule",
          title: "Study Slot (Calibrated Offline)",
          time: "Tomorrow at 9:00 AM"
        });
      } else if (lowercaseText.includes("thesis") || lowercaseText.includes("procrastinating") || lowercaseText.includes("motivation")) {
        replyText = "Your focus genome shows high baseline velocity. We've initiated the 25-minute Pomodoro Lockdown sequence locally to bypass delays.";
        offlineActions.push({
          type: "habit",
          title: "Pomodoro Focus Sprint",
          time: "Immediate"
        });
      } else {
        replyText = `Created a task: "${text}" and scheduled a defensive focus shield for you.`;
        offlineActions.push({
          type: "task",
          title: text,
          time: "Today"
        });
      }

      setAiResponse(replyText);
      setIsProcessing(false);

      if (readAloudEnabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(replyText);
        window.speechSynthesis.speak(utterance);
      }

      if (offlineActions.length > 0) {
        offlineActions.forEach((action) => {
          onActionExtracted(action);
        });
      }
    }
  };

  const toggleRecording = () => {
    if (!speechSupported) return;
    
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setTranscriptInput("");
      setAiResponse("");
      recognitionRef.current?.start();
    }
  };

  return (
    <div id="voice-assistant" className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
      {/* Background geometric alignment / circle accent */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="h-[400px] w-[400px] border-[40px] border-indigo-500 rounded-full"></div>
      </div>

      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-5 relative z-10">
        <span className="p-2 rounded bg-indigo-500/10 text-indigo-400">
          <Mic className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-white">Voice Companion Nudge</h2>
          <p className="text-xs text-slate-400">Speak or select a preset to dictating goals and schedule tasks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Animated Microphone Visualizer Panel */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/60 border border-slate-800 rounded-xl h-[240px] relative">
          
          <button
            id="btn-toggle-mic"
            onClick={toggleRecording}
            disabled={!speechSupported}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg outline-none focus:ring-4 focus:ring-violet-500 ${
              !speechSupported 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : isRecording
                  ? "bg-rose-600 text-white ring-8 ring-rose-950/60 motion-safe:animate-pulse"
                  : "bg-violet-600 hover:bg-violet-500 text-white ring-4 ring-violet-950/40 hover:scale-105 active:scale-95"
            }`}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Core CSS waveform visual */}
          <div className="flex items-center gap-1.5 mt-6 h-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
              const baseHeight = isRecording ? "h-6" : "h-1.5";
              const animName = isRecording 
                ? bar % 3 === 0 
                  ? "animate-[pulse_1s_infinite_0.1s]" 
                  : bar % 2 === 0 
                    ? "animate-[pulse_0.7s_infinite_0.3s]" 
                    : "animate-[pulse_0.5s_infinite_0.5s]"
                : "";
              return (
                <div
                  key={bar}
                  className={`w-1 bg-violet-500 rounded-full transition-all duration-300 ${baseHeight} ${animName}`}
                />
              );
            })}
          </div>

          <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-4 text-center">
            {!speechSupported 
              ? "Speech API Not Supported" 
              : isRecording 
                ? "Listening & Transcribing..." 
                : "TAP MIC TO SPEAK"}
          </span>
        </div>

        {/* Right: Presets & Transcription response */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
              Quick Spoken Commands
            </h4>
            
            <button
              id="btn-toggle-tts"
              onClick={() => setReadAloudEnabled(!readAloudEnabled)}
              className={`text-[10px] font-mono px-2 py-1 rounded border ${
                readAloudEnabled 
                  ? "bg-violet-950/40 border-violet-800 text-violet-300" 
                  : "bg-slate-950 border-slate-800 text-slate-500"
              } flex items-center gap-1.5`}
            >
              <Volume2 className="w-3 h-3" />
              {readAloudEnabled ? "Speech: ON" : "Speech: OFF"}
            </button>
          </div>

          {/* Command Presets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                id={`btn-preset-${index}`}
                onClick={() => handleProcessVoice(preset.value)}
                disabled={isProcessing || isRecording}
                className="p-2.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-violet-800/60 text-left rounded-xl text-[11px] text-slate-300 transition duration-150 font-sans line-clamp-2 leading-relaxed disabled:opacity-50"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Typing entry box as fallback */}
          <div className="flex gap-2">
            <input
              id="input-voice-text"
              type="text"
              placeholder="Or type simulated voice input here..."
              value={transcriptInput}
              onChange={(e) => setTranscriptInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition font-mono"
            />
            <button
              id="btn-submit-voice"
              onClick={() => handleProcessVoice(transcriptInput)}
              disabled={isProcessing || isRecording || !transcriptInput.trim()}
              className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition"
            >
              Send
            </button>
          </div>

          {/* AI Verbal feedback box */}
          {(isProcessing || aiResponse) && (
            <div className="mt-2 p-3.5 bg-slate-950 border border-violet-950 rounded-xl relative overflow-hidden min-h-[70px] flex flex-col justify-center">
              {isProcessing ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <svg className="motion-safe:animate-pulse h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing speech transcripts...
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <span className="p-1 rounded bg-violet-500/15 text-violet-400 shrink-0 self-start mt-0.5 motion-safe:animate-bounce">
                    <Volume2 className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="text-[9px] font-mono text-violet-400 uppercase font-semibold block">Companion Output:</span>
                    <p className="text-white text-xs font-semibold leading-relaxed mt-1">"{aiResponse}"</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
