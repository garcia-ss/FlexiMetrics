import { useEffect, useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import { Badge, Button, Input, Modal, Select } from '@/components/ui'
import type { Aluno, AlunoInput, Genero, RegistroMetricas, Turma } from '@/domain/types'
import { METRICAS, calcImc, calcRce, classificarImc } from '@/domain/metrics'
import { fmtNum } from '@/lib/format'

interface AlunoFormModalProps {
  open: boolean
  aluno?: Aluno | null
  turmas: Turma[]
  onClose: () => void
  onSubmit: (input: AlunoInput) => Promise<void>
}

const emptyMetricas: RegistroMetricas = {
  flexibilidade: 20,
  potMMII: 145,
  potMS: 5,
  velocidade: 7.2,
  agilidade: 12,
  abdominal: 30,
  resistencia: 2500,
}

function defaultInput(aluno?: Aluno | null): AlunoInput {
  if (aluno) {
    return {
      nome: aluno.nome,
      genero: aluno.genero,
      dataNascimento: aluno.dataNascimento,
      turmaId: aluno.turmaId,
      peso: aluno.peso,
      altura: aluno.altura,
      cintura: aluno.cintura,
      metricas: { ...aluno.metricas },
    }
  }

  return {
    nome: '',
    genero: 'masculino',
    dataNascimento: '2010-01-01',
    turmaId: null,
    peso: 70,
    altura: 1.7,
    cintura: 0.78,
    metricas: { ...emptyMetricas },
  }
}

function validate(input: AlunoInput): string | null {
  if (!input.nome.trim()) return 'Informe o nome do aluno.'
  if (!input.dataNascimento) return 'Informe a data de nascimento.'
  if (input.peso <= 0 || input.altura <= 0 || input.cintura <= 0) {
    return 'Peso, altura e cintura precisam ser maiores que zero.'
  }
  if (Object.values(input.metricas).some((value) => !Number.isFinite(value) || value <= 0)) {
    return 'Todas as métricas físicas precisam ser maiores que zero.'
  }
  return null
}

export function AlunoFormModal({ open, aluno, turmas, onClose, onSubmit }: AlunoFormModalProps) {
  const [input, setInput] = useState<AlunoInput>(() => defaultInput(aluno))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setInput(defaultInput(aluno))
    setError(null)
    setSaving(false)
  }, [aluno, open])

  const preview = useMemo(() => {
    const imc = calcImc(input.peso, input.altura)
    const rce = calcRce(input.cintura, input.altura)
    return { imc, rce, cls: classificarImc(imc) }
  }, [input.altura, input.cintura, input.peso])

  const setField = <K extends keyof AlunoInput>(key: K, value: AlunoInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }))
  }

  const setMetric = (key: keyof RegistroMetricas, value: number) => {
    setInput((current) => ({
      ...current,
      metricas: { ...current.metricas, [key]: value },
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validation = validate(input)
    if (validation) {
      setError(validation)
      return
    }

    setSaving(true)
    try {
      await onSubmit({ ...input, nome: input.nome.trim() })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nao foi possivel salvar o aluno.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={aluno ? 'Editar aluno' : 'Novo aluno'}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="aluno-form" loading={saving}>
            Salvar aluno
          </Button>
        </>
      }
    >
      <form id="aluno-form" className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-[var(--radius-md)] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Nome" value={input.nome} onChange={(e) => setField('nome', e.target.value)} />
          <Select
            label="Genero"
            value={input.genero}
            options={[
              { value: 'masculino', label: 'Masculino' },
              { value: 'feminino', label: 'Feminino' },
              { value: 'outro', label: 'Outro' },
            ]}
            onChange={(e) => setField('genero', e.target.value as Genero)}
          />
          <Input
            type="date"
            label="Data de nascimento"
            value={input.dataNascimento}
            onChange={(e) => setField('dataNascimento', e.target.value)}
          />
          <Select
            label="Turma"
            placeholder="Sem turma"
            value={input.turmaId ?? ''}
            options={turmas.map((t) => ({ value: t.id, label: t.nome }))}
            onChange={(e) => setField('turmaId', e.target.value || null)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            type="number"
            min="1"
            step="0.1"
            label="Peso (kg)"
            value={input.peso}
            onChange={(e) => setField('peso', Number(e.target.value))}
          />
          <Input
            type="number"
            min="0.5"
            step="0.01"
            label="Altura (m)"
            value={input.altura}
            onChange={(e) => setField('altura', Number(e.target.value))}
          />
          <Input
            type="number"
            min="0.2"
            step="0.01"
            label="Cintura (m)"
            value={input.cintura}
            onChange={(e) => setField('cintura', Number(e.target.value))}
          />
        </div>

        <div className="rounded-[var(--radius-lg)] border border-line bg-canvas/40 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Activity className="h-5 w-5 text-volt" />
            <p className="text-sm font-semibold text-ink">Previa calculada</p>
            <Badge tone={preview.cls.tone}>{preview.cls.label}</Badge>
            <span className="text-sm text-muted">
              IMC {fmtNum(preview.imc)} · RCE {fmtNum(preview.rce, 2)}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {METRICAS.map((metric) => (
              <Input
                key={metric.key}
                type="number"
                min="0"
                step="0.1"
                label={`${metric.label} (${metric.unit})`}
                value={input.metricas[metric.key]}
                onChange={(e) => setMetric(metric.key, Number(e.target.value))}
              />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
