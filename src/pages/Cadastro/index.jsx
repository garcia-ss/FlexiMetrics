import { Link } from 'react-router-dom';
import './style.css';

function Cadastro() {
  return (
    <>
      <div className="cadastro-container">
        <h1>Crie sua conta</h1>
        <form>
          <input type="text" placeholder="Nome completo" />
          <input type="email" placeholder="Seu melhor e-mail" />
          <input type="tel" placeholder="Telefone" />
          <input type="password" placeholder="Crie uma senha" />
          <input type="password" placeholder="Confirme sua senha" />

          <h4>Data de Nascimento</h4>
          <input type="date" />

          <div className="RadioButtons">
            <h4>Ocupação</h4>
            <label>
              <input type="radio" name="ocupação" value="personal" />
              Personal Trainer
            </label>
            <label>
              <input type="radio" name="ocupação" value="professor" />
              Professor
            </label>
            <label>
              <input type="radio" name="ocupação" value="aluno" />
              Aluno
            </label>

            <h4>Gênero</h4>
            <label>
              <input type="radio" name="gender" value="masculino" />
              Masculino
            </label>
            <label>
              <input type="radio" name="gender" value="feminino" />
              Feminino
            </label>
            <label>
              <input type="radio" name="gender" value="outro" />
              Outro
            </label>
          </div>

          <button type="button">Finalizar Cadastro</button>
        </form>

        <p>
          Já é cadastrado? <Link to="/">Voltar para o Login</Link>
        </p>
      </div>
    </>
  );
}

export default Cadastro;