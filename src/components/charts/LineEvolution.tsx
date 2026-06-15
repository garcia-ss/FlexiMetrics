import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useChartTheme, tooltipStyle } from './theme'

export interface SeriesDef {
  key: string
  label: string
  color?: string
}

interface LineEvolutionProps {
  data: Array<Record<string, string | number>>
  xKey: string
  series: SeriesDef[]
}

export function LineEvolution({ data, xKey, series }: LineEvolutionProps) {
  const t = useChartTheme()
  const palette = [t.volt, t.info, t.viz2]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: t.axis, fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: t.axis, fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle(t)} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: t.text }} />}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? palette[i % palette.length]}
            strokeWidth={2.5}
            dot={{ r: 3, fill: s.color ?? palette[i % palette.length] }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
