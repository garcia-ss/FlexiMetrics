import { useUiStore } from '@/stores/uiStore'

export interface ChartTheme {
  volt: string
  info: string
  viz1: string
  viz2: string
  grid: string
  axis: string
  text: string
  tooltipBg: string
  tooltipBorder: string
}

const DARK: ChartTheme = {
  volt: '#c8ff3d',
  info: '#4ea8ff',
  viz1: '#3a4759',
  viz2: '#56657c',
  grid: '#1f2937',
  axis: '#6b7686',
  text: '#e8edf2',
  tooltipBg: '#11161e',
  tooltipBorder: '#1f2937',
}

const LIGHT: ChartTheme = {
  volt: '#3f7d00',
  info: '#2563eb',
  viz1: '#94a3b8',
  viz2: '#64748b',
  grid: '#e2e8f0',
  axis: '#8a97ad',
  text: '#0f1722',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
}

export function useChartTheme(): ChartTheme {
  const theme = useUiStore((s) => s.theme)
  return theme === 'dark' ? DARK : LIGHT
}

export function tooltipStyle(t: ChartTheme) {
  return {
    backgroundColor: t.tooltipBg,
    border: `1px solid ${t.tooltipBorder}`,
    borderRadius: 10,
    color: t.text,
    fontSize: 12,
  }
}
