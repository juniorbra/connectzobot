import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MinhaContaPanel from '../components/MinhaContaPanel';

interface Agent {
  id: string;
  name: string;
  description: string;
  active: boolean;
  type: string;
  user_id: string;
}

const PainelControle: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'agents' | 'account'>('agents');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchAgents();
  }, [user, navigate]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      if (data) {
        setAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = () => {
    navigate('/configurar-agente/new');
  };

  const handleConfigureAgent = (id: string) => {
    navigate(`/configurar-agente/${id}`);
  };

  const handleDeleteAgent = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agente?')) {
      try {
        const { error } = await supabase
          .from('agents')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Refresh the agents list
        fetchAgents();
      } catch (error) {
        console.error('Error deleting agent:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white">
      {/* Header */}
      <header className="bg-[#131825] p-4 flex justify-between items-center border-b border-[#2a3042]">
        <div className="flex items-center">
          <div className="bg-[#3b82f6] p-2 rounded mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Painel de Controle</h1>
        </div>
        <div className="flex items-center">
          <button 
            className="flex items-center bg-[#2a3042] hover:bg-[#374151] rounded-full px-4 py-2 mr-2"
            onClick={async () => {
              if (window.confirm('Deseja realmente sair?')) {
                // Desativa temporariamente o redirecionamento automático
                localStorage.setItem('manual_redirect', 'true');
                await signOut();
                navigate('/login');
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span>Sair</span>
          </button>
          <button
            onClick={() => setActiveView('account')}
            className={`flex items-center ${activeView === 'account' ? 'bg-[#3b82f6]' : 'bg-[#2a3042] hover:bg-[#374151]'} rounded-full p-2 mr-2`}
            title="Minha Conta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <div className="flex items-center bg-[#2a3042] rounded-full px-4 py-2">
            <img src="https://flagcdn.com/br.svg" alt="Bandeira do Brasil" className="h-5 w-5 mr-2" />
            <span>Português</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex mb-8 border-b border-[#2a3042]">
          <button
            onClick={() => setActiveView('agents')}
            className={`px-6 py-3 font-medium ${
              activeView === 'agents' 
                ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Agentes IA
          </button>
          <button
            onClick={() => setActiveView('account')}
            className={`px-6 py-3 font-medium ${
              activeView === 'account' 
                ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Minha Conta
          </button>
        </div>

        {activeView === 'agents' ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Agentes IA</h2>
              <button 
                onClick={handleCreateAgent}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-full flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar Novo Agente
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-[#131825] rounded-lg">
                    <p className="text-gray-400">Nenhum agente encontrado. Crie seu primeiro agente!</p>
                  </div>
                ) : (
                  agents.map((agent) => (
                    <div key={agent.id} className="bg-[#131825] rounded-lg p-6 flex flex-col">
                      <div className="flex items-start mb-4">
                        <div className="bg-[#3b82f6] p-3 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold">{agent.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${agent.active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                              {agent.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-gray-400 mt-1">{agent.description}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2 mb-6">
                        <span className="bg-[#3b82f6] text-xs px-3 py-1 rounded-full">{agent.type}</span>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-[#2a3042] flex justify-between">
                        <button 
                          onClick={() => handleConfigureAgent(agent.id)}
                          className="flex items-center text-gray-300 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Configurar
                        </button>
                        <button 
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="flex items-center text-red-400 hover:text-red-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <MinhaContaPanel />
        )}
      </main>
    </div>
  );
};

export default PainelControle;
