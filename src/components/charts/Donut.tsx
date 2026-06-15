import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useChartTheme, tooltipStyle } from './theme'

export interface DonutDatum {
  name: string
  value: number
}

interface DonutProps {
  data: DonutDatum[]
  colors?: string[]
}

export function Donut({ data, colors }: DonutProps) {
  const t = useChartTheme()
  const palette = colors ?? [t.volt, t.viz1, t.info, t.viz2]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} innerRadius="58%" outerRadius="82%" paddingAngle={4} dataKey="value" stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle(t)} />
        <Legend wrapperStyle={{ fontSize: 12, color: t.text }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
