import { type Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AUTH_COPY } from '../constants';
import { mapAuthErrorToMessage } from '../lib/auth/errors';
import { supabase } from '../lib/supabase/client';

type SignInInput = {
  email: string;
  password: string;
};

const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }

      if (error) {
        setErrorMessage(mapAuthErrorToMessage(error));
      }

      setSession(data.session);
      setIsLoading(false);
    };

    void hydrateSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) {
        return;
      }

      setSession(nextSession);
      setErrorMessage(null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }: SignInInput) => {
    setErrorMessage(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(mapAuthErrorToMessage(error));
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    setErrorMessage(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(mapAuthErrorToMessage(error));
    }

    setIsLoading(false);
  }, []);

  const email = useMemo<string>(() => {
    return session?.user.email ?? AUTH_COPY.unknownEmailLabel;
  }, [session]);

  return {
    email,
    session,
    isLoading,
    errorMessage,
    signIn,
    signOut,
  };
};

export default useAuthSession;
