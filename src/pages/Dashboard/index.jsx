import React from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Importação dos componentes de interface específicos para cada perfil de usuário.
 * Estes componentes residem no diretório de componentes para garantir a modularidade do sistema.
 */
import DashAluno from '../../components/DashAluno';
import DashProfessor from '../../components/DashProfessor';
import DashPersonal from '../../components/DashPersonal';

import './style.css';

/**
 * Componente principal da rota de Dashboard.
 * Responsável por gerenciar a renderização condicional dos painéis administrativos
 * com base no atributo 'ocupacao' extraído do contexto de autenticação.
 */
function Dashboard() {
  const { user, loading } = useAuth();

  /**
   * Validação do estado de carregamento dos dados.
   * Garante que a interface não tente renderizar informações de um usuário inexistente durante a recuperação do estado.
   */
  if (loading) {
    return (
      <div className="dashboard-container">
        <p>Carregando informações do sistema...</p>
      </div>
    );
  }

  /**
   * Lógica de renderização condicional baseada no perfil do usuário.
   * Utiliza-se a estrutura 'switch' para mapear as ocupações definidas ('aluno', 'professor', 'personal')
   * aos seus respectivos componentes visuais.
   */
  switch (user?.ocupacao) {
    case 'aluno':
      return <DashAluno />;
    case 'professor':
      return <DashProfessor />;
    case 'personal':
      return <DashPersonal />;
    default:
      /**
       * Tratamento de contingência para casos onde a ocupação não é identificada
       * ou ocorre uma inconsistência nos dados de autenticação.
       */
      return (
        <div className="dashboard-container">
          <h1 className="title">Acesso Restrito</h1>
          <p>Não foi possível identificar seu nível de acesso. Por favor, realize o login novamente ou contate o suporte.</p>
        </div>
      );
  }
}

export default Dashboard;