import React, { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

interface ConfigurarRespostasProps {
  id: string | undefined;
  user: any;
  form: {
    question?: string;
    response_template: string;
    [key: string]: any;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
  supabase: SupabaseClient<Database>;
}

const ConfigurarRespostas: React.FC<ConfigurarRespostasProps> = ({
  id,
  user,
  form,
  setForm,
  setError,
  setSuccess,
  supabase
}) => {
  const [qaPairs, setQaPairs] = useState<Array<{id: string, question: string, answer: string}>>([]);
  const [editingPairId, setEditingPairId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  
  // Fetch QA pairs and API key when the component mounts
  useEffect(() => {
    if (id && id !== 'new') {
      fetchQAPairs();
      fetchApiKey();
    }
  }, [id]);
  
  // Function to fetch the OpenAI API key
  const fetchApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('api_openai')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();
        
      if (error) {
        console.error('Error fetching API key:', error);
        return;
      }
      
      if (data && data.api_openai) {
        setApiKey(data.api_openai);
      }
    } catch (error) {
      console.error('Error in fetchApiKey:', error);
    }
  };
  
  // Function to update the OpenAI API key
  const updateApiKey = async () => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({
          api_openai: apiKey
        })
        .eq('id', id)
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error updating API key:', error);
        setError('Erro ao atualizar a chave API da OpenAI.');
        return;
      }
      
      setSuccess('Chave API da OpenAI atualizada com sucesso!');
    } catch (error) {
      console.error('Error in updateApiKey:', error);
      setError('Erro ao atualizar a chave API da OpenAI.');
    }
  };
  
  // Function to fetch QA pairs for this agent
  const fetchQAPairs = async () => {
    try {
      const { data, error } = await supabase
        .from('qa_pairs')
        .select('id, question, answer')
        .eq('agent_id', id)
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error fetching QA pairs:', error);
        return;
      }
      
      // Ensure question and answer are always strings
      setQaPairs((data || []).map(item => ({
        id: item.id,
        question: item.question || '',
        answer: item.answer || ''
      })));
    } catch (error) {
      console.error('Error in fetchQAPairs:', error);
    }
  };
  
  // Function to add a new QA pair
  const handleAddQAPair = async () => {
    if (!form.question || !form.response_template) {
      setError('Pergunta e resposta são obrigatórias.');
      return;
    }
    
    try {
      // Send webhook notification
      try {
        if (user?.email) {
          // Try to get user's phone from profiles table
          let telefone = '';
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('telefone, whatsapp')
              .eq('id', user.id)
              .single();
            
            // Use whatsapp if available, otherwise use telefone
            telefone = profileData?.whatsapp || profileData?.telefone || '';
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
          }
          
          await fetch('https://webhooks.botvance.com.br/webhook/a99eb6c2-037e-492e-9d31-a1f412fee823', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              telefone: telefone,
            }),
          });
        }
      } catch (webhookError) {
        console.error('Error sending webhook notification:', webhookError);
        // Continue with adding QA pair even if webhook fails
      }
      
      const { data, error } = await supabase
        .from('qa_pairs')
        .insert([
          {
            question: form.question,
            answer: form.response_template,
            agent_id: id,
            user_id: user?.id
          }
        ])
        .select()
        .single();
        
      if (error) {
        console.error('Error adding QA pair:', error);
        setError('Erro ao adicionar par de pergunta e resposta.');
        return;
      }
      
      // Add the new pair to the list
      if (data) {
        setQaPairs([...qaPairs, {
          id: data.id,
          question: data.question || '',
          answer: data.answer || ''
        }]);
      }
      
      // Clear the form
      setForm({
        ...form,
        question: '',
        response_template: ''
      });
      
      setIsAddingNew(false);
      setSuccess('Par de pergunta e resposta adicionado com sucesso!');
    } catch (error) {
      console.error('Error in handleAddQAPair:', error);
      setError('Erro ao adicionar par de pergunta e resposta.');
    }
  };
  
  // Function to update a QA pair
  const handleUpdateQAPair = async () => {
    if (!editingPairId || !form.question || !form.response_template) {
      setError('Pergunta e resposta são obrigatórias.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('qa_pairs')
        .update({
          question: form.question,
          answer: form.response_template
        })
        .eq('id', editingPairId)
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error updating QA pair:', error);
        setError('Erro ao atualizar par de pergunta e resposta.');
        return;
      }
      
      // Update the pair in the list
      setQaPairs(qaPairs.map(pair => 
        pair.id === editingPairId 
          ? { ...pair, question: form.question || '', answer: form.response_template } 
          : pair
      ));
      
      // Clear the form
      setForm({
        ...form,
        question: '',
        response_template: ''
      });
      
      setEditingPairId(null);
      setSuccess('Par de pergunta e resposta atualizado com sucesso!');
    } catch (error) {
      console.error('Error in handleUpdateQAPair:', error);
      setError('Erro ao atualizar par de pergunta e resposta.');
    }
  };
  
  // Function to delete a QA pair
  const handleDeleteQAPair = async (pairId: string) => {
    if (!confirm('Tem certeza que deseja excluir este par de pergunta e resposta?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('qa_pairs')
        .delete()
        .eq('id', pairId)
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error deleting QA pair:', error);
        setError('Erro ao excluir par de pergunta e resposta.');
        return;
      }
      
      // Remove the pair from the list
      setQaPairs(qaPairs.filter(pair => pair.id !== pairId));
      
      setSuccess('Par de pergunta e resposta excluído com sucesso!');
    } catch (error) {
      console.error('Error in handleDeleteQAPair:', error);
      setError('Erro ao excluir par de pergunta e resposta.');
    }
  };
  
  // Function to edit a QA pair
  const handleEditQAPair = (pair: {id: string, question: string, answer: string}) => {
    setForm({
      ...form,
      question: pair.question,
      response_template: pair.answer
    });
    
    setEditingPairId(pair.id);
    setIsAddingNew(false);
  };
  
  // Function to cancel editing
  const handleCancelEdit = () => {
    setForm({
      ...form,
      question: '',
      response_template: ''
    });
    
    setEditingPairId(null);
    setIsAddingNew(false);
  };
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Configurar OpenAI</h3>

      {/* Form for adding/editing QA pairs */}
      {(isAddingNew || editingPairId) && (
        <div className="bg-[#1e2738] p-4 rounded-lg mb-6">
          <h4 className="text-lg font-medium mb-4">
            {editingPairId ? 'Editar Par' : 'Adicionar Novo Par'}
          </h4>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Pergunta</label>
            <textarea
              name="question"
              value={form.question || ''}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="w-full bg-[#2a3042] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono"
              placeholder="Digite a pergunta que o usuário pode fazer..."
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Resposta</label>
            <textarea
              name="response_template"
              value={form.response_template}
              onChange={(e) => setForm({ ...form, response_template: e.target.value })}
              className="w-full bg-[#2a3042] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 font-mono"
              placeholder="Digite a resposta para a pergunta acima..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-[#2a3042] hover:bg-[#374151] rounded-md text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={editingPairId ? handleUpdateQAPair : handleAddQAPair}
              className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-md text-white"
            >
              {editingPairId ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      {/* List of QA pairs */}
      <div className="mb-6">
        <div className="mb-4">
          <h4 className="text-lg font-medium mb-2">Insira a sua chave API da OpenAI</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-grow bg-[#2a3042] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sk-..."
            />
            <button
              type="button"
              onClick={updateApiKey}
              className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-md text-white"
            >
              Salvar
            </button>
          </div>
          
          <div className="bg-[#1e2738] p-4 rounded-lg mt-4">
            <p className="text-white font-medium mb-2">🔐 Como gerar uma chave de API na OpenAI</p>
            <ol className="list-decimal pl-5 text-gray-300 space-y-1">
              <li>Acesse o site: <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://platform.openai.com/account/api-keys</a></li>
              <li>Faça login com sua conta OpenAI (ou crie uma, se ainda não tiver).</li>
              <li>Na seção "API Keys", clique no botão "Create new secret key".</li>
              <li>Dê um nome para identificar essa chave (ex: "Integração com WhatsApp").</li>
              <li>Clique em "Create secret key".</li>
              <li>Copie a chave exibida na tela — ela só aparecerá uma vez!</li>
              <li>Guarde essa chave em local seguro (como um gerenciador de senhas ou variável de ambiente no seu sistema).</li>
            </ol>
          </div>
        </div>


        {qaPairs.map(pair => (
          <div key={pair.id} className="bg-[#1e2738] p-4 rounded-lg mb-4">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium text-white">Pergunta:</h5>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleEditQAPair(pair)}
                  className="px-3 py-1 bg-[#3b82f6] hover:bg-[#2563eb] rounded text-white text-sm"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteQAPair(pair.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
            <p className="text-gray-300 mb-4 whitespace-pre-wrap">{pair.question}</p>
            <h5 className="font-medium text-white mb-2">Resposta:</h5>
            <p className="text-gray-300 whitespace-pre-wrap">{pair.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigurarRespostas;
