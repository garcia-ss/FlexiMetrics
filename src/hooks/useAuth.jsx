// import { useEffect } from 'react';
// import { useAuthStore } from '../stores/authStore';
// import { signIn, signUp, signOut } from '../services/authService';

// /**
//  * Hook para gerenciar autenticação
//  * @returns {Object} - Estado e ações de autenticação
//  */
// export const useAuth = () => {
//   const {
//     user,
//     session,
//     loading,
//     error,
//     isAuthenticated,
//     setUser,
//     setLoading,
//     setError,
//     clearError,
//     reset,
//     initialize
//   } = useAuthStore();

//   useEffect(() => {
//     initialize();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const login = async (email, password) => {
//     setLoading(true);
//     clearError();

//     const { user, error } = await signIn(email, password);

//     if (error) {
//       setError(error.message);
//       setLoading(false);
//       return { success: false, error };
//     }

//     setUser(user);
//     setLoading(false);
//     return { success: true, user };
//   };

//   const register = async (data) => {
//     setLoading(true);
//     clearError();

//     const { user, error } = await signUp(data);

//     if (error) {
//       setError(error.message);
//       setLoading(false);
//       return { success: false, error };
//     }

//     setUser(user);
//     setLoading(false);
//     return { success: true, user };
//   };

//   const logout = async () => {
//     setLoading(true);
//     const { error } = await signOut();

//     if (error) {
//       setError(error.message);
//     }

//     reset();
//     setLoading(false);
//     return { success: !error, error };
//   };

//   return {
//     user,
//     session,
//     loading,
//     error,
//     isAuthenticated,
//     login,
//     register,
//     logout,
//     clearError
//   };
// };


import { createContext, useContext, useState } from 'react';

/**
 * Contexto de Autenticação (Versão Simulada/Mock).
 * Utilizado temporariamente para contornar indisponibilidades no servidor backend.
 */
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Função de Login Simulada.
   * Não realiza chamadas HTTP reais. Em vez disso, simula um tempo de resposta
   * e força a aprovação das credenciais para permitir o acesso ao Dashboard.
   */
  const login = async (email, password) => {
    setLoading(true);
    setError('');
    
    // Simula a latência de rede (1.5 segundos)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Objeto de usuário simulado. 
    // IMPORTANTE: Altere a propriedade 'ocupacao' abaixo para 'aluno', 'professor' ou 'personal' 
    // para testar as diferentes telas do seu Dashboard!
    const mockUser = {
      nome: 'Usuário Teste',
      email: email,
      ocupacao: 'professor' // <-- Mude isso aqui para testar os perfis!
    };

    setUser(mockUser);
    setLoading(false);
    return { success: true };
  };

  /**
   * Função de Registro Simulada.
   * Aprova automaticamente qualquer tentativa de cadastro.
   */
  const register = async (dadosUsuario) => {
    setLoading(true);
    setError('');
    
    // Simula a latência de rede
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    return { success: true };
  };

  /**
   * Função para limpar mensagens de erro da interface.
   */
  const clearError = () => {
    setError('');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loading, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);