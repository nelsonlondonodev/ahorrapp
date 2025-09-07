import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    // Set initial loading to true
    setLoading(true);

    // Check for password recovery tokens in the URL
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get('access_token');
    const refreshToken = url.searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
      (async () => {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          console.error('Error setting session from URL:', error);
          // Clear URL params and finish loading
          window.history.replaceState({}, document.title, window.location.pathname);
          setLoading(false);
          return;
        }
        // If session is set, show the password reset modal
        setShowPasswordReset(true);
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
      })();
    }

    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // If the event is PASSWORD_RECOVERY, we could have already handled it above,
      // but it's good to have a fallback or handle other scenarios.
      if (_event === 'PASSWORD_RECOVERY') {
        setShowPasswordReset(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { 
    session, 
    loading,
    showPasswordReset, 
    setShowPasswordReset 
  };
}
