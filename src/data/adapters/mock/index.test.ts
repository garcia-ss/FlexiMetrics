import { beforeEach, describe, expect, it } from 'vitest'
import type { AlunoInput } from '@/domain/types'
import { mockDataSource } from './index'
import { resetDb } from './store'

const baseAluno: AlunoInput = {
  nome: 'Aluno Teste',
  genero: 'masculino',
  dataNascimento: '2010-01-15',
  turmaId: null,
  peso: 70,
  altura: 1.75,
  cintura: 0.78,
  metricas: {
    flexibilidade: 22,
    potMMII: 154,
    potMS: 5.4,
    velocidade: 7.1,
    agilidade: 11.8,
    abdominal: 32,
    resistencia: 2600,
  },
}

describe('mockDataSource.alunos', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetDb()
  })

  it('keeps the in-memory store usable after create, update and remove', async () => {
    const created = await mockDataSource.alunos.create(baseAluno)

    expect(await mockDataSource.alunos.get(created.id)).toMatchObject({
      id: created.id,
      nome: 'Aluno Teste',
      classificacaoImc: 'Normal',
    })

    const updated = await mockDataSource.alunos.update(created.id, {
      ...baseAluno,
      nome: 'Aluno Atualizado',
      peso: 82,
    })

    expect(updated.nome).toBe('Aluno Atualizado')
    expect(updated.imc).toBe(26.8)

    await mockDataSource.alunos.remove(created.id)

    expect(await mockDataSource.alunos.get(created.id)).toBeNull()
  })
})
