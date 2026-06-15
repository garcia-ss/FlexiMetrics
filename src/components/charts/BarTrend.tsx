import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useChartTheme, tooltipStyle } from './theme'

export interface BarDatum {
  label: string
  value: number
}

interface BarTrendProps {
  data: BarDatum[]
  horizontal?: boolean
  highlightMax?: boolean
}

export function BarTrend({ data, horizontal, highlightMax }: BarTrendProps) {
  const t = useChartTheme()
  const max = Math.max(...data.map((d) => d.value), 0)

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={t.grid} />
          <XAxis type="number" hide />
          <YAxis dataKey="label" type="category" width={110} axisLine={false} tickLine={false} tick={{ fill: t.axis, fontSize: 12 }} />
          <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle(t)} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
            {data.map((d, i) => (
              <Cell key={i} fill={highlightMax && d.value === max ? t.volt : t.viz1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: t.axis, fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: t.axis, fontSize: 11 }} />
        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle(t)} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
          {data.map((d, i) => (
            <Cell key={i} fill={highlightMax && d.value === max ? t.volt : t.viz1} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
