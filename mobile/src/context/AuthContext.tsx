import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string, avatar: string, isCustom?: boolean) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Função para converter usuário do Supabase para o formato User do app
const convertToUser = async (supabaseUser: any): Promise<User | null> => {
  if (!supabaseUser) return null;

  // Buscar perfil adicional na tabela profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .single();

  return {
    id: supabaseUser.id,
    name: profile?.name || supabaseUser.user_metadata?.name || '',
    email: supabaseUser.email || '',
    avatar: profile?.avatar || 'default',
    isCustomAvatar: profile?.avatar !== 'default',
    handle: profile?.handle || `@${supabaseUser.email?.split('@')[0]}`,
    joinedAt: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Verificar sessão existente ao carregar o app
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const convertedUser = await convertToUser(session.user);
        setUser(convertedUser);
      }
      setLoading(false);
    });

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const convertedUser = await convertToUser(session.user);
          setUser(convertedUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const trimEmail = email.trim().toLowerCase();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimEmail,
      password: password,
    });

    if (error) {
      console.error('Erro no login:', error.message);
      switch (error.message) {
        case 'Invalid login credentials':
          return 'E-mail ou senha incorretos.';
        case 'Email not confirmed':
          return 'Por favor, confirme seu e-mail antes de fazer login.';
        default:
          return 'Erro ao fazer login. Tente novamente.';
      }
    }

    // Login bem sucedido - o onAuthStateChange vai atualizar o user
    return null;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    avatar: string,
    isCustom: boolean = false,
  ): Promise<string | null> => {
    const trimEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    
    try {
      // Registrar no Supabase Auth - sem enviar handle (o trigger usará o email)
      const { data, error } = await supabase.auth.signUp({
        email: trimEmail,
        password: password,
        options: {
          data: {
            name: trimmedName,
            full_name: trimmedName,
            avatar: avatar,
            isCustomAvatar: isCustom,
            // NÃO enviar handle aqui - deixar o trigger usar o email
          },
        },
      });

      if (error) {
        console.error('Erro no registro:', error.message);
        switch (error.message) {
          case 'User already registered':
            return 'Este e-mail já está cadastrado.';
          case 'Database error saving new user':
            return 'Erro ao salvar usuário. Tente novamente.';
          default:
            return error.message;
        }
      }

      if (data.user) {
        // Aguardar o trigger criar o perfil
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Tentar fazer login automático
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimEmail,
          password: password,
        });
        
        if (signInError) {
          console.error('Erro no login automático:', signInError.message);
          return 'Conta criada! Por favor, faça login.';
        }
      }

      return null; // Sucesso
      
    } catch (error) {
      console.error('Erro inesperado no registro:', error);
      return 'Erro ao criar conta. Tente novamente.';
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // O onAuthStateChange vai limpar o user automaticamente
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}