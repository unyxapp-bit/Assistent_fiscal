import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, nome: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setStatus('error');
        setError(error.message);
        return;
      }
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setStatus(data.session ? 'authenticated' : 'unauthenticated');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, next) => {
      if (!mounted) return;
      setSession(next);
      setUser(next?.user ?? null);
      setStatus(next ? 'authenticated' : 'unauthenticated');
      setError(null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setStatus('loading');
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      setStatus('error');
      setError(error?.message ?? 'Erro ao autenticar');
      return false;
    }

    setSession(data.session);
    setUser(data.session.user);
    setStatus('authenticated');
    return true;
  };

  const signUp = async (email: string, password: string, nome: string) => {
    setStatus('loading');
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
        },
      },
    });

    if (error || !data.user) {
      setStatus('error');
      setError(error?.message ?? 'Erro ao criar conta');
      return false;
    }

    setStatus(data.session ? 'authenticated' : 'unauthenticated');
    setUser(data.user);
    setSession(data.session ?? null);
    return true;
  };

  const signOut = async () => {
    setStatus('loading');
    setError(null);
    await supabase.auth.signOut();
    setStatus('unauthenticated');
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    setStatus('loading');
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setStatus('error');
      setError(error.message);
      return false;
    }
    setStatus(user ? 'authenticated' : 'unauthenticated');
    return true;
  };

  const value = useMemo(
    () => ({
      status,
      user,
      session,
      error,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [status, user, session, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
