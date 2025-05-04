import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlus, Mail, CheckCircle } from 'lucide-react';

export default function Registro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signUp(email, password, nome, telefone);
      setIsSuccess(true);
    } catch (error) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#131825] rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-8">
          <img src="/images/logo_conecta_botvance.png" alt="Logo Conecta Botvance" className="h-12" />
        </div>
        
        {isSuccess ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Registro Concluído!</h2>
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-6 rounded mb-6">
              <div className="flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 mr-2" />
                <span className="font-semibold">Verifique seu email</span>
              </div>
              <p className="mb-2">
                Enviamos um link de confirmação para <span className="font-semibold">{email}</span>
              </p>
              <p>Clique no link enviado para ativar sua conta e fazer login.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#3b82f6] text-white py-2 px-4 rounded-md hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Ir para Login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-white mb-8">Registro</h2>
            
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 bg-[#232b3d] border border-[#374151] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#232b3d] border border-[#374151] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#232b3d] border border-[#374151] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#232b3d] border border-[#374151] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#3b82f6] text-white py-2 px-4 rounded-md hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processando...' : 'Criar Conta'}
              </button>
            </form>

            <p className="mt-4 text-center text-gray-400">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                Faça login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
