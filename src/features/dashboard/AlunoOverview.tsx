import { useMemo, useState } from 'react'
import { Activity, Ruler, Gauge, ChevronDown } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import {
  Card,
  CardHeader,
  StatCard,
  MiniStat,
  Badge,
  Skeleton,
  ErrorState,
  EmptyState,
  Dropdown,
  DropdownItem,
} from '@/components/ui'
import { LineEvolution } from '@/components/charts'
import { METRICAS, METRICA_BY_KEY, classificarImc } from '@/domain/metrics'
import type { MetricaKey } from '@/domain/types'
import { data } from '@/data'
import { useAsync } from '@/hooks/useAsync'
import { useAuthStore } from '@/stores/authStore'
import { fmtNum, fmtMonthShort } from '@/lib/format'

export function AlunoOverview() {
  const user = useAuthStore((s) => s.user)
  const alunoId = user?.alunoId ?? null
  const [metric, setMetric] = useState<MetricaKey | 'imc'>('imc')

  const { data: result, loading, error, reload } = useAsync(async () => {
    if (!alunoId) return null
    const [aluno, evolution] = await Promise.all([
      data.alunos.get(alunoId),
      data.alunos.evolution(alunoId),
    ])
    return { aluno, evolution }
  }, [alunoId])

  const evoData = useMemo(() => {
    if (!result?.evolution) return []
    return result.evolution.map((p) => ({
      label: fmtMonthShort(p.mesReferencia, p.anoReferencia),
      valor: metric === 'imc' ? p.imc : p.metricas[metric],
    }))
  }, [result, metric])

  const evoLabel = metric === 'imc' ? 'IMC' : METRICA_BY_KEY[metric].label

  return (
    <>
      <Topbar title="Minha evolução" subtitle={user ? user.nome : undefined} />
      <div className="space-y-6 p-4 sm:p-6">
        {error ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : !result?.aluno ? (
          <Card>
            <EmptyState
              icon={<Activity className="h-7 w-7" />}
              title="Sem dados vinculados"
              description="Seu perfil ainda não está associado a um registro de aluno."
            />
          </Card>
        ) : (
          (() => {
            const aluno = result.aluno
            const cls = classificarImc(aluno.imc)
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <StatCard
                    label="IMC atual"
                    value={fmtNum(aluno.imc)}
                    icon={<Activity className="h-5 w-5" />}
                    accent
                    subtitle="kg/m²"
                  />
                  <StatCard label="RCE" value={fmtNum(aluno.rce, 2)} icon={<Gauge className="h-5 w-5" />} subtitle="cintura/altura" />
                  <Card className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted">Classificação</p>
                      <div className="mt-2">
                        <Badge tone={cls.tone}>{cls.label}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-subtle">{aluno.idade} anos · {fmtNum(aluno.altura, 2)} m</p>
                    </div>
                    <Ruler className="h-10 w-10 text-volt/40" />
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                  {METRICAS.map((m) => (
                    <MiniStat key={m.key} label={m.short} value={fmtNum(aluno.metricas[m.key], 1)} unit={m.unit} />
                  ))}
                </div>

                <Card>
                  <CardHeader
                    title={`Evolução · ${evoLabel}`}
                    action={
                      <Dropdown
                        align="right"
                        trigger={({ toggle }) => (
                          <button
                            onClick={toggle}
                            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-line px-3 py-1.5 text-sm text-ink hover:bg-elevated cursor-pointer"
                          >
                            {evoLabel}
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        )}
                      >
                        {(close) => (
                          <>
                            <DropdownItem active={metric === 'imc'} onClick={() => { setMetric('imc'); close() }}>
                              IMC
                            </DropdownItem>
                            {METRICAS.map((m) => (
                              <DropdownItem key={m.key} active={metric === m.key} onClick={() => { setMetric(m.key); close() }}>
                                {m.label}
                              </DropdownItem>
                            ))}
                          </>
                        )}
                      </Dropdown>
                    }
                  />
                  <div className="h-80 px-5 pb-5">
                    {evoData.length > 1 ? (
                      <LineEvolution data={evoData} xKey="label" series={[{ key: 'valor', label: evoLabel }]} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-subtle">
                        Ainda não há avaliações suficientes para mostrar sua evolução.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )
          })()
        )}
      </div>
    </>
  )
}
