import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Trash2, Flame, ShieldAlert, Sparkles } from "lucide-react";
import { ChatMessage } from "../types";

interface AICompanionChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  isLoading: boolean;
}

export default function AICompanionChat({
  messages,
  onSendMessage,
  onClearHistory,
  isLoading,
}: AICompanionChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  const handleQuickNudge = (nudgeText: string) => {
    onSendMessage(nudgeText);
  };

  return (
    <div id="ai-companion-chat" className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col h-[520px] relative overflow-hidden">
      {/* Background geometric alignment / circle accent */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="h-[400px] w-[400px] border-[40px] border-indigo-500 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-indigo-500/10 text-indigo-400 relative">
            <MessageSquare className="w-5 h-5 animate-[pulse_3s_infinite]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white">Chronos AI Companion Chat</h2>
            <p className="text-xs text-slate-400">Get instant motivation and tactical guides to break inertia.</p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            id="btn-clear-chat-history"
            onClick={onClearHistory}
            className="p-1.5 hover:bg-slate-800 border border-transparent hover:border-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mb-4 font-sans text-sm">
        {messages.map((msg) => {
          const isAI = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isAI ? "self-start" : "self-end flex-row-reverse"}`}
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                isAI ? "bg-indigo-950 border-indigo-800 text-indigo-300" : "bg-slate-850 border-slate-700 text-slate-300"
              }`}>
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                isAI 
                  ? "bg-slate-950/80 border-slate-850 text-slate-200 shadow-sm" 
                  : "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-950/20"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className="text-[9px] font-mono opacity-50 block mt-1.5 text-right">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Awaiting Directives</span>
              <span className="text-[10px] text-slate-400 font-sans max-w-[200px]">Your AI Companion is standing by to assist with planning and execution.</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] self-start ai-processing">
            <div className="w-8 h-8 rounded-full border bg-indigo-950 border-indigo-800 text-indigo-300 flex items-center justify-center shrink-0 relative overflow-hidden">
               <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse-slow" />
               <Bot className="w-4 h-4 relative z-10 motion-safe:animate-bounce" />
            </div>
            <div className="p-3.5 rounded-2xl border bg-slate-950 border-slate-850 shadow-sm flex items-center gap-3">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 animate-ping" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 animate-ping" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 animate-ping" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Formulating...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Quick-Prompt Badges */}
      <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto pb-3 -mx-1 mask-linear-right relative z-10">
        <button
          id="btn-quick-truth"
          type="button"
          onClick={() => handleQuickNudge("Give me a harsh reality check to make me code right now.")}
          className="min-h-[32px] text-[10px] font-semibold bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 flex items-center gap-1 shrink-0 btn-premium btn-premium-hover"
        >
          <Flame className="w-3 h-3 text-amber-500" />
          Harsh Truth
        </button>
        <button
          id="btn-quick-start"
          type="button"
          onClick={() => handleQuickNudge("I am completely stuck and cannot start my tasks. Guide me.")}
          className="min-h-[32px] text-[10px] font-semibold bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 flex items-center gap-1 shrink-0 btn-premium btn-premium-hover"
        >
          <ShieldAlert className="w-3 h-3 text-indigo-400" />
          Help Me Start
        </button>
        <button
          id="btn-quick-brief"
          type="button"
          onClick={() => handleQuickNudge("Can you evaluate my current backlog and outline a buffer zone plan?")}
          className="min-h-[32px] text-[10px] font-semibold bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 flex items-center gap-1 shrink-0 btn-premium btn-premium-hover"
        >
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Assess Backlog
        </button>
      </div>

      {/* Input box Form */}
      <form onSubmit={handleSubmit} className="shrink-0 flex gap-2 pt-2 border-t border-slate-800 relative z-10">
        <input
          id="input-chat-message"
          type="text"
          placeholder="Ask anything, e.g., 'Draft slide speaker notes for slide 1'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition leading-normal font-mono"
        />
        <button
          id="btn-send-chat"
          type="submit"
          disabled={!input.trim() || isLoading}
          className="min-h-[44px] px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-950 btn-premium btn-premium-hover flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
