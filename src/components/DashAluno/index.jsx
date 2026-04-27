import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
// Importação de ícones para a composição da barra de navegação.
import { FiHome, FiLayers, FiClipboard, FiZap, FiTrendingUp, FiUser, FiChevronRight } from "react-icons/fi";
import './style.css';

/**
 * Componente DashAluno.
 * Interface de acompanhamento para o perfil 'Aluno'.
 * Implementa lógica de estado para navegação ativa com suporte a efeitos visuais de profundidade.
 */
function DashAluno() {
  const { user } = useAuth();
  
  /**
   * Estado interno para controle da seção ativa no menu de navegação.
   * Valor inicial definido como 'inicio'.
   */
  const [secaoAtiva, setSecaoAtiva] = useState('inicio');

  const treinosRecentes = [
    { id: 1, nome: 'Treino_A_Superiores' },
    { id: 2, nome: 'Treino_B_Inferiores' },
    { id: 3, nome: 'Treino_C_Cardio_Hiit' },
    { id: 4, nome: 'Treino_D_Core_Estabilidade' },
    { id: 5, nome: 'Treino_E_Funcional_Mobilidade' },
  ];

  return (
    <div className="dash-aluno-container">
      <header className="alu-header">
        <nav className="alu-nav">
          <button 
            className={`nav-item ${secaoAtiva === 'início' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('início')}
          >
            <FiHome className="nav-icon" />
            <span className="nav-text">início</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'turmas' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('turmas')}
          >
            <FiLayers className="nav-icon" />
            <span className="nav-text">turmas</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'teste' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('teste')}
          >
            <FiClipboard className="nav-icon" />
            <span className="nav-text">teste</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'treino' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('treino')}
          >
            <FiZap className="nav-icon" />
            <span className="nav-text">treino</span>
          </button>

          <button 
            className={`nav-item ${secaoAtiva === 'evolucao' ? 'active' : ''}`}
            onClick={() => setSecaoAtiva('evolucao')}
          >
            <FiTrendingUp className="nav-icon" />
            <span className="nav-text">evolução</span>
          </button>
        </nav>
        
        <div className="alu-avatar-container">
          <FiUser className="alu-avatar-icon" />
        </div>
      </header>

      <main className="alu-main">
        <h1 className="alu-section-title">Últimos Treinos</h1>

        <div className="alu-list-panel">
          {treinosRecentes.map(treino => (
            <div key={treino.id} className="alu-list-row">
              <span className="alu-item-name">{treino.nome}</span>
              <FiChevronRight className="alu-item-arrow" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default DashAluno;