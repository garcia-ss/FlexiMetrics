import { Link } from 'react-router-dom'
import './style.css'

function Home() {

  return (

    <>


    <div className="background-bars">

      <span></span><span></span><span></span><span></span>
      <span></span><span></span><span></span><span></span>
      <span></span><span></span><span></span><span></span>
      
    </div>
    
    <div className='container'>

      <form className='form'>
        <h1 className='title'>Login</h1>
        <input type="text" placeholder='Usuário' className='input' />
        <input type="password" placeholder='Senha' className='input' />
        <button type='submit' className='button'>Entrar</button>
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
