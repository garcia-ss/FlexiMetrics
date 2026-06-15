import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { useChartTheme, tooltipStyle } from './theme'

export interface RadarDatum {
  subject: string
  [serie: string]: string | number
}

interface RadarCompareProps {
  data: RadarDatum[]
  series: { key: string; label: string }[]
}

export function RadarCompare({ data, series }: RadarCompareProps) {
  const t = useChartTheme()
  const colors = [t.volt, t.viz2]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
        <PolarGrid stroke={t.grid} />
        <PolarAngleAxis dataKey="subject" tick={{ fill: t.axis, fontSize: 11 }} />
        {series.map((s, i) => (
          <Radar
            key={s.key}
            name={s.label}
            dataKey={s.key}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={0.35}
          />
        ))}
        <Legend wrapperStyle={{ fontSize: 12, color: t.text }} />
        <Tooltip contentStyle={tooltipStyle(t)} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
