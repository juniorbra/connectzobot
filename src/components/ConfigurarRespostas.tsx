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
  
  // Fetch QA pairs when the component mounts
  useEffect(() => {
    if (id && id !== 'new') {
      fetchQAPairs();
    }
  }, [id]);
  
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
      <h3 className="text-xl font-semibold mb-4">Configurar Respostas</h3>

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
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium">Pares de Perguntas e Respostas</h4>
          <button
            type="button"
            onClick={() => {
              // Set state for adding new QA pair
              setIsAddingNew(true);
              setEditingPairId(null);
              setForm({
                ...form,
                question: '',
                response_template: ''
              });
            }}
            className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-md text-white"
          >
            Adicionar Novo
          </button>
        </div>

        {qaPairs.length === 0 && !isAddingNew && !editingPairId && (
          <div className="bg-[#1e2738] p-4 rounded-lg mb-4 text-center">
            <p className="text-gray-400">Nenhum par de pergunta e resposta cadastrado.</p>
          </div>
        )}

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
