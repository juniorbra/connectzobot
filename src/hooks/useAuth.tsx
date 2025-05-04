import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string, telefone: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nome: string, telefone: string) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          telefone
        }
      }
    });

    if (signUpError) throw signUpError;
    
    if (data.user) {
      try {
        // Check if profile already exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          // Error other than "not found"
          throw fetchError;
        }
        
        if (existingProfile) {
          // Profile exists, update it
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              nome, 
              telefone, 
              email 
            })
            .eq('id', data.user.id);
          
          if (updateError) throw updateError;
        } else {
          // Profile doesn't exist, insert it
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: data.user.id, 
              nome, 
              telefone, 
              email 
            }]);
          
          if (insertError) throw insertError;
        }
        
        // Create subscription record for the new user
        const { error: subscriptionError } = await supabase
          .from('subscription')
          .insert([{
            id: data.user.id,
            number_workflows: 0,
            subscription: false
          }]);
          
        if (subscriptionError && subscriptionError.code !== '23505') { // Ignore duplicate key error
          throw subscriptionError;
        }
      } catch (error) {
        console.error('Error setting up user profile:', error);
        throw error;
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
