import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
// Importação de ícones para a composição da interface de gestão do Personal Trainer.
import { FiHome, FiUsers, FiClipboard, FiZap, FiCalendar, FiUser, FiChevronRight } from "react-icons/fi";
import './style.css';

/**
 * Componente DashPersonal.
 * Projeta a interface administrativa para o perfil de Personal Trainer.
 * Implementa lógica de estado para navegação ativa e inclusão da seção 'Início'.
 */
function DashPersonal() {
  const { user } = useAuth();
  
  /**
   * Estado interno para gerenciamento da aba de navegação ativa.
   * Valor padrão definido como 'inicio' para o carregamento inicial.
   */
  const [secaoAtiva, setSecaoAtiva] = useState('inicio');

  const alunosRecentes = [
    { id: 1, nome: 'Aluno_X_Consultoria' },
    { id: 2, nome: 'Aluno_Y_Presencial' },
    { id: 3, nome: 'Aluno_Z_Reabilitação' },
    { id: 4, nome: 'Aluno_W_Performance' },
    { id: 5, nome: 'Aluno_K_Iniciante' },
  ];

  return (
    <div className="dash-personal-container">
      {/* Cabeçalho de Navegação com Efeito de Extrusão Sutil */}
      <header className="per-header">
        <nav className="per-nav">
          <button 
            className={`nav-item ${secaoAtiva === 'inicio' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('inicio')}
          >
            <FiHome className="nav-icon" />
            <span className="nav-text">Início</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'alunos' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('alunos')}
          >
            <FiUsers className="nav-icon" />
            <span className="nav-text">Alunos</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'teste' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('teste')}
          >
            <FiClipboard className="nav-icon" />
            <span className="nav-text">Teste</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'treino' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('treino')}
          >
            <FiZap className="nav-icon" />
            <span className="nav-text">Treino</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'agenda' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('agenda')}
          >
            <FiCalendar className="nav-icon" />
            <span className="nav-text">Agenda</span>
          </button>
        </nav>
        
        <div className="per-avatar-container">
          <FiUser className="per-avatar-icon" />
        </div>
      </header>

      <main className="per-main">
        <h1 className="per-section-title">Alunos Recentes</h1>

        <div className="per-list-panel">
          {alunosRecentes.map(aluno => (
            <div key={aluno.id} className="per-list-row">
              <span className="per-aluno-name">{aluno.nome}</span>
              <FiChevronRight className="per-list-arrow" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default DashPersonal;