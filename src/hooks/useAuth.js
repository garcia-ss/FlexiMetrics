import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { signIn, signUp, signOut } from '../services/authService';

/**
 * Hook para gerenciar autenticação
 * @returns {Object} - Estado e ações de autenticação
 */
export const useAuth = () => {
  const {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    setUser,
    setLoading,
    setError,
    clearError,
    reset,
    initialize
  } = useAuthStore();

  useEffect(() => {
    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    clearError();

    const { user, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return { success: false, error };
    }

    setUser(user);
    setLoading(false);
    return { success: true, user };
  };

  const register = async (data) => {
    setLoading(true);
    clearError();

    const { user, error } = await signUp(data);

    if (error) {
      setError(error.message);
      setLoading(false);
      return { success: false, error };
    }

    setUser(user);
    setLoading(false);
    return { success: true, user };
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await signOut();

    if (error) {
      setError(error.message);
    }

    reset();
    setLoading(false);
    return { success: !error, error };
  };

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError
  };
};
