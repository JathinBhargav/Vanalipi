import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Volume2,
  Sparkles,
  Bot,
  Brain,
  Zap,
  MessageCircle,
  RotateCcw,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { COMPANIONS } from '../data/constants';
import { CompanionId, ChatMessage, VoiceName } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activePageText?: string;
  activeStoryTitle?: string;
  selectedVoice: VoiceName;
  onPlayTTS: (text: string, voice?: VoiceName) => Promise<void>;
  isTTSPlaying: boolean;
}

export const CompanionChatDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  activePageText,
  activeStoryTitle,
  selectedVoice,
  onPlayTTS,
  isTTSPlaying,
}) => {
  const [selectedCompanionId, setSelectedCompanionId] = useState<CompanionId>('barnaby');
  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskComplexity, setTaskComplexity] = useState<'complex' | 'general' | 'fast'>('complex');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: "Hoo-hoo! Greetings, young adventurer! I am Barnaby the Owl. I'm here to explore this magical story with you. Ask me anything about words you see, what the characters feel, or what might happen next!",
      timestamp: Date.now(),
      companionId: 'barnaby',
      modelUsed: 'gemini-3.1-pro-preview',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCompanion = COMPANIONS.find((c) => c.id === selectedCompanionId) || COMPANIONS[0];

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // When switching companion, update task complexity default
  const handleSelectCompanion = (id: CompanionId) => {
    setSelectedCompanionId(id);
    if (id === 'barnaby') setTaskComplexity('complex');
    else if (id === 'pip') setTaskComplexity('general');
    else if (id === 'dash') setTaskComplexity('fast');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSubmitting) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage('');
    setIsSubmitting(true);

    try {
      // Build conversation payload for Gemini server endpoint
      const storyContext = `Active Story: "${activeStoryTitle || 'Vanalipi'}"\nCurrent Page Content:\n"${activePageText || ''}"`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role === 'model' ? 'model' : 'user',
            content: m.text,
          })),
          companionId: selectedCompanionId,
          taskComplexity,
          currentStoryContext: storyContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || "That's a wonderful thought! Let's read more together!",
        timestamp: Date.now(),
        companionId: selectedCompanionId,
        modelUsed: data.modelUsed || activeCompanion.recommendedModel,
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: "Hoo! My magic spectacles got a bit foggy! Let's try asking that again in a moment.",
        timestamp: Date.now(),
        companionId: selectedCompanionId,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpeakMessage = async (msg: ChatMessage) => {
    if (speakingMessageId === msg.id && isTTSPlaying) {
      setSpeakingMessageId(null);
      return;
    }
    setSpeakingMessageId(msg.id);
    try {
      await onPlayTTS(msg.text, selectedVoice);
    } finally {
      setSpeakingMessageId(null);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Hello there! I'm ${activeCompanion.name}. What questions do you have about page stories, fun words, or magical characters?`,
        timestamp: Date.now(),
        companionId: selectedCompanionId,
        modelUsed: activeCompanion.recommendedModel,
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      id="companion-chat-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
    >
      <div
        id="companion-chat-panel"
        className="w-full max-w-md h-full bg-amber-50/95 border-l-2 border-amber-300 shadow-2xl flex flex-col overflow-hidden text-slate-800"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-amber-200/90 bg-amber-100/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label="avatar">
              {activeCompanion.avatarIcon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-amber-950 font-heading text-lg leading-tight">
                  {activeCompanion.name}
                </h3>
              </div>
              <p className="text-xs text-amber-800 font-medium">{activeCompanion.roleTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="reset-chat-btn"
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-2 text-slate-500 hover:text-amber-800 hover:bg-amber-200/60 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              id="close-chat-btn"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-amber-800 hover:bg-amber-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Companion Selector Tabs */}
        <div className="px-3 py-2 bg-amber-200/50 border-b border-amber-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {COMPANIONS.map((companion) => {
            const isSelected = selectedCompanionId === companion.id;
            return (
              <button
                key={companion.id}
                id={`companion-tab-${companion.id}`}
                onClick={() => handleSelectCompanion(companion.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-white/80 text-amber-950 hover:bg-white border border-amber-300/60'
                }`}
              >
                <span>{companion.avatarIcon}</span>
                <span>{companion.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Role & Model Info Banner */}
        <div className="px-4 py-2 bg-white/60 border-b border-amber-200/60 text-xs flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-1.5">
            {selectedCompanionId === 'barnaby' && <Brain className="w-3.5 h-3.5 text-purple-600" />}
            {selectedCompanionId === 'pip' && <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
            {selectedCompanionId === 'dash' && <Zap className="w-3.5 h-3.5 text-emerald-600" />}
            <span className="font-semibold text-slate-700">{activeCompanion.modelTaskTag}:</span>
            <span className="font-mono text-[11px] text-slate-500">{activeCompanion.recommendedModel}</span>
          </div>

          {/* Quick task complexity switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTaskComplexity('complex')}
              title="Complex Reasoning (Gemini 3.1 Pro)"
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                taskComplexity === 'complex' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Pro
            </button>
            <button
              onClick={() => setTaskComplexity('general')}
              title="General Tasks (Gemini 3.5 Flash)"
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                taskComplexity === 'general' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Flash
            </button>
            <button
              onClick={() => setTaskComplexity('fast')}
              title="Fast Tasks (Gemini 3.1 Flash Lite)"
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                taskComplexity === 'fast' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Lite
            </button>
          </div>
        </div>

        {/* Scrollable Chat Thread */}
        <div
          id="chat-messages-thread"
          className="flex-1 p-4 overflow-y-auto space-y-4 text-sm"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-base shrink-0 shadow-xs border border-amber-300">
                    {activeCompanion.avatarIcon}
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 shadow-xs ${
                    isUser
                      ? 'bg-amber-600 text-white rounded-tr-none'
                      : 'bg-white border border-amber-200/90 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-[10px] text-slate-400">
                        {msg.modelUsed || activeCompanion.recommendedModel}
                      </span>
                      <button
                        id={`speak-msg-${msg.id}`}
                        onClick={() => handleSpeakMessage(msg)}
                        disabled={isTTSPlaying && speakingMessageId === msg.id}
                        className="flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        {speakingMessageId === msg.id && isTTSPlaying ? 'Playing...' : 'Read Aloud'}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {isSubmitting && (
            <div className="flex gap-2.5 items-center text-slate-500 text-xs italic">
              <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-base shrink-0 animate-pulse">
                {activeCompanion.avatarIcon}
              </div>
              <div className="bg-white border border-amber-200 rounded-2xl p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>{activeCompanion.name} is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts tailored to active story */}
        <div className="px-4 py-2 bg-amber-100/40 border-t border-amber-200/60">
          <div className="text-[11px] font-bold text-amber-900/80 mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-amber-600" />
            Quick questions for {activeCompanion.name.split(' ')[0]}:
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {activeCompanion.sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isSubmitting}
                className="text-xs bg-white/90 hover:bg-white text-slate-700 border border-amber-200 rounded-full px-3 py-1 whitespace-nowrap shadow-2xs hover:border-amber-400 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Message Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-amber-200 bg-white flex items-center gap-2"
        >
          <input
            id="chat-user-input"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask ${activeCompanion.name.split(' ')[0]} anything...`}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-full border border-amber-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-amber-50/40 placeholder:text-slate-400"
          />
          <button
            id="send-chat-msg-btn"
            type="submit"
            disabled={isSubmitting || !inputMessage.trim()}
            className="w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
