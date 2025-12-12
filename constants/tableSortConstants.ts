export const TABLE_SORT_SYMBOLS = {
  neutral: '↕',
  asc: '▲',
  desc: '▼',
} as const

export type TableSortDirection = 'asc' | 'desc' | null | undefined

export function getTableSortSymbol(direction: TableSortDirection) {
  if (direction === 'asc') {
    return TABLE_SORT_SYMBOLS.asc
  }
  if (direction === 'desc') {
    return TABLE_SORT_SYMBOLS.desc
  }
  return TABLE_SORT_SYMBOLS.neutral
}

