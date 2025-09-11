import { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';

export function useAuth() {
  const { setSession, setLoadingAuth, setShowPasswordReset } = useAppStore();

  useEffect(() => {
    setLoadingAuth(true);

    const handlePasswordRecovery = async () => {
      const url = new URL(window.location.href);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        window.history.replaceState({}, document.title, window.location.pathname);

        if (error) {
          console.error('Error setting session from URL:', error);
        } else {
          setShowPasswordReset(true);
        }
      }
    };

    handlePasswordRecovery();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'PASSWORD_RECOVERY') {
        setShowPasswordReset(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setLoadingAuth, setShowPasswordReset]);

  // Este hook ahora no necesita devolver nada, ya que el estado se consume desde el store.
  // Sin embargo, lo mantenemos por si en el futuro necesitamos exponer alguna función específica.
  return {};
}
