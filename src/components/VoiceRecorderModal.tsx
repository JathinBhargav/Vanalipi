import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, X, Volume2, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pageNumber: number;
  pageText: string;
  storyTitle: string;
  existingRecordingUrl?: string;
  onSaveRecording: (audioUrl: string, durationSeconds: number) => void;
  onDeleteRecording?: () => void;
}

export const VoiceRecorderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  pageNumber,
  pageText,
  storyTitle,
  existingRecordingUrl,
  onSaveRecording,
  onDeleteRecording,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(existingRecordingUrl || null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewAudioUrl(existingRecordingUrl || null);
      setIsRecording(false);
      setRecordingTime(0);
      setErrorMessage(null);
    } else {
      cleanup();
    }
  }, [isOpen, existingRecordingUrl]);

  const cleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setIsPlayingPreview(false);
  };

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone recording.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Determine supported mime type
      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', ''];
      const supportedMimeType = mimeTypes.find((mime) => !mime || MediaRecorder.isTypeSupported(mime)) || '';

      const options = supportedMimeType ? { mimeType: supportedMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setPreviewAudioUrl(base64Data);
        };
        reader.readAsDataURL(audioBlob);

        // Stop media stream tracks
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
      };

      mediaRecorder.start(250); // collect 250ms chunks
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error starting audio recording:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser to record your voice.');
      } else {
        setErrorMessage(err.message || 'Could not start recording. Please verify your microphone connection.');
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayPreview = () => {
    if (!previewAudioUrl) return;

    if (isPlayingPreview && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
      return;
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    const audio = new Audio(previewAudioUrl);
    previewAudioRef.current = audio;

    audio.onended = () => {
      setIsPlayingPreview(false);
    };

    audio.onerror = () => {
      setIsPlayingPreview(false);
    };

    audio.play().then(() => {
      setIsPlayingPreview(true);
    }).catch((err) => {
      console.warn('Playback error:', err);
      setIsPlayingPreview(false);
    });
  };

  const handleSave = () => {
    if (previewAudioUrl) {
      onSaveRecording(previewAudioUrl, recordingTime || 5);
      onClose();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-recorder-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="voice-recorder-modal-card"
        className="relative w-full max-w-xl bg-amber-50/95 border-2 border-amber-300 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-800"
      >
        <button
          id="close-voice-recorder-modal"
          onClick={() => {
            cleanup();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-amber-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-950 font-heading">
              Record Your Voice Narration
            </h2>
            <p className="text-xs sm:text-sm text-amber-800/80">
              Read Page {pageNumber} aloud so your child can listen to you anytime!
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-100 border border-red-300 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Prominent Page Text to Read */}
        <div className="mb-5 bg-white border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              📖 Script to Read (Page {pageNumber})
            </span>
            <span className="text-xs text-slate-500 italic">{storyTitle}</span>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed font-body">
            "{pageText}"
          </p>
        </div>

        {/* Recording Visualizer & Status */}
        <div className="flex flex-col items-center justify-center p-5 mb-5 bg-amber-100/50 rounded-2xl border border-amber-200">
          {isRecording ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-20 h-20 rounded-full bg-red-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                  <Mic className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-lg font-bold text-red-700">
                  {formatTime(recordingTime)}
                </span>
                <span className="text-xs font-semibold text-red-600">Recording live...</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Read clearly into your device microphone</p>
            </div>
          ) : previewAudioUrl ? (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Check className="w-5 h-5 text-emerald-600" />
                <span>Voice narration recorded!</span>
              </div>

              {/* Play preview controls */}
              <div className="flex items-center gap-3 w-full justify-center">
                <button
                  id="preview-recording-btn"
                  onClick={togglePlayPreview}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  {isPlayingPreview ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Preview</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Listen to Recording</span>
                    </>
                  )}
                </button>

                <button
                  id="rerecord-btn"
                  onClick={startRecording}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-amber-100 text-slate-700 border border-amber-300 font-bold text-xs shadow-2xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Record Again</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center">
                <Mic className="w-7 h-7" />
              </div>
              <p className="font-bold text-sm text-amber-950 font-heading">
                Ready to Record Your Voice
              </p>
              <p className="text-xs text-slate-600 max-w-xs">
                Press the red button below and read the story sentence with your best storyteller voice!
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-200/80">
          <div>
            {existingRecordingUrl && onDeleteRecording && (
              <button
                type="button"
                onClick={() => {
                  onDeleteRecording();
                  setPreviewAudioUrl(null);
                }}
                className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
              >
                Delete this recording
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                cleanup();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-amber-200/50 font-semibold text-xs sm:text-sm"
            >
              Cancel
            </button>

            {isRecording ? (
              <button
                id="stop-recording-btn"
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Recording</span>
              </button>
            ) : previewAudioUrl ? (
              <button
                id="save-recording-btn"
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Use My Recording</span>
              </button>
            ) : (
              <button
                id="start-recording-btn"
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
