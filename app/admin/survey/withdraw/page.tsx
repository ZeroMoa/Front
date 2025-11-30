
'use client'

import { useCallback, useMemo, useState } from 'react'
import styles from './page.module.css'
import Pagination from '@/components/pagination/Pagination'
import { useWithdrawSurveys } from '@/app/admin/hooks/withdrawSurveyHooks'
import {
  buildWithdrawSurveyParams,
  formatDateParts,
  normalizeReasonCode,
  sortReasonCodes,
} from '@/lib/utils/surveyUtils'
import type { SortKey } from '@/types/withdrawSurveyTypes'
import {
  COLUMN_HEADERS,
  PAGE_SIZE_OPTIONS,
  PIE_COLORS,
  PRIORITY_REASON_LABELS,
  REASON_LABEL_MAP,
} from '@/constants/withdrawSurveyConstants'

export default function WithdrawSurveyPage() {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [sortField, setSortField] = useState<SortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [usernameFilter, setUsernameFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const sortParam =
    sortField && sortDirection ? `${sortField},${sortDirection}` : undefined

  const params = useMemo(
    () =>
      buildWithdrawSurveyParams({
        page,
        size,
        sort: sortParam,
        reasonCodes: selectedReasons,
        username: usernameFilter.trim() || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      }),
    [fromDate, page, selectedReasons, size, sortParam, toDate, usernameFilter]
  )

  const { data, isLoading, isError, error } = useWithdrawSurveys(params)

  const handlePageChange = (nextPage: number) => {
    setPage(Math.max(nextPage - 1, 0))
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSize(Number(event.target.value))
    setPage(0)
  }

  const handleSortChange = (field: SortKey) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else {
        setSortField(null)
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection(field === 'id' ? 'desc' : 'asc')
    }
    setPage(0)
  }

  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0
  const surveys = data?.content ?? []

  const reasonCounts = useMemo(() => {
    const counter = new Map<string, number>()
    surveys.forEach((survey) => {
      const codes = Array.isArray(survey.reasonCodes) ? survey.reasonCodes : []
      codes.forEach((code) => {
        const normalized = normalizeReasonCode(code)
        if (!normalized) return
        counter.set(normalized, (counter.get(normalized) ?? 0) + 1)
      })
    })
    const priorityCounts = PRIORITY_REASON_LABELS.map(({ code, label }) => ({
      code,
      label,
      count: counter.get(code) ?? 0,
    })).filter((item) => item.count > 0)

    const remainingCounts = Array.from(counter.entries())
      .filter(([code]) => !new Set(PRIORITY_REASON_LABELS.map((item) => item.code)).has(code))
      .map(([code, count]) => ({
        code,
        label: REASON_LABEL_MAP[code] ?? code,
        count,
      }))
      .sort((a, b) => b.count - a.count)

    return [...priorityCounts, ...remainingCounts]
  }, [surveys])

  const pieSegments = useMemo<PieSegment[]>(() => {
    const total = reasonCounts.reduce((sum, item) => sum + item.count, 0)
    if (total === 0) {
      return []
    }

    let cumulative = 0
    return reasonCounts.map((item, index) => {
      const percent = total > 0 ? (item.count / total) * 100 : 0
      const start = cumulative
      cumulative += percent
      return {
        ...item,
        color: PIE_COLORS[index % PIE_COLORS.length],
        start,
        end: cumulative,
        percent,
      }
    })
  }, [reasonCounts])

  const pieGradient = useMemo(() => {
    if (pieSegments.length === 0) {
      return ''
    }
    return pieSegments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(', ')
  }, [pieSegments])

  const handleViewToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setViewMode(event.target.checked ? 'chart' : 'table')
  }

  const handleReasonToggle = (code: string) => {
    setSelectedReasons((prev) => {
      if (prev.includes(code)) {
        return prev.filter((item) => item !== code)
      }
      return sortReasonCodes([...prev, code])
    })
    setPage(0)
  }

  const handleResetFilters = () => {
    setSelectedReasons([])
    setUsernameFilter('')
    setFromDate('')
    setToDate('')
    setSortField(null)
    setSortDirection('asc')
    setPage(0)
  }

  const hasSort = sortField !== null
  const isFiltered =
    selectedReasons.length > 0 || usernameFilter.trim() || fromDate || toDate || hasSort

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>탈퇴 설문 조사를 확인하세요</h1>
          <span className={styles.totalCount}>총 {totalElements.toLocaleString()}건</span>
        </div>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.pageSizeControl}>
          페이지 크기
          <select className={styles.pageSizeSelect} value={size} onChange={handlePageSizeChange}>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}개씩 보기
              </option>
            ))}
          </select>
        </div>
        <label className={styles.toggleSwitch}>
          <input
            type="checkbox"
            checked={viewMode === 'chart'}
            onChange={handleViewToggleChange}
            aria-label={viewMode === 'chart' ? '표 보기로 전환' : '그래프 보기로 전환'}
          />
          <span
            className={styles.toggleTrack}
            data-on-label="그래프"
            data-off-label="표"
            aria-hidden="true"
          >
            <span className={styles.toggleHandle} />
          </span>
        </label>
      </div>

      <div className={styles.filterPanel}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>이유 코드</span>
          <div className={styles.reasonChips}>
            {PRIORITY_REASON_LABELS.map(({ code, label }) => {
              const active = selectedReasons.includes(code)
              return (
                <button
                  key={code}
                  type="button"
                  className={`${styles.reasonChip} ${active ? styles.reasonChipActive : ''}`}
                  onClick={() => handleReasonToggle(code)}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
        <div className={styles.filterRow}>
          <label className={styles.filterField}>
            <span>사용자명</span>
            <input
              type="text"
              value={usernameFilter}
              onChange={(event) => {
                setUsernameFilter(event.target.value)
                setPage(0)
              }}
              placeholder="사용자명 또는 ID"
            />
          </label>
          <label className={styles.filterField}>
            <span>시작일</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value)
                setPage(0)
              }}
              max={toDate || undefined}
            />
          </label>
          <label className={styles.filterField}>
            <span>종료일</span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value)
                setPage(0)
              }}
              min={fromDate || undefined}
            />
          </label>
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleResetFilters}
            disabled={!isFiltered}
          >
            필터 초기화
          </button>
        </div>
      </div>

      {isLoading && <div className={styles.loadingState}>설문 데이터를 불러오는 중입니다…</div>}
      {isError && !isLoading && (
        <div className={styles.errorState}>{error instanceof Error ? error.message : '알림을 불러오지 못했습니다.'}</div>
      )}

      {!isLoading && !isError && surveys.length === 0 && (
        <div className={styles.emptyState}>설문 결과가 없습니다.</div>
      )}

      {!isLoading && !isError && surveys.length > 0 && viewMode === 'table' && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                {COLUMN_HEADERS.map(({ key, label, width }) => {
                  const sortable = key === 'id' || key === 'createdDate' || key === 'updatedDate'
                  return (
                    <th key={key} style={width ? { width } : undefined}>
                      {sortable ? (
                        <button
                          type="button"
                          className={styles.headerButton}
                          onClick={() => handleSortChange(key as SortKey)}
                        >
                          <span>{label}</span>
                          <span className={styles.sortSymbol}>
                            {sortField === key ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                          </span>
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {surveys.map((survey) => (
                <tr key={survey.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{survey.id}</td>
                  <td className={styles.tableCell}>
                    <div>
                      <strong>{survey.username || '—'}</strong>
                    </div>
                    <div className={styles.helperText}>ID: {survey.userId || '—'}</div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.reasonList}>
                      {survey.reasonCodes.length > 0
                        ? sortReasonCodes(survey.reasonCodes).map((code) => (
                            <span key={`${survey.id}-${code}`} className={styles.reasonBadge}>
                              {REASON_LABEL_MAP[code] ?? code}
                            </span>
                          ))
                        : '—'}
                    </div>
                  </td>
                  <td className={`${styles.tableCell} ${styles.commentCell}`}>{survey.reasonComment || '—'}</td>
                  <td className={styles.tableCell}>
                    <div className={styles.dateCell}>
                      {formatDateParts(survey.createdDate) ? (
                        <>
                          <span>{formatDateParts(survey.createdDate)!.dateLine}</span>
                          <span>{formatDateParts(survey.createdDate)!.timeLine}</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError && surveys.length > 0 && viewMode === 'chart' && (
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>이유 코드 분포 (현재 페이지)</div>
          {pieSegments.length === 0 ? (
            <div className={styles.emptyState}>그래프로 표시할 설문 이유가 없습니다.</div>
          ) : (
            <div className={styles.chartContent}>
              <div
                className={styles.chartPie}
                style={pieGradient ? { backgroundImage: `conic-gradient(${pieGradient})` } : undefined}
                aria-hidden="true"
              >
                {!pieGradient && <span className={styles.chartPieEmpty}>데이터 없음</span>}
              </div>
              <ul className={styles.chartLegend}>
                {pieSegments.map((segment) => (
                  <li key={segment.code} className={styles.legendItem}>
                    <span className={styles.legendColor} style={{ backgroundColor: segment.color }} />
                    <span className={styles.legendLabel}>{segment.label}</span>
                    <span className={styles.legendCount}>{segment.count.toLocaleString()}건</span>
                    <span className={styles.legendPercent}>{segment.percent.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!isLoading && !isError && totalPages > 1 && (
        <div className={styles.paginationWrapper}>
          <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}

