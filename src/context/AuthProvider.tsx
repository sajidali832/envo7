
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export type AuthProfile = {
    id: string;
    username: string;
    status: 'pending_investment' | 'pending_approval' | 'active' | 'inactive' | 'rejected';
} | null;

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, status')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user profile:', error);
            setProfile(null);
        } else {
            setProfile(data as AuthProfile);
        }
    } catch (e) {
        console.error('Exception fetching profile:', e);
        setProfile(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await fetchProfile(currentUser);
      setLoading(false);

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setLoading(true);
          setSession(session);
          const newCurrentUser = session?.user ?? null;
          setUser(newCurrentUser);
          await fetchProfile(newCurrentUser);
          setLoading(false);
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    const unsubscribe = initializeAuth();
    
    return () => {
      unsubscribe.then(cleanup => cleanup && cleanup());
    }
  }, [fetchProfile]);

  const value = {
    session,
    user,
    profile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
