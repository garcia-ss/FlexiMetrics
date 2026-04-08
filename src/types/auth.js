/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} nome
 * @property {string} [telefone]
 * @property {string} [data_nascimento]
 * @property {string} [genero]
 * @property {string} ocupacao
 * @property {string} [escola]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user
 * @property {boolean} loading
 * @property {string|null} error
 * @property {boolean} isAuthenticated
 */

/**
 * @typedef {Object} SignUpData
 * @property {string} email
 * @property {string} password
 * @property {string} nome
 * @property {string} [telefone]
 * @property {string} [data_nascimento]
 * @property {string} [genero]
 * @property {string} ocupacao
 * @property {string} [escola]
 */

export const OCUPACAO = {
  PERSONAL: 'personal',
  PROFESSOR: 'professor',
  ALUNO: 'aluno'
};

export const GENERO = {
  MASCULINO: 'masculino',
  FEMININO: 'feminino',
  OUTRO: 'outro'
};
