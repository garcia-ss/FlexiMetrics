import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { Card, CardHeader, Dropdown, DropdownItem } from '@/components/ui'
import { ChevronDown } from 'lucide-react'
import { METRICAS, METRICA_BY_KEY } from '@/domain/metrics'
import type { Aluno, MetricaKey } from '@/domain/types'
import { rankByMetric } from './kpis'
import { fmtNum } from '@/lib/format'

const medal = (i: number) =>
  i === 0
    ? 'bg-[#f5c518] text-black'
    : i === 1
      ? 'bg-[#c2cad6] text-black'
      : i === 2
        ? 'bg-[#cd7f32] text-white'
        : 'bg-elevated text-muted'

export function RankingPanel({ alunos, limit = 10 }: { alunos: Aluno[]; limit?: number }) {
  const [metric, setMetric] = useState<MetricaKey>('abdominal')
  const navigate = useNavigate()
  const def = METRICA_BY_KEY[metric]
  const ranked = useMemo(() => rankByMetric(alunos, metric, limit), [alunos, metric, limit])

  return (
    <Card>
      <CardHeader
        icon={<Trophy className="h-5 w-5 text-[#f5c518]" />}
        title={<h3 className="text-base font-semibold text-ink">Ranking · {def.label}</h3>}
        action={
          <Dropdown
            align="right"
            trigger={({ toggle }) => (
              <button
                onClick={toggle}
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-volt px-3 py-1.5 text-sm font-medium text-volt-ink cursor-pointer"
              >
                {def.label}
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
          >
            {(close) => (
              <>
                {METRICAS.map((m) => (
                  <DropdownItem
                    key={m.key}
                    active={m.key === metric}
                    onClick={() => {
                      setMetric(m.key)
                      close()
                    }}
                  >
                    {m.label}
                  </DropdownItem>
                ))}
              </>
            )}
          </Dropdown>
        }
      />
      <div className="grid grid-cols-1 gap-2 p-5 pt-0 lg:grid-cols-2">
        {ranked.map((a, i) => (
          <motion.button
            key={a.id}
            whileHover={{ x: 4 }}
            onClick={() => navigate(`/app/alunos/${a.id}`)}
            className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line bg-canvas/40 p-3 text-left hover:border-volt/40 cursor-pointer"
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${medal(i)}`}>
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{a.nome}</span>
              <span className="block text-xs text-subtle">{a.idade} anos</span>
            </span>
            <span className="text-right">
              <span className="tabular block text-lg font-bold leading-none text-volt">{fmtNum(a.metricas[metric], 0)}</span>
              <span className="text-[10px] uppercase text-subtle">{def.unit}</span>
            </span>
          </motion.button>
        ))}
        {ranked.length === 0 && <p className="col-span-full py-8 text-center text-sm text-subtle">Sem dados para exibir.</p>}
      </div>
    </Card>
  )
}
