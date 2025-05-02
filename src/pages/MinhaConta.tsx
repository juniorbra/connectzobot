import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

import { Database } from '../database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function MinhaConta() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { user } = useAuth();

  React.useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        // Usando a função RPC get_profile para obter o perfil do usuário atual
        const { data, error } = await supabase
          .rpc('get_profile')
          .single();

        if (error) throw error;
        // Garantir que o tipo está correto
        setProfile(data as Profile);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-600">
        Informações não encontradas
      </div>
    );
  }

  // Calcular a porcentagem de utilização com valores padrão caso sejam undefined
  const consumo = profile.consumo ?? 0;
  const franquia = profile.franquia ?? 1000;
  const utilizacaoPercentual = Math.round((consumo / franquia) * 100);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'Não conectado';
    
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
    }
    
    // Return original if format doesn't match
    return phone;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-8">
          <User className="h-8 w-8 text-blue-600 mr-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            Informações da Conta
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Nome</label>
            <p className="mt-1 text-lg text-gray-900">{profile.nome}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Telefone de Cadastro</label>
            <p className="mt-1 text-lg text-gray-900">{profile.telefone ? formatPhoneNumber(profile.telefone) : 'Não informado'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">WhatsApp do Zobot</label>
            <p className="mt-1 text-lg text-gray-900">{profile.whatsapp ? formatPhoneNumber(profile.whatsapp) : 'Não conectado'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <p className="mt-1 text-lg text-gray-900">{profile.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Status da Assinatura</label>
            <p className={`mt-1 text-lg font-medium ${profile.assinatura === true ? 'text-green-600' : 'text-red-600'}`}>
              {profile.assinatura === true ? 'Ativa' : 'Inativa'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Utilização</label>
            <p className="mt-1 text-lg text-gray-900">{consumo} mensagens</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Franquia do Plano</label>
            <p className="mt-1 text-lg text-gray-900">{franquia} mensagens</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${utilizacaoPercentual}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{utilizacaoPercentual}% utilizado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
