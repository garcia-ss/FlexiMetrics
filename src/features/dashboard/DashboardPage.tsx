import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Activity, CalendarDays, ClipboardList, ChevronDown } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import {
  Card,
  CardHeader,
  StatCard,
  MiniStat,
  Skeleton,
  ErrorState,
  EmptyState,
  Dropdown,
  DropdownItem,
} from '@/components/ui'
import { Donut, RadarCompare, BarTrend, LineEvolution } from '@/components/charts'
import { METRICAS, METRICA_BY_KEY } from '@/domain/metrics'
import type { AlunoFilters, MetricaKey } from '@/domain/types'
import { useAuthStore } from '@/stores/authStore'
import { fmtNum } from '@/lib/format'
import { useDashboardData } from './useDashboardData'
import { FiltersBar } from './FiltersBar'
import { RankingPanel } from './RankingPanel'

function ChartCard({ title, children, height = 'h-72' }: { title: string; children: React.ReactNode; height?: string }) {
  return (
    <Card>
      <CardHeader title={title} />
      <div className={`px-5 pb-5 ${height}`}>{children}</div>
    </Card>
  )
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [filters, setFilters] = useState<AlunoFilters>({})
  const [evoMetric, setEvoMetric] = useState<MetricaKey | 'imc'>('imc')
  const { loading, error, reload, alunos, turmas, kpis, avaliacoesCount, evolutionFor } = useDashboardData(filters)

  const evoData = useMemo(
    () => evolutionFor(evoMetric).map((d) => ({ label: d.label, valor: d.value })),
    [evolutionFor, evoMetric],
  )
  const imcBars = useMemo(() => kpis.imcData.map((d) => ({ label: d.name, value: d.value })), [kpis.imcData])
  const evoLabel = evoMetric === 'imc' ? 'IMC' : METRICA_BY_KEY[evoMetric].label

  return (
    <>
      <Topbar title="Visão geral" subtitle={user ? `Olá, ${user.nome.split(' ')[0]}` : undefined} />

      <div className="space-y-6 p-4 sm:p-6">
        <FiltersBar filters={filters} turmas={turmas} onChange={setFilters} />

        {error ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : loading ? (
          <DashboardSkeleton />
        ) : kpis.total === 0 ? (
          <Card>
            <EmptyState
              icon={<Users className="h-7 w-7" />}
              title="Nenhum aluno encontrado"
              description="Ajuste os filtros ou cadastre novos alunos para ver as métricas."
            />
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Alunos" value={kpis.total} icon={<Users className="h-5 w-5" />} accent subtitle="No recorte atual" />
              <StatCard label="Idade média" value={fmtNum(kpis.mediaIdade)} icon={<CalendarDays className="h-5 w-5" />} subtitle="anos" />
              <StatCard label="IMC médio" value={fmtNum(kpis.mediaImc)} icon={<Activity className="h-5 w-5" />} subtitle="kg/m²" />
              <StatCard label="Avaliações" value={avaliacoesCount} icon={<ClipboardList className="h-5 w-5" />} subtitle="registradas" />
            </div>

            {/* Metric mini stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {METRICAS.map((m) => (
                <MiniStat key={m.key} label={m.short} value={fmtNum(kpis.mediaMetricas[m.key], 1)} unit={m.unit} />
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard title="Distribuição por gênero">
                <Donut data={kpis.genderData} />
              </ChartCard>
              <ChartCard title="Métricas por gênero (índice)">
                <RadarCompare data={kpis.radar} series={[{ key: 'masculino', label: 'Masculino' }, { key: 'feminino', label: 'Feminino' }]} />
              </ChartCard>
              <ChartCard title="Classificação de IMC">
                <BarTrend data={imcBars} horizontal highlightMax />
              </ChartCard>
              <Card>
                <CardHeader
                  title={`Evolução média · ${evoLabel}`}
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
                          <DropdownItem active={evoMetric === 'imc'} onClick={() => { setEvoMetric('imc'); close() }}>
                            IMC
                          </DropdownItem>
                          {METRICAS.map((m) => (
                            <DropdownItem key={m.key} active={evoMetric === m.key} onClick={() => { setEvoMetric(m.key); close() }}>
                              {m.label}
                            </DropdownItem>
                          ))}
                        </>
                      )}
                    </Dropdown>
                  }
                />
                <div className="h-72 px-5 pb-5">
                  {evoData.length > 1 ? (
                    <LineEvolution data={evoData} xKey="label" series={[{ key: 'valor', label: evoLabel }]} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-subtle">
                      Dados insuficientes para a curva de evolução.
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <RankingPanel alunos={alunos} />
          </motion.div>
        )}
      </div>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
    </div>
  )
}
