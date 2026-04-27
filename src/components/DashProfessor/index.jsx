import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
// Importação de ícones para compor a interface de navegação docente.
import { FiHome, FiUsers, FiLayers, FiClipboard, FiTrendingUp, FiZap, FiCalendar, FiUser, FiChevronRight } from "react-icons/fi";
import './style.css';

/**
 * Componente DashProfessor.
 * Renderiza a interface administrativa para o perfil docente.
 * Implementa controle de estado para navegação ativa e inclusão da seção 'Início'.
 */
function DashProfessor() {
  const { user } = useAuth();
  
  /**
   * Estado interno para gerenciamento da aba de navegação ativa.
   * Inicializado com a categoria 'inicio'.
   */
  const [secaoAtiva, setSecaoAtiva] = useState('inicio');

  const turmasRecentes = [
    { id: 1, nome: 'Turma_A_Manhã' },
    { id: 2, nome: 'Turma_B_Noite' },
    { id: 3, nome: 'Turma_C_Sáb_Intensivo' },
    { id: 4, nome: 'Turma_D_Verão' },
    { id: 5, nome: 'Turma_E_EAD_Módulo_1' },
  ];

  return (
    <div className="dash-professor-container">
      <header className="prof-header">
        <nav className="prof-nav">
          {/* Seção Início - Navegação ativa com efeito visual de destaque */}
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
            className={`nav-item ${secaoAtiva === 'turmas' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('turmas')}
          >
            <FiLayers className="nav-icon" />
            <span className="nav-text">Turmas</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'teste' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('teste')}
          >
            <FiClipboard className="nav-icon" />
            <span className="nav-text">Teste</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'insights' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('insights')}
          >
            <FiTrendingUp className="nav-icon" />
            <span className="nav-text">Insights</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'treinos' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('treinos')}
          >
            <FiZap className="nav-icon" />
            <span className="nav-text">Treinos</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'agenda' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('agenda')}
          >
            <FiCalendar className="nav-icon" />
            <span className="nav-text">Agenda</span>
          </button>
        </nav>
        
        <div className="prof-avatar-container">
          <FiUser className="prof-avatar-icon" />
        </div>
      </header>

      <main className="prof-main">
        <h1 className="section-title">Turmas Recentes</h1>

        <div className="classes-panel">
          {turmasRecentes.map(turma => (
            <div key={turma.id} className="class-row">
              <span className="class-name">{turma.nome}</span>
              <FiChevronRight className="class-arrow" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default DashProfessor;