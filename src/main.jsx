import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom' // A gata importa o poder das rotas
import './index.css'
import Home from './pages/Home'
import Cadastro from './pages/Cadastro' // Não esquece de criar essa pasta e o index.jsx lá!

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Aqui a Home vira a rota principal */}
        <Route path="/" element={<Home />} />
        
        {/* aqui define o caminho para a nova tela */}
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)