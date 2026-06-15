/** Format a number with pt-BR separators. */
export function fmtNum(value: number, decimals = 1): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/** Format an ISO date (YYYY-MM-DD) as DD/MM/YYYY. */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

/** Short month + year, e.g. "Mar/26". */
export function fmtMonthShort(mes: string, ano: number): string {
  return `${mes.slice(0, 3)}/${String(ano).slice(2)}`
}
