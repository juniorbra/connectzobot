import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { QrCode } from 'lucide-react';
import PromptAssistant from '../components/PromptAssistant';
import ConfigurarRespostas from '../components/ConfigurarRespostas';

interface WhatsAppResponse {
  base64: string;
  pairingCode: string;
}

interface ConnectionState {
  instance?: {
    instanceName: string;
    state: string;
  };
  erro?: string;
}

// Interface para os modelos de LLM por provedor
interface LLMModels {
  [provider: string]: string[];
}

interface AgentForm {
  // Informações Básicas (Step 1)
  name: string;
  description: string;
  active: boolean;

  // Configurar IA (Step 2)
  type: string;
  model: string;
  prompt: string;

  // Conectar com WhatsApp (Step 3)
  webhook_url: string;

  // Configurar Respostas (Step 4)
  question?: string;
  response_template: string;

  // Configurações Adicionais (Step 5)
  advanced_settings: {
    temperature: number;
    max_tokens: number;
  };

  // Novos campos de configurações adicionais
  stop_bot_on_message: boolean;
  pause_window_minutes: number;
  split_long_messages: boolean;
  show_typing_indicator: boolean;
  typing_delay_per_char_ms: number;
  concat_messages: boolean;
  concat_time_seconds: number;
  context_window_size: number;
}

const ConfigurarAgente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNewAgent = id === 'new';
  
  // Definir os modelos disponíveis para cada provedor
const [availableModels, setAvailableModels] = useState<LLMModels>({
  OPENAI: [
    'gpt-4.1-mini',
    'gpt-4o-mini'
  ]
});
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  // Submenu state for IA config vs Prompt Assistant (must be at top level)
  const [iaTab, setIaTab] = useState<'config' | 'assistant'>('config');
  
const [form, setForm] = useState<AgentForm>({
  name: '',
  description: '',
  active: true,
  type: 'OPENAI',
  model: 'gpt-4.1-mini',
  prompt: '',
  webhook_url: '',
  response_template: '',
  advanced_settings: {
    temperature: 0.7,
    max_tokens: 2000
  },
  stop_bot_on_message: true,
  pause_window_minutes: 15,
  split_long_messages: true,
  show_typing_indicator: true,
  typing_delay_per_char_ms: 50,
  concat_messages: true,
  concat_time_seconds: 7,
  context_window_size: 5
});
  const [isDirty, setIsDirty] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // WhatsApp connection states
  const [countryCode, setCountryCode] = useState('+55');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [qrCodeData, setQrCodeData] = useState<WhatsAppResponse | null>(null);

  // Preencher campos do WhatsApp com dados do wa_connections ao entrar no passo 5
  useEffect(() => {
    const fetchWAConnection = async () => {
      if (currentStep === 5 && id && id !== 'new' && user?.id) {
        const { data } = await supabase
          .from('wa_connections')
          .select('instance_name, numero_wa')
          .eq('agent_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setConnectionName(data.instance_name || '');
          setPhoneNumber(data.numero_wa || '');
        }
      }
    };
    fetchWAConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, id, user?.id]);
  const [whatsappError, setWhatsappError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ text: string; color: string }>({
    text: 'Status Conexão',
    color: 'text-gray-400'
  });
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // WhatsApp connection functions
  const checkConnectionState = async () => {
    if (!user?.email) {
      return;
    }
    
    setIsCheckingConnection(true);
    setConnectionStatus({ text: 'Verificando...', color: 'text-yellow-400' });

    try {
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
        setConnectionStatus({ text: 'Desconectado', color: 'text-red-400' });
        return;
      }

      const data = await response.json();
      
      // Handle array response format
      const instanceData = Array.isArray(data) ? data[0] : data;
      
      if (instanceData.erro) {
        setConnectionStatus({ text: 'Desconectado', color: 'text-red-400' });
      } else if (instanceData.instance?.state === 'connecting') {
        setConnectionStatus({ text: 'Conectando', color: 'text-orange-400' });
      } else if (instanceData.instance?.state === 'open') {
        setConnectionStatus({ text: 'Conectado', color: 'text-green-400' });
      } else {
        setConnectionStatus({ text: 'Desconectado', color: 'text-red-400' });
      }
    } catch (error) {
      setConnectionStatus({ text: 'Desconectado', color: 'text-red-400' });
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user?.email) {
      setWhatsappError('Usuário não está autenticado');
      return;
    }
    
    setIsDisconnecting(true);
    setWhatsappError(''); // Clear any previous errors
    try {
      const response = await fetch('https://webhooks.botvance.com.br/webhook/742674d8-4fb7-4be6-bfe9-d5d5ba2ed2f7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          action: 'disconnect'
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Falha ao desconectar WhatsApp: ${responseText}`);
      }

      setConnectionStatus({ text: 'Desconectado', color: 'text-red-400' });
      setQrCodeData(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desconectar WhatsApp';
      setWhatsappError(errorMessage);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleConnectWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setWhatsappError('');

    try {
      if (!user?.email) {
        throw new Error('Usuário não está autenticado');
      }

      const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
      
      const response = await fetch('https://webhooks.botvance.com.br/webhook/8ce3cd0c-fb7b-4727-9782-92bfe292f3c9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          telefone: fullPhoneNumber,
          nome_conexao: connectionName,
          agent_id: id
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar WhatsApp';
      setWhatsappError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Só busca dados se houver id válido (edição)
    if (id && id !== 'new') {
      fetchAgentData();
    }
  }, [id, user, navigate]);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      
      // Fetch agent data
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (agentError) throw agentError;
      
      // Fetch QA pair data for this agent
      const { data: qaData, error: qaError } = await supabase
        .from('qa_pairs')
        .select('question, answer')
        .eq('agent_id', id)
        .eq('user_id', user?.id)
        .maybeSingle();
        
      if (qaError) {
        console.error('Error fetching QA pair:', qaError);
        // Continue anyway, as we have the agent data
      }
      
      if (agentData) {
        setForm({
          name: agentData.name || '',
          description: agentData.description || '',
          active: agentData.active || false,
          // Força o tipo para "OPENAI" (case-sensitive)
          type: 'OPENAI',
          // Garante que o modelo padrão seja um dos dois permitidos
          model: ['gpt-4.1-mini', 'gpt-4o-mini'].includes(agentData.model)
            ? agentData.model
            : 'gpt-4.1-mini',
          prompt: agentData.prompt || '',
          webhook_url: agentData.webhook_url || '',
          // Use QA data if available, otherwise use agent data
          question: qaData?.question || '',
          response_template: qaData?.answer || agentData.response_template || '',
          advanced_settings: agentData.advanced_settings || {
            temperature: 0.7,
            max_tokens: 2000
          },
          // Novos campos de configurações adicionais
          stop_bot_on_message: agentData.stop_bot_on_message ?? true,
          pause_window_minutes: agentData.pause_window_minutes ?? 15,
          split_long_messages: agentData.split_long_messages ?? true,
          show_typing_indicator: agentData.show_typing_indicator ?? true,
          typing_delay_per_char_ms: agentData.typing_delay_per_char_ms ?? 50,
          concat_messages: agentData.concat_messages ?? true,
          concat_time_seconds: agentData.concat_time_seconds ?? 7,
          context_window_size: agentData.context_window_size ?? 5
        });
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      setError('Não foi possível carregar os dados do agente.');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar o modelo quando o tipo de provedor mudar
  useEffect(() => {
    // Se o tipo mudar e o modelo atual não estiver disponível no novo tipo,
    // selecione o primeiro modelo disponível
    if (form.type && availableModels[form.type]) {
      if (!availableModels[form.type].includes(form.model)) {
        setForm(prev => ({
          ...prev,
          model: availableModels[form.type][0]
        }));
      }
    }
  }, [form.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: checked
    }));
    setIsDirty(true);
  };

  const handleAdvancedSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      advanced_settings: {
        ...prev.advanced_settings,
        [name]: name === 'temperature' ? parseFloat(value) : parseInt(value)
      }
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    
    if (!form.name.trim()) {
      setError('O nome do agente é obrigatório.');
      setCurrentStep(1); // Voltar para o primeiro passo se o nome estiver vazio
      return;
    }

    try {
      setSaving(true);

      // Se for novo agente, insere e redireciona para edição com o novo id
      if (isNewAgent) {
        // Insert the agent first
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .insert([
            {
              name: form.name,
              description: form.description,
              active: form.active,
              type: form.type,
              prompt: form.prompt,
              model: form.model,
              webhook_url: form.webhook_url,
              response_template: form.response_template,
              advanced_settings: form.advanced_settings,
              user_id: user?.id,
              // Adiciona todos os campos adicionais
              stop_bot_on_message: form.stop_bot_on_message,
              pause_window_minutes: form.pause_window_minutes,
              split_long_messages: form.split_long_messages,
              show_typing_indicator: form.show_typing_indicator,
              typing_delay_per_char_ms: form.typing_delay_per_char_ms,
              concat_messages: form.concat_messages,
              concat_time_seconds: form.concat_time_seconds,
              context_window_size: form.context_window_size
            }
          ])
          .select()
          .single();

        if (agentError) throw agentError;

        // If question and answer are provided, insert them into qa_pairs
        if (form.question && form.response_template && agentData.id) {
          const { error: qaError } = await supabase
            .from('qa_pairs')
            .insert([
              {
                question: form.question,
                answer: form.response_template,
                agent_id: agentData.id,
                user_id: user?.id
              }
            ]);

          if (qaError) {
            console.error('Error saving QA pair:', qaError);
            // Continue anyway, as the agent was created successfully
          }
        }

        // Atualiza ou insere wa_connections
        if (agentData && agentData.id && connectionName && phoneNumber) {
          const { data: existingConn } = await supabase
            .from('wa_connections')
            .select('id')
            .eq('agent_id', agentData.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          const waPayload = {
            instance_name: connectionName,
            numero_wa: phoneNumber,
            agent_id: agentData.id,
            user_id: user?.id
          };

          if (existingConn?.id) {
            await supabase
              .from('wa_connections')
              .update(waPayload)
              .eq('id', existingConn.id)
              .eq('user_id', user?.id);
          } else {
            await supabase
              .from('wa_connections')
              .insert([waPayload]);
          }
        }

        setSuccess('Agente criado com sucesso!');
        // Redireciona para a edição do novo agente para evitar id=undefined em updates
        setTimeout(() => {
          if (agentData && agentData.id) {
            navigate(`/configurar-agente/${agentData.id}`);
          } else {
            navigate('/');
          }
        }, 1000);
      } else if (id && id !== 'new') {
        // Update existing agent
        const { error: agentError } = await supabase
          .from('agents')
          .update({
            name: form.name,
            description: form.description,
            active: form.active,
            type: form.type,
            prompt: form.prompt,
            model: form.model,
            webhook_url: form.webhook_url,
            response_template: form.response_template,
            advanced_settings: form.advanced_settings,
            // Adiciona todos os campos adicionais
            stop_bot_on_message: form.stop_bot_on_message,
            pause_window_minutes: form.pause_window_minutes,
            split_long_messages: form.split_long_messages,
            show_typing_indicator: form.show_typing_indicator,
            typing_delay_per_char_ms: form.typing_delay_per_char_ms,
            concat_messages: form.concat_messages,
            concat_time_seconds: form.concat_time_seconds,
            context_window_size: form.context_window_size
          })
          .eq('id', id)
          .eq('user_id', user?.id);

        if (agentError) throw agentError;

        // Check if there's an existing QA pair for this agent
        const { data: existingQA, error: qaFetchError } = await supabase
          .from('qa_pairs')
          .select('id')
          .eq('agent_id', id)
          .eq('user_id', user?.id)
          .maybeSingle();

        if (qaFetchError) {
          console.error('Error fetching QA pair:', qaFetchError);
        }

        // If question is provided, update or insert QA pair
        if (form.question && form.response_template) {
          if (existingQA?.id) {
            // Update existing QA pair
            const { error: qaUpdateError } = await supabase
              .from('qa_pairs')
              .update({
                question: form.question,
                answer: form.response_template
              })
              .eq('id', existingQA.id)
              .eq('user_id', user?.id);

            if (qaUpdateError) {
              console.error('Error updating QA pair:', qaUpdateError);
            }
          } else {
            // Insert new QA pair
            const { error: qaInsertError } = await supabase
              .from('qa_pairs')
              .insert([
                {
                  question: form.question,
                  answer: form.response_template,
                  agent_id: id,
                  user_id: user?.id
                }
              ]);

            if (qaInsertError) {
              console.error('Error inserting QA pair:', qaInsertError);
            }
          }
        }

        // Atualiza ou insere wa_connections
        if (id && connectionName && phoneNumber) {
          const { data: existingConn } = await supabase
            .from('wa_connections')
            .select('id')
            .eq('agent_id', id)
            .eq('user_id', user?.id)
            .maybeSingle();

          const waPayload = {
            instance_name: connectionName,
            numero_wa: phoneNumber,
            agent_id: id,
            user_id: user?.id
          };

          if (existingConn?.id) {
            await supabase
              .from('wa_connections')
              .update(waPayload)
              .eq('id', existingConn.id)
              .eq('user_id', user?.id);
          } else {
            await supabase
              .from('wa_connections')
              .insert([waPayload]);
          }
        }

        setSuccess('Agente atualizado com sucesso!');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      setError('Ocorreu um erro ao salvar o agente.');
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/painel-controle');
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // Informações Básicas (antigo case 1)
        const handleSalvarBasico = async () => {
          try {
            const payload = {
              name: form.name,
              description: form.description,
              active: form.active
            };
            await fetch('https://webhooks.botvance.com.br/webhook/41869a3e-8f88-45da-82a5-zobotapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            setSuccess('Dados enviados para o webhook com sucesso!');
          } catch (err) {
            setError('Erro ao enviar dados para o webhook.');
          }
        };

        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Informações Básicas</h3>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Nome do Agente</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-[#2a3042] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Assistente de Vendas"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Descrição</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full bg-[#2a3042] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Descreva o propósito deste agente..."
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 bg-[#2a3042] border-[#374151]"
                />
                <span className="ml-2 text-gray-300">Ativo</span>
              </label>
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 bg-[#2a3042] hover:bg-[#374151] rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg"
              >
                Próximo
              </button>
            </div>
          </div>
        );
      case 2:
        // Configurar IA (antigo case 2)
        return (
          <div>
            <div className="flex mb-6 border-b border-[#2a3042]">
              <button
                onClick={() => setIaTab('config')}
                className={`px-6 py-3 font-medium ${
                  iaTab === 'config'
                    ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Configuração IA
              </button>
              <button
                onClick={() => setIaTab('assistant')}
                className={`px-6 py-3 font-medium ${
                  iaTab === 'assistant'
                    ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Assistente de Prompt
              </button>
            </div>
            {iaTab === 'config' ? (
              <>
                <h3 className="text-xl font-semibold mb-4">Configurar IA</h3>
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Tipo</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full bg-[#2a3042] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="OPENAI">OpenAI</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Modelo</label>
                  <select
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    className="w-full bg-[#2a3042] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableModels[form.type]?.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Prompt do Sistema</label>
                  <textarea
                    name="prompt"
                    value={form.prompt}
                    onChange={handleChange}
                    className="w-full bg-[#2a3042] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 font-mono"
                    placeholder="Insira o prompt do sistema para o agente..."
                  ></textarea>
                </div>
              </>
            ) : (
              <PromptAssistant />
            )}
          </div>
        );
      case 3:
        // Configurar Respostas (antigo case 4)
        return (
          <ConfigurarRespostas 
            id={id} 
            user={user} 
            form={form} 
            setForm={setForm} 
            setError={setError} 
            setSuccess={setSuccess}
            supabase={supabase}
          />
        );
      case 4:
        // Configurações Adicionais (antigo case 5)
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Configurações Adicionais</h3>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">
                Temperatura: {form.advanced_settings.temperature}
              </label>
              <input
                type="range"
                name="temperature"
                min="0"
                max="1"
                step="0.1"
                value={form.advanced_settings.temperature}
                onChange={handleAdvancedSettingsChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Mais preciso</span>
                <span>Mais criativo</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">
                Máximo de Tokens: {form.advanced_settings.max_tokens}
              </label>
              <input
                type="range"
                name="max_tokens"
                min="100"
                max="4000"
                step="100"
                value={form.advanced_settings.max_tokens}
                onChange={handleAdvancedSettingsChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Respostas curtas</span>
                <span>Respostas longas</span>
              </div>
            </div>
            

            {/* Novas opções avançadas */}
            <div className="bg-[#1e2738] p-4 rounded-lg mb-6 space-y-6">

              {/* Tamanho da janela de contexto */}
              <div>
                <label className="text-white font-medium text-lg mb-1 block">Tamanho da janela de contexto</label>
                <div className="flex items-center space-x-2 mb-1">
                  <input
                    type="number"
                    name="context_window_size"
                    min={1}
                    value={form.context_window_size}
                    onChange={handleChange}
                    className="w-20 bg-[#2a3042] border border-[#374151] rounded px-2 py-1 text-white"
                  />
                  <span className="text-gray-400">mensagens</span>
                </div>
                <span className="text-gray-400 text-xs">
                  Quantidade de mensagens anteriores que o bot considera para gerar uma resposta contextualizada.
                </span>
              </div>
              {/* Parar o bot ao enviar mensagem */}
              <div>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="stop_bot_on_message"
                    checked={form.stop_bot_on_message}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 bg-[#2a3042] border-[#374151]"
                  />
                  <span className="ml-2 text-white font-medium text-lg">Parar bot ao enviar mensagem</span>
                </label>
                <span className="text-gray-400 text-sm block mb-2">Parar o bot ao atendente enviar uma mensagem</span>
                <div className="flex items-center space-x-2 mb-1">
                  <label className="text-gray-300 font-medium">Janela de pausa</label>
                  <input
                    type="number"
                    name="pause_window_minutes"
                    min={1}
                    value={form.pause_window_minutes}
                    onChange={handleChange}
                    className="w-20 bg-[#2a3042] border border-[#374151] rounded px-2 py-1 text-white ml-2"
                  />
                  <span className="text-gray-400">min</span>
                </div>
                <span className="text-gray-400 text-xs">tempo de pausa do bot para eu responder as mensagens</span>
              </div>

              {/* Dividir mensagens em partes menores */}
              <div>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="split_long_messages"
                    checked={form.split_long_messages}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 bg-[#2a3042] border-[#374151]"
                  />
                  <span className="ml-2 text-white font-medium text-lg">Dividir mensagens em partes menores</span>
                </label>
                <span className="text-gray-400 text-sm">Dividir mensagens longas em múltiplas mensagens menores</span>
              </div>

              {/* Mostrar indicador de digitação */}
              <div>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="show_typing_indicator"
                    checked={form.show_typing_indicator}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 bg-[#2a3042] border-[#374151]"
                  />
                  <span className="ml-2 text-white font-medium text-lg">Mostrar indicador de digitação</span>
                </label>
                <span className="text-gray-400 text-sm block mb-2">
                  Exibir indicador de digitação/gravação no WhatsApp durante o processamento
                </span>
                <div className="flex items-center space-x-2 mb-1">
                  <label className="text-gray-300 font-medium">Tempo por caractere</label>
                  <input
                    type="number"
                    name="typing_delay_per_char_ms"
                    min={0}
                    value={form.typing_delay_per_char_ms}
                    onChange={handleChange}
                    className="w-20 bg-[#2a3042] border border-[#374151] rounded px-2 py-1 text-white ml-2"
                  />
                  <span className="text-gray-400">ms</span>
                </div>
                <span className="text-gray-400 text-xs">Atraso de simulação de digitação por caractere</span>
              </div>

              {/* Concatenação de mensagens */}
              <div>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="concat_messages"
                    checked={form.concat_messages}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 bg-[#2a3042] border-[#374151]"
                  />
                  <span className="ml-2 text-white font-medium text-lg">Concatenação de mensagens</span>
                </label>
                <div className="flex items-center space-x-2 mb-1">
                  <label className="text-gray-300 font-medium">Tempo de concatenação</label>
                  <input
                    type="number"
                    name="concat_time_seconds"
                    min={1}
                    value={form.concat_time_seconds}
                    onChange={handleChange}
                    className="w-20 bg-[#2a3042] border border-[#374151] rounded px-2 py-1 text-white ml-2"
                  />
                  <span className="text-gray-400">seg</span>
                </div>
                <span className="text-gray-400 text-xs">tempo que o bot vai juntar mensagens consecutivas e dar uma resposta apenas</span>
              </div>
            </div>
          </div>
        );
      case 5:
        // Conectar com WhatsApp (antigo case 3)
        if (id === 'new') {
          return (
            <div>
              <h3 className="text-xl font-semibold mb-4">Conectar com WhatsApp</h3>
              <div className="bg-yellow-900/30 border border-yellow-600 text-yellow-200 rounded-lg p-6 mb-6">
                <strong>Salve as alterações do agente antes de conectar com o WhatsApp.</strong>
                <div className="mt-2 text-sm">
                  Para vincular a conexão ao agente, clique em <b>Salvar Alterações</b> ou <b>Finalizar</b> para criar o agente, depois retorne a este passo.
                </div>
              </div>
              <button
                type="button"
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-md opacity-60 cursor-not-allowed"
                disabled
              >
                Conectar WhatsApp
              </button>
            </div>
          );
        }
        // (restante do conteúdo do antigo case 3, igual estava antes)
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Conectar com WhatsApp</h3>
            
            {/* Status Indicator */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#374151] bg-[#2a3042]">
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
                className={`px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isCheckingConnection ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Verificar
              </button>
              {connectionStatus.text === 'Conectado' && (
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDisconnecting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Desconectar
                </button>
              )}
            </div>

            {whatsappError && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                {whatsappError}
              </div>
            )}

            {!qrCodeData ? (
              <div className="bg-[#1e2738] p-6 rounded-lg mb-6">
                <div className="flex items-center mb-4">
                  <QrCode className="h-6 w-6 text-[#3b82f6] mr-2" />
                  <h4 className="text-lg font-medium">Conectar WhatsApp</h4>
                </div>
                
                <form onSubmit={handleConnectWhatsApp} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">
                      Nome da Conexão
                    </label>
                    <input
                      type="text"
                      value={connectionName}
                      onChange={(e) => {
                        const raw = e.target.value.toLowerCase();
                        const filtered = raw.replace(/[^a-z0-9\-_]/g, '').slice(0, 12);
                        setConnectionName(filtered);
                      }}
                      maxLength={12}
                      placeholder="Digite um nome (até 12 caracteres)"
                      className="w-full px-3 py-2 bg-[#2a3042] border border-[#374151] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">
                      Número do WhatsApp
                    </label>
                    <div className="flex">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-24 px-3 py-2 bg-[#2a3042] border border-[#374151] rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="+55">+55</option>
                      </select>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="DDD + Número"
                        className="flex-1 px-3 py-2 bg-[#2a3042] border border-[#374151] rounded-r-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isConnecting}
                    className={`w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                      isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isConnecting ? 'Conectando...' : 'Conectar WhatsApp'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-[#1e2738] p-6 rounded-lg mb-6 text-center">
                <h4 className="text-lg font-medium mb-4">Escaneie o QR Code</h4>
                <div className="mb-4 bg-white p-4 inline-block rounded">
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
                  <p className="text-gray-300 mb-4">
                    Código de pareamento: <span className="font-mono font-bold">{qrCodeData.pairingCode}</span>
                  </p>
                )}
                <button
                  onClick={() => setQrCodeData(null)}
                  className="text-[#3b82f6] hover:text-[#2563eb]"
                >
                  Tentar novamente
                </button>
              </div>
            )}
            
            
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white">
      {/* Header */}
      <header className="bg-[#131825] p-4 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => {
              if (isDirty) {
                const confirm = window.confirm('Existem alterações não salvas. Tem certeza que deseja sair?');
                if (!confirm) return;
              }
              navigate('/painel-controle');
            }}
            className="flex items-center text-white mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8l-4 4m0 0l4 4m-4-4h18" />
            </svg>
            <span className="ml-2">Sair</span>
          </button>
          <h1 className="text-2xl font-bold">Editar Configurações do Agente</h1>
        </div>
        <div className="flex items-center">
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2 rounded-lg mr-4"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Salvando...</span>
              </div>
            ) : (
              'Salvar Alterações'
            )}
          </button>
          <button
            onClick={() => navigate('/minha-conta')}
            className="flex items-center bg-[#2a3042] hover:bg-[#374151] rounded-full p-2 mr-2"
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

      {/* Progress Bar */}
      <div className="bg-[#131825] py-8 px-6 border-t border-[#2a3042]">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Progresso de Configuração</h2>
            <span className="text-gray-400">Passo {currentStep} de {totalSteps}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div 
              onClick={() => goToStep(1)}
              className={`flex items-center p-4 rounded-lg cursor-pointer ${
                currentStep === 1 ? 'bg-[#3b82f6]' : 'bg-[#1e2738]'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                currentStep === 1 ? 'bg-white text-[#3b82f6]' : 'bg-[#2a3042] text-white'
              }`}>
                <span className="font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold">Informações Básicas</h3>
                <p className="text-sm text-gray-300">Configure o nome, descrição e aparência do seu agente</p>
              </div>
            </div>
            {/* Step 2 */}
            <div 
              onClick={() => goToStep(2)}
              className={`flex items-center p-4 rounded-lg cursor-pointer ${
                currentStep === 2 ? 'bg-[#3b82f6]' : 'bg-[#1e2738]'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                currentStep === 2 ? 'bg-white text-[#3b82f6]' : 'bg-[#2a3042] text-white'
              }`}>
                <span className="font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold">Configurar IA</h3>
                <p className="text-sm text-gray-300">Configure a ferramenta de Inteligência Artificial</p>
              </div>
            </div>
            {/* Step 3 */}
            <div 
              onClick={() => goToStep(3)}
              className={`flex items-center p-4 rounded-lg cursor-pointer ${
                currentStep === 3 ? 'bg-[#3b82f6]' : 'bg-[#1e2738]'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                currentStep === 3 ? 'bg-white text-[#3b82f6]' : 'bg-[#2a3042] text-white'
              }`}>
                <span className="font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold">Configurar Respostas</h3>
                <p className="text-sm text-gray-300">Configure como seu agente responderá às mensagens</p>
              </div>
            </div>
            {/* Step 4 */}
            <div 
              onClick={() => goToStep(4)}
              className={`flex items-center p-4 rounded-lg cursor-pointer ${
                currentStep === 4 ? 'bg-[#3b82f6]' : 'bg-[#1e2738]'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                currentStep === 4 ? 'bg-white text-[#3b82f6]' : 'bg-[#2a3042] text-white'
              }`}>
                <span className="font-bold">4</span>
              </div>
              <div>
                <h3 className="font-semibold">Configurações Adicionais</h3>
                <p className="text-sm text-gray-300">Configurações avançadas e de sessão</p>
              </div>
            </div>
            {/* Step 5 */}
            <div 
              onClick={() => goToStep(5)}
              className={`flex items-center p-4 rounded-lg cursor-pointer ${
                currentStep === 5 ? 'bg-[#3b82f6]' : 'bg-[#1e2738]'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                currentStep === 5 ? 'bg-white text-[#3b82f6]' : 'bg-[#2a3042] text-white'
              }`}>
                <span className="font-bold">5</span>
              </div>
              <div>
                <h3 className="font-semibold">Conectar com WhatsApp</h3>
                <p className="text-sm text-gray-300">Configure o webhook para integração com Evolution API</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto bg-[#131825] rounded-lg p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-200">
                  {success}
                </div>
              )}
              
              {renderStepContent()}
              
              {currentStep !== 1 && (
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 bg-[#2a3042] hover:bg-[#374151] rounded-lg"
                  >
                    {currentStep === 1 ? 'Cancelar' : 'Anterior'}
                  </button>
                  <button
                    type="button"
                    onClick={currentStep === totalSteps ? handleSubmit : nextStep}
                    className="px-6 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg"
                  >
                    {currentStep === totalSteps ? 'Finalizar' : 'Próximo'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ConfigurarAgente;
