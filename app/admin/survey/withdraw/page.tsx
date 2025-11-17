
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './page.module.css'
import { fetchWithAuth } from '@/lib/api/fetchWithAuth'
import Pagination from '@/components/pagination/Pagination'

type SortKey = 'id' | 'createdDate' | 'updatedDate'
type SortDirection = 'asc' | 'desc'

type WithdrawSurvey = {
  id: number
  userId: number
  username: string
  reasonCodes: string[]
  reasonComment: string | null
  createdDate: string
  updatedDate: string
}

type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]
const COLUMN_HEADERS: Array<{ key: keyof WithdrawSurvey | 'reasons' | 'comment'; label: string; width?: string }> = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'username', label: '회원명 / ID', width: '160px' },
  { key: 'reasons', label: '이유 코드' },
  { key: 'comment', label: '추가 의견', width: '260px' },
  { key: 'createdDate', label: '작성일', width: '170px' }
]

const REASON_LABEL_MAP: Record<string, string> = {
  TOO_COSTLY: '가격이 비쌈',
  POOR_TASTE: '맛이 별로임',
  NOT_EFFECTIVE: '효과가 적음',
  NOT_ENOUGH_INFO: '정보가 적음',
  FEW_FEATURES: '사이트 기능이 적음',
  INACCURATE_INFO: '정보가 정확하지 않음',
  LOW_VISIT_FREQUENCY: '방문 빈도가 낮음',
}

const REASON_OPTIONS = Object.entries(REASON_LABEL_MAP).map(([code, label]) => ({
  code,
  label,
}))

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function normalizeSurvey(raw: any): WithdrawSurvey {
  const reasonCodes: string[] = Array.isArray(raw.reasonCodes)
    ? raw.reasonCodes
    : typeof raw.reasonCodes === 'string'
    ? raw.reasonCodes.split(',').map((item: string) => item.trim())
    : []

  return {
    id: Number(raw.id ?? raw.withdrawSurveyId ?? 0),
    userId: Number(raw.userId ?? raw.user_id ?? 0),
    username: raw.username ?? raw.userName ?? `user-${raw.userId ?? '—'}`,
    reasonCodes,
    reasonComment: raw.reasonComment ?? raw.reason_comment ?? null,
    createdDate: raw.createdDate ?? raw.created_date ?? '',
    updatedDate: raw.updatedDate ?? raw.updated_date ?? '',
  }
}

const PIE_COLORS = ['#5A7BFF', '#7F53FF', '#58D3FF', '#FF8F6B', '#FFCD6B', '#8DD38C', '#A081FF', '#FF6FAE']

type PieSegment = {
  code: string
  label: string
  count: number
  color: string
  start: number
  end: number
  percent: number
}

export default function WithdrawSurveyPage() {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [sortField, setSortField] = useState<SortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<PageResponse<WithdrawSurvey> | null>(null)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [usernameFilter, setUsernameFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const fetchSurveys = useCallback(async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('size', size.toString())
    if (sortField) {
      params.set('sort', `${sortField},${sortDirection}`)
    }
    if (selectedReasons.length > 0) {
      params.set('reasonCodes', selectedReasons.join(','))
    }
    if (usernameFilter.trim()) {
      params.set('username', usernameFilter.trim())
    }
    if (fromDate) {
      params.set('from', `${fromDate}T00:00:00`)
    }
    if (toDate) {
      params.set('to', `${toDate}T23:59:59`)
    }

    try {
      const response = await fetchWithAuth(`/survey/withdraw?${params.toString()}`)
      const json = await response.json()
      const pageResponse: PageResponse<WithdrawSurvey> = {
        content: Array.isArray(json.content) ? json.content.map(normalizeSurvey) : [],
        totalElements: typeof json.totalElements === 'number' ? json.totalElements : 0,
        totalPages: typeof json.totalPages === 'number' ? json.totalPages : 0,
        number: typeof json.number === 'number' ? json.number : page,
        size: typeof json.size === 'number' ? json.size : size,
      }
      setData(pageResponse)
    } catch (requestError) {
      console.error('Failed to fetch withdraw surveys', requestError)
      setError(requestError instanceof Error ? requestError.message : '데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [fromDate, page, selectedReasons, size, sortDirection, sortField, toDate, usernameFilter])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
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
      survey.reasonCodes.forEach((code) => {
        const normalized = code.trim()
        if (!normalized) return
        counter.set(normalized, (counter.get(normalized) ?? 0) + 1)
      })
    })
    return Array.from(counter.entries())
      .map(([code, count]) => ({
        code,
        label: REASON_LABEL_MAP[code] ?? code,
        count,
      }))
      .sort((a, b) => b.count - a.count)
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
      return [...prev, code]
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
            {REASON_OPTIONS.map(({ code, label }) => {
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

      {loading && <div className={styles.loadingState}>설문 데이터를 불러오는 중입니다…</div>}
      {error && !loading && <div className={styles.errorState}>{error}</div>}

      {!loading && !error && surveys.length === 0 && (
        <div className={styles.emptyState}>설문 결과가 없습니다.</div>
      )}

      {!loading && !error && surveys.length > 0 && viewMode === 'table' && (
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
                        ? survey.reasonCodes.map((code) => (
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
                      <span>{formatDateTime(survey.createdDate)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && surveys.length > 0 && viewMode === 'chart' && (
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

      {!loading && !error && totalPages > 1 && (
        <div className={styles.paginationWrapper}>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}

