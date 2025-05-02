import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Copy, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const STORAGE_KEY = 'zobot_conversation';

const PromptAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('https://webhooks.botvance.com.br/webhook/b5e61b1c-1e26-4328-b874-513038581ca0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          email: user?.email || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com o assistente');
      }

      const data = await response.json();
      let messageText = 'Desculpe, não consegui processar sua mensagem.';
      
      if (Array.isArray(data)) {
        if (data[0] && typeof data[0].output === 'string') {
          messageText = data[0].output;
        }
      } else if (data && typeof data.output === 'string') {
        messageText = data.output;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: messageText,
        isUser: false,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Desculpe, ocorreu um erro na comunicação. Tente novamente.',
        isUser: false,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-[#1e2738] rounded-lg flex flex-col overflow-hidden mb-6">
        <div className="p-4 bg-[#3b82f6] text-white flex items-center justify-between rounded-t-lg">
          <div className="flex items-center">
            <Bot className="h-6 w-6 mr-3" />
            <h2 className="text-lg font-semibold">Assistente de Prompt</h2>
          </div>
          <button
            onClick={clearMessages}
            className="px-3 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-md text-sm font-medium transition-colors"
            title="Limpar conversa"
          >
            Limpar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
          <div className="bg-[#232b3d] p-4 rounded-lg">
            <p className="text-gray-300">
              Use o assistente para criar instruções para o seu agente IA.
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-400">
              <li>Explique como você quer que o agente se comporte.</li>
              <li>Copie as instruções geradas e cole no campo <i>Prompt do Sistema</i>.</li>
              <li>Faça ajustes conforme necessário.</li>
            </ul>
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isUser
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#232b3d] text-gray-200'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {!message.isUser && (
                    <button
                      onClick={() => handleCopy(message.text, message.id)}
                      className="p-1 hover:bg-[#374151] rounded transition-colors"
                      title="Copiar mensagem"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-[#232b3d] bg-[#1e2738]">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 bg-[#232b3d] border border-[#374151] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-[#3b82f6] text-white rounded-lg flex items-center ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#2563eb]'
              }`}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-t-2 border-white rounded-full animate-spin"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptAssistant;
