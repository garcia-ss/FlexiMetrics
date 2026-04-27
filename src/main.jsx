// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter, Routes, Route } from 'react-router-dom' 
// import './index.css'
// import Home from './pages/Home'
// import Cadastro from './pages/Cadastro' 

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
        
//         <Route path="/cadastro" element={<Cadastro />} />
//       </Routes>
//     </BrowserRouter>
//   </StrictMode>,
// )

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom' // Importação dos componentes de roteamento.
import { AuthProvider } from './hooks/useAuth' // Importação do provedor de contexto de autenticação.

import './index.css'
import Home from './pages/Home'
import Cadastro from './pages/Cadastro' 
import Dashboard from './pages/Dashboard' // Importação do componente principal do painel de controle (Dashboard).

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* O AuthProvider envolve a árvore de rotas para fornecer o estado de autenticação globalmente. */}
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Definição da rota raiz (página inicial de login). */}
          <Route path="/" element={<Home />} />
          
          {/* Definição da rota para a tela de registro de novos usuários. */}
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Definição da rota do painel de controle após a autenticação bem-sucedida. */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)