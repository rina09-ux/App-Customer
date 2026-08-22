import React, { useState } from 'react';
import { X, Sparkles, Send, Bot } from 'lucide-react';
import { getCoreApiUrl } from '../lib/coreApi';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Core Workspace Assistant terhubung ke data workspace NusaSec-Core. Tanya tentang paket, billing, subscription, risk, atau remediation.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputMessage.trim();
    if (!query || isTyping) return;

    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`${getCoreApiUrl()}/api/v1/customer/assistant/query`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.detail || 'Core assistant tidak tersedia.');
      setMessages((prev) => [...prev, { role: 'assistant', text: String(body.answer || 'Tidak ada jawaban dari Core.') }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: error instanceof Error ? error.message : 'Core assistant tidak tersedia.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ds-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="ds-dialog rounded-2xl max-w-lg w-full h-[520px] flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-[var(--ds-border)] flex items-center justify-between bg-[var(--ds-surface-alt)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl ds-ai flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold ds-title text-sm flex items-center gap-2">
                Workspace Assistant
                <span className="ds-ai ds-badge">Core-backed</span>
              </h3>
              <p className="text-[11px] ds-muted">Informasi berasal dari workspace Anda di NusaSec-Core</p>
            </div>
          </div>
          <button onClick={onClose} className="ds-secondary !min-h-0 !w-8 !px-0 rounded-lg border-0 bg-transparent" aria-label="Tutup Assistant">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs sm:text-sm bg-[var(--ds-bg)]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg ds-ai flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[82%] p-3 rounded-2xl ${msg.role === 'user' ? 'ds-primary rounded-br-xs' : 'ds-surface rounded-bl-xs shadow-2xs'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2.5 items-center text-xs ds-muted">
              <div className="w-7 h-7 rounded-lg ds-ai flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="ds-surface p-2.5 rounded-xl flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[var(--ds-text-muted)] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[var(--ds-text-muted)] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-[var(--ds-text-muted)] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-[var(--ds-border)] flex gap-2 overflow-x-auto text-[11px] bg-[var(--ds-surface)]">
          <button type="button" onClick={() => setInputMessage('Berapa harga paket saya?')} className="ds-secondary !min-h-0 !px-2.5 !py-1 rounded-lg whitespace-nowrap text-[11px]">Harga paket</button>
          <button type="button" onClick={() => setInputMessage('Bagaimana status billing saya?')} className="ds-secondary !min-h-0 !px-2.5 !py-1 rounded-lg whitespace-nowrap text-[11px]">Status billing</button>
          <button type="button" onClick={() => setInputMessage('Berapa risk yang masih terbuka?')} className="ds-secondary !min-h-0 !px-2.5 !py-1 rounded-lg whitespace-nowrap text-[11px]">Open risk</button>
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-[var(--ds-border)] bg-[var(--ds-surface)] flex items-center gap-2">
          <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Tanyakan tentang workspace..." className="ds-control flex-1 !min-h-10 !px-3 !py-2 text-xs sm:text-sm" />
          <button type="submit" disabled={isTyping} className="ds-primary !min-h-10 !w-10 !px-0 rounded-xl disabled:opacity-50" aria-label="Kirim pertanyaan">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
