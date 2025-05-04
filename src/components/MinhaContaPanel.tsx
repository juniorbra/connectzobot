import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

import { Database } from '../database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Subscription = Database['public']['Tables']['subscription']['Row'];

export default function MinhaContaPanel() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { user } = useAuth();

  React.useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
        
        // Fetch subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscription')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          // Only throw if it's not a "not found" error
          throw subscriptionError;
        }
        
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-400">
        Informações não encontradas
      </div>
    );
  }

  // Format phone number for display

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
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Minha Conta</h2>
      </div>

      <div className="bg-[#131825] rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-400">Nome</label>
            <p className="mt-1 text-lg text-white">{profile.nome}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">Telefone de Cadastro</label>
            <p className="mt-1 text-lg text-white">{profile.telefone ? formatPhoneNumber(profile.telefone) : 'Não informado'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">Email</label>
            <p className="mt-1 text-lg text-white">{profile.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">Plano</label>
            <p className={`mt-1 text-lg font-medium ${subscription?.subscription === true ? 'text-green-400' : 'text-red-400'}`}>
              {subscription?.subscription === true ? 'Plano Pago' : 'Plano Grátis'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400">Workflows Criados</label>
            <p className="mt-1 text-lg text-white">{subscription?.number_workflows || 0}</p>
          </div>

          {/* Subscription information is displayed above */}
        </div>
      </div>
    </div>
  );
}
