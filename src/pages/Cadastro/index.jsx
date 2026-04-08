import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './style.css';

function Cadastro() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    data_nascimento: '',
    ocupacao: '',
    genero: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};

    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem';
    }

    if (!formData.ocupacao) {
      errors.ocupacao = 'Selecione sua ocupação';
    }

    if (!formData.genero) {
      errors.genero = 'Selecione seu gênero';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validate()) return;

    const result = await register({
      nome: formData.nome,
      email: formData.email,
      password: formData.password,
      telefone: formData.telefone || null,
      data_nascimento: formData.data_nascimento || null,
      ocupacao: formData.ocupacao,
      genero: formData.genero
    });

    if (result.success) {
      setSuccessMessage('Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.');
      setTimeout(() => navigate('/'), 3000);
    }
  };

  return (
    <div className="cadastro-container">
      <h1>Crie sua conta</h1>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          value={formData.nome}
          onChange={handleChange}
        />
        {validationErrors.nome && (
          <span className="field-error">{validationErrors.nome}</span>
        )}

        <input
          type="email"
          name="email"
          placeholder="Seu melhor e-mail"
          value={formData.email}
          onChange={handleChange}
        />
        {validationErrors.email && (
          <span className="field-error">{validationErrors.email}</span>
        )}

        <input
          type="tel"
          name="telefone"
          placeholder="Telefone"
          value={formData.telefone}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Crie uma senha"
          value={formData.password}
          onChange={handleChange}
        />
        {validationErrors.password && (
          <span className="field-error">{validationErrors.password}</span>
        )}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirme sua senha"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {validationErrors.confirmPassword && (
          <span className="field-error">{validationErrors.confirmPassword}</span>
        )}

        <h4>Data de Nascimento</h4>
        <input
          type="date"
          name="data_nascimento"
          value={formData.data_nascimento}
          onChange={handleChange}
        />

        <div className="RadioButtons">
          <h4>Ocupação</h4>
          {validationErrors.ocupacao && (
            <span className="field-error">{validationErrors.ocupacao}</span>
          )}
          <label>
            <input
              type="radio"
              name="ocupacao"
              value="personal"
              checked={formData.ocupacao === 'personal'}
              onChange={handleChange}
            />
            Personal Trainer
          </label>
          <label>
            <input
              type="radio"
              name="ocupacao"
              value="professor"
              checked={formData.ocupacao === 'professor'}
              onChange={handleChange}
            />
            Professor
          </label>
          <label>
            <input
              type="radio"
              name="ocupacao"
              value="aluno"
              checked={formData.ocupacao === 'aluno'}
              onChange={handleChange}
            />
            Aluno
          </label>

          <h4>Gênero</h4>
          {validationErrors.genero && (
            <span className="field-error">{validationErrors.genero}</span>
          )}
          <label>
            <input
              type="radio"
              name="genero"
              value="masculino"
              checked={formData.genero === 'masculino'}
              onChange={handleChange}
            />
            Masculino
          </label>
          <label>
            <input
              type="radio"
              name="genero"
              value="feminino"
              checked={formData.genero === 'feminino'}
              onChange={handleChange}
            />
            Feminino
          </label>
          <label>
            <input
              type="radio"
              name="genero"
              value="outro"
              checked={formData.genero === 'outro'}
              onChange={handleChange}
            />
            Outro
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
        </button>
      </form>

      <p>
        Já é cadastrado? <Link to="/">Voltar para o Login</Link>
      </p>
    </div>
  );
}

export default Cadastro;
