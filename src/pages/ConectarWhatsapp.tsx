import React, { useState, useEffect } from 'react';
import { QrCode } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface WhatsAppResponse {
  base64: string;
  pairingCode: string;
}

export default function ConectarWhatsapp() {
  const { user } = useAuth();
  const [countryCode, setCountryCode] = useState('+55');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qrCodeData, setQrCodeData] = useState<WhatsAppResponse | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ text: string; color: string }>({
    text: 'Status Conexão',
    color: 'text-gray-600'
  });
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check connection state with webhook
  const checkConnectionState = async () => {
    if (!user?.email) {
      return;
    }
    
    setIsCheckingConnection(true);
    setConnectionStatus({ text: 'Verificando...', color: 'text-yellow-600' });

    try {
      // Send webhook to check connection
      const response = await fetch('https://webhooks.botvance.com.br/webhook/bbbb1235-0cad-482d-ae30-b49ba0122aad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          action: 'check_connection'
        }),
      });

      if (!response.ok) {
        setConnectionStatus({ text: 'Desconectado', color: 'text-red-600' });
        return;
      }

      const data = await response.json();
      console.log('API response:', data);
      
      // Handle array response format
      const instanceData = Array.isArray(data) ? data[0] : data;
      
      if (instanceData.erro) {
        console.log('API returned error, setting state to disconnected');
        setConnectionStatus({ text: 'Desconectado', color: 'text-red-600' });
      } else if (instanceData.instance?.state === 'connecting') {
        console.log('API state is connecting');
        setConnectionStatus({ text: 'Conectando', color: 'text-orange-600' });
      } else if (instanceData.instance?.state === 'open') {
        console.log('API state is open');
        setConnectionStatus({ text: 'Conectado', color: 'text-green-600' });
      } else {
        console.log('API returned unknown state, setting to disconnected');
        setConnectionStatus({ text: 'Desconectado', color: 'text-red-600' });
      }
    } catch (error) {
      console.error('Error in checkConnectionState:', error);
      setConnectionStatus({ text: 'Desconectado', color: 'text-red-600' });
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user?.email) {
      setError('Usuário não está autenticado');
      return;
    }
    
    setIsDisconnecting(true);
    setError(''); // Clear any previous errors
    try {
      console.log('Iniciando desconexão para:', user.email);
      const response = await fetch('https://webhooks.botvance.com.br/webhook/742674d8-4fb7-4be6-bfe9-d5d5ba2ed2f7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          action: 'disconnect' // Adding action parameter
        }),
      });

      const responseText = await response.text();
      console.log('Resposta do servidor:', responseText);

      if (!response.ok) {
        throw new Error(`Falha ao desconectar WhatsApp: ${responseText}`);
      }

      setConnectionStatus({ text: 'Desconectado', color: 'text-red-600' });
      setQrCodeData(null);
    } catch (err) {
      console.error('Erro na desconexão:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desconectar WhatsApp';
      setError(errorMessage);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!user?.email) {
        throw new Error('Usuário não está autenticado');
      }

      const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
      
      // Send webhook to connect WhatsApp
      const response = await fetch('https://webhooks.botvance.com.br/webhook/8ce3cd0c-fb7b-4727-9782-92bfe292f3c9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          telefone: fullPhoneNumber
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao conectar WhatsApp: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data?.base64) {
        throw new Error('QR Code inválido recebido do servidor');
      }
      
      setQrCodeData(data);
      setConnectionStatus({ text: 'Conectando', color: 'text-orange-600' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar WhatsApp';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-8">
          <QrCode className="h-12 w-12 text-blue-600" />
          <h1 className="ml-4 text-3xl font-bold text-gray-900">
            Conectar WhatsApp
          </h1>
        </div>

        {/* Status Indicator */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus.text === 'Conectado' ? 'bg-green-500' :
              connectionStatus.text === 'Conectando' ? 'bg-orange-500' :
              connectionStatus.text === 'Verificando...' ? 'bg-yellow-500' :
              connectionStatus.text === 'Desconectado' ? 'bg-red-500' : 'bg-gray-400'
            }`} />
            <span className={`font-medium ${connectionStatus.color}`}>
              {connectionStatus.text}
            </span>
          </div>
          <button
            onClick={checkConnectionState}
            disabled={isCheckingConnection}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isCheckingConnection ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Verificar
          </button>
          {connectionStatus.text === 'Conectado' && (
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                isDisconnecting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Desconectar
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!qrCodeData ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Número do WhatsApp
              </label>
              <div className="flex">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="+55">+55</option>
                </select>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="DDD + Número"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Conectando...' : 'Conectar WhatsApp'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Escaneie o QR Code</h2>
            <div className="mb-4">
              {qrCodeData.base64 ? (
                <img
                  src={qrCodeData.base64}
                  alt="QR Code WhatsApp"
                  className="mx-auto"
                />
              ) : (
                <p className="text-red-600">QR Code não disponível</p>
              )}
            </div>
            {qrCodeData.pairingCode && (
              <p className="text-gray-600 mb-4">
                Código de pareamento: <span className="font-mono font-bold">{qrCodeData.pairingCode}</span>
              </p>
            )}
            <button
              onClick={() => setQrCodeData(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Remove the webhook URL section */}
      </div>
    </div>
  );
}
