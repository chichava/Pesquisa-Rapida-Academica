
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

interface Props {
  contextTopic: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveAssistant: React.FC<Props> = ({ contextTopic, isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    
    audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
    audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setIsActive(true);
          // Stream from mic
          const source = audioContextInRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            
            const pcmBlob = {
              data: (window as any).audioUtils.encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextInRef.current!.destination);
        },
        onmessage: async (message: any) => {
          // Handle audio output
          const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            setIsModelSpeaking(true);
            const ctx = audioContextOutRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const audioBuffer = await (window as any).audioUtils.decodeAudioData(
              (window as any).audioUtils.decode(audioBase64),
              ctx, 24000, 1
            );
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.addEventListener('ended', () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
            });
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }

          // Handle transcription
          if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
            setTranscript(prev => [...prev.slice(-10), {role: 'user', text}]);
          }
          if (message.serverContent?.outputTranscription) {
            const text = message.serverContent.outputTranscription.text;
            setTranscript(prev => [...prev.slice(-10), {role: 'model', text}]);
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsModelSpeaking(false);
          }
        },
        onclose: () => stopSession(),
        onerror: (e) => console.error("Live Error:", e),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        systemInstruction: `Você é um assistente acadêmico sênior para o estudante. O tema atual do trabalho é "${contextTopic}". Seja encorajador, responda em Português Padrão e ajude o estudante com dúvidas teóricas ou sugestões de estrutura. Mantenha as respostas concisas e faladas de forma natural.`
      }
    });

    sessionRef.current = await sessionPromise;
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    setIsActive(false);
    setIsModelSpeaking(false);
    setTranscript([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[60] border-l flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Assistente de Voz
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-indigo-500 rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">
        {transcript.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <p className="text-sm">Clique em iniciar para conversar sobre o seu trabalho de pesquisa.</p>
          </div>
        )}
        {transcript.map((t, i) => (
          <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium shadow-sm ${
              t.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border'
            }`}>
              {t.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t bg-white space-y-4">
        <div className="flex justify-center">
          <button
            onClick={isActive ? stopSession : startSession}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isActive ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white voice-pulse'
            }`}
          >
            {isActive ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {isActive ? (isModelSpeaking ? "A IA está a falar..." : "A ouvir...") : "Iniciar conversa"}
        </p>
      </div>
    </div>
  );
};
