import { supabase } from '../lib/supabase';

/**
 * Cadastra um novo usuário
 * @param {import('../types/auth').SignUpData} data
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export const signUp = async (data) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('professor')
        .insert({
          id: authData.user.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone || null,
          data_nascimento: data.data_nascimento || null,
          genero: data.genero || null,
          ocupacao: data.ocupacao,
          escola: data.escola || null
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
      }
    }

    return { user: authData.user, error: null };
  } catch (error) {
    console.error('Erro no signup:', error);
    return { user: null, error };
  }
};

/**
 * Realiza login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { user: data?.user || null, error };
};

/**
 * Realiza logout
 * @returns {Promise<{error: Error|null}>}
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Obtém usuário atual
 * @returns {Promise<{user: Object|null, session: Object|null}>}
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user || null, session: data?.session || null, error };
};

/**
 * Escuta mudanças na autenticação
 * @param {Function} callback
 * @returns {Function} - Função para remover listener
 */
export const onAuthStateChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => data.subscription.unsubscribe();
};

/**
 * Insere perfil na tabela correta baseado na ocupação
 * @param {string} userId
 * @param {import('../types/auth').SignUpData} data
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const createUserProfile = async (userId, data) => {
  const tableMap = {
    personal: 'personal',
    professor: 'professor',
    aluno: 'aluno'
  };

  const table = tableMap[data.ocupacao];

  if (!table) {
    return { success: false, error: new Error('Ocupação inválida') };
  }

  const profileData = {
    id: userId,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone || null,
    data_nascimento: data.data_nascimento || null,
    genero: data.genero || null,
    ...(data.escola && { escola: data.escola })
  };

  const { error } = await supabase.from(table).insert(profileData);

  return { success: !error, error };
};
