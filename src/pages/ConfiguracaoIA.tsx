import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const STORAGE_KEY = 'zobot_conversation';

export default function ConfiguracaoIA() {
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
      console.log('Response data:', data);
      
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
      console.error('Error in handleSubmit:', error);
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
    <div className="max-w-4xl mx-auto h-full flex flex-col p-4">
      <div className="bg-white rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden">
        <div className="p-4 bg-blue-600 text-white flex items-center">
          <Bot className="h-6 w-6 mr-3" />
          <h1 className="text-xl font-semibold">Configuração Assistida por IA</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700">
              Aqui você conta com uma ajuda para definir as instruções gerais do seu Zobot.
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-600">
              <li>Explique como você quer que ele se comporte.</li>
              <li>Copie as instruções e cole no campo <i>Instruções Gerais</i> do <Link to="/configurar-agente" className="text-blue-600 hover:text-blue-800"><i>Passo 2: Configurar Agente IA</i></Link>.</li>
              <li>Fique a vontade para fazer os ajustes que achar necessário.</li>
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {!message.isUser && (
                    <button
                      onClick={() => handleCopy(message.text, message.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Copiar mensagem"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
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
}