'use client'

import clsx from 'clsx'
import styles from './Pagination.module.css'

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageGroupSize?: number
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageGroupSize = 5,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const safePageGroupSize = Math.max(pageGroupSize, 1)
  const currentGroup = Math.floor(currentPage / safePageGroupSize)
  const startPage = currentGroup * safePageGroupSize
  const endPage = Math.min(totalPages - 1, startPage + safePageGroupSize - 1)

  const pages: number[] = []
  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page)
  }

  const goToPage = (page: number) => {
    if (page < 0 || page >= totalPages || page === currentPage) {
      return
    }
    onPageChange(page)
  }

  return (
    <nav className={clsx(styles.pagination, className)} aria-label="페이지네이션">
      <button
        type="button"
        className={clsx(styles.pageArrow, styles.firstArrow)}
        onClick={() => goToPage(0)}
        disabled={currentPage === 0}
      >
        <span className={styles.visuallyHidden}>첫 페이지</span>
      </button>
      <button
        type="button"
        className={clsx(styles.pageArrow, styles.prevArrow)}
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 0}
      >
        <span className={styles.visuallyHidden}>이전 페이지</span>
      </button>
      <div className={styles.pageNumberGroup}>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={clsx(styles.pageButton, page === currentPage && styles.pageButtonActive)}
            onClick={() => goToPage(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page + 1}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={clsx(styles.pageArrow, styles.nextArrow)}
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        <span className={styles.visuallyHidden}>다음 페이지</span>
      </button>
      <button
        type="button"
        className={clsx(styles.pageArrow, styles.lastArrow)}
        onClick={() => goToPage(totalPages - 1)}
        disabled={currentPage >= totalPages - 1}
      >
        <span className={styles.visuallyHidden}>마지막 페이지</span>
      </button>
    </nav>
  )
}
