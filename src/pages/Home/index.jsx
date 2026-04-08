import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './style.css'

function Home() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <div className="background-bars">
        <span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span>
      </div>
    
      <div className='container'>
        <form className='form' onSubmit={handleSubmit}>
          <h1 className='title'>Login</h1>

          {error && (
            <div className='error-message'>{error}</div>
          )}

          <input
            type="email"
            name="email"
            placeholder='Email'
            className='input'
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder='Senha'
            className='input'
            value={formData.password}
            onChange={handleChange}
          />
          <button type='submit' className='button' disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className='links'>
          <p>Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link></p>
          <p>Esqueceu sua senha? <a href="/forgot-password">Clique aqui</a></p>
        </div>
      </div>
    </>
  )
}

export default Home
