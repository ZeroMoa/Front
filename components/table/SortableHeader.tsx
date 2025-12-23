import type { ReactNode } from 'react'
import clsx from 'clsx'
import { getTableSortSymbol, type TableSortDirection } from '@/constants/tableSortConstants'
import styles from './SortableHeader.module.css'

type SortableHeaderProps = {
  label: ReactNode
  direction?: TableSortDirection
  className?: string
  hideIndicator?: boolean
}

export default function SortableHeader({
  label,
  direction = null,
  className,
  hideIndicator = false,
}: SortableHeaderProps) {
  const symbol = getTableSortSymbol(direction)
  const isActive = direction === 'asc' || direction === 'desc'

  return (
    <span className={clsx(styles.sortHeader, className)}>
      <span className={styles.label}>{label}</span>
      {!hideIndicator && (
        <span className={clsx(styles.indicator, isActive && styles.indicatorActive)} aria-hidden="true">
          {symbol}
        </span>
      )}
    </span>
  )
}

