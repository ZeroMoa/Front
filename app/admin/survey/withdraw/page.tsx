'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './page.module.css'
import Pagination from '@/components/pagination/Pagination'
import SortableHeader from '@/components/table/SortableHeader'
import { useWithdrawSurveys } from '@/app/admin/hooks/withdrawSurveyHooks'
import {
  buildWithdrawSurveyParams,
  formatDateParts,
  normalizeReasonCode,
  sortReasonCodes,
} from '@/lib/utils/surveyUtils'
import type { SortKey, WithdrawSurvey } from '@/types/withdrawSurveyTypes'
import {
  COLUMN_HEADERS,
  DEFAULT_SORT_DIRECTION,
  DEFAULT_SORT_FIELD,
  PAGE_SIZE_OPTIONS,
  PIE_COLORS,
  PRIORITY_REASON_LABELS,
  REASON_LABEL_MAP,
} from '@/constants/withdrawSurveyConstants'
import CircularProgress from '@mui/material/CircularProgress'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { fetchWithdrawSurveys } from '@/app/admin/store/api/withdrawSurveyApi'
import 'dayjs/locale/ko'
import { useRouter } from 'next/navigation'

dayjs.locale('ko')
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

type SortDirection = 'asc' | 'desc'

type PieSegment = {
  code: string
  label: string
  count: number
  color: string
  start: number
  end: number
  percent: number
}

type DayjsInstance = ReturnType<typeof dayjs>

const buildOrderedReasonList = (counter: Map<string, number>) => {
  const priorityCounts = PRIORITY_REASON_LABELS.map(({ code, label }) => ({
    code,
    label,
    count: counter.get(code) ?? 0,
  })).filter((item) => item.count > 0)

  const prioritySet = new Set<string>(PRIORITY_REASON_LABELS.map((item) => item.code))
  const remainingCounts = Array.from(counter.entries())
    .filter(([code]) => !prioritySet.has(code))
    .map(([code, count]) => ({
      code,
      label: REASON_LABEL_MAP[code] ?? code,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  return [...priorityCounts, ...remainingCounts]
}

const toDateInputValue = (value?: string | null) => {
  if (!value) return undefined
  const [datePart] = value.split('T')
  if (datePart && datePart.length === 10) {
    return datePart
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }
  return parsed.toISOString().slice(0, 10)
}

const DETAIL_CACHE_KEY = 'withdrawSurveyDetailCache'

const cacheSurveyDetail = (survey: WithdrawSurvey) => {
  if (typeof window === 'undefined') return
  try {
    const raw = window.sessionStorage.getItem(DETAIL_CACHE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, WithdrawSurvey>) : {}
    parsed[String(survey.id)] = survey
    window.sessionStorage.setItem(DETAIL_CACHE_KEY, JSON.stringify(parsed))
  } catch (error) {
    console.warn('설문조사 상세 캐시 저장 실패', error)
  }
}

export default function WithdrawSurveyPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [sortField, setSortField] = useState<SortKey | null>(DEFAULT_SORT_FIELD)
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_SORT_DIRECTION)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [usernameFilter, setUsernameFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // 커스텀 드롭다운 상태
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false)
  const pageSizeRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(event.target as Node)) {
        setShowPageSizeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const [globalReasonCounts, setGlobalReasonCounts] = useState<Array<{ code: string; label: string; count: number }>>([])
  const [globalEarliestDate, setGlobalEarliestDate] = useState<string | null>(null)

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

  const filterSignature = useMemo(
    () =>
      JSON.stringify({
        reasons: [...selectedReasons].sort(),
        username: usernameFilter.trim(),
        from: fromDate,
        to: toDate,
      }),
    [fromDate, selectedReasons, toDate, usernameFilter]
  )

  const { data, isLoading, isError, error } = useWithdrawSurveys(params)
  const statistics = data?.statistics
  const effectiveEarliest = globalEarliestDate ?? statistics?.earliestCreatedDate ?? null
  const earliestSurveyDate = toDateInputValue(effectiveEarliest)
  const earliestDay = useMemo(() => {
    if (!earliestSurveyDate) return null
    const parsed = dayjs(earliestSurveyDate)
    return parsed.isValid() ? parsed.startOf('day') : null
  }, [earliestSurveyDate])
  const todayDay = useMemo(() => dayjs().startOf('day'), [])
  const fromDateValue = useMemo(() => {
    if (!fromDate) return null
    const parsed = dayjs(fromDate)
    return parsed.isValid() ? parsed.startOf('day') : null
  }, [fromDate])
  const toDateValue = useMemo(() => {
    if (!toDate) return null
    const parsed = dayjs(toDate)
    return parsed.isValid() ? parsed.startOf('day') : null
  }, [toDate])

  const handlePageChange = (nextPage: number) => {
    setPage(Math.max(nextPage - 1, 0))
  }

  const handleSortChange = (field: SortKey) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setPage(0)
  }

  const handleFromDatePickerChange = (value: DayjsInstance | null) => {
    const nextFrom = value && value.isValid() ? value.startOf('day').format('YYYY-MM-DD') : ''
    setFromDate(nextFrom)
    if (toDate && nextFrom) {
      const nextFromDay = dayjs(nextFrom)
      const currentTo = dayjs(toDate)
      if (currentTo.isBefore(nextFromDay)) {
        setToDate(nextFrom)
      }
    }
    setPage(0)
  }

  const handleToDatePickerChange = (value: DayjsInstance | null) => {
    const nextTo = value && value.isValid() ? value.startOf('day').format('YYYY-MM-DD') : ''
    if (fromDate && nextTo) {
      const nextToDay = dayjs(nextTo)
      const currentFrom = dayjs(fromDate)
      if (nextToDay.isBefore(currentFrom)) {
        setFromDate(nextTo)
      }
    }
    setToDate(nextTo)
    setPage(0)
  }

  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0
  const surveys = data?.content ?? []
  const filteredSurveys = useMemo(() => {
    return surveys.filter((survey) => {
      if (selectedReasons.length > 0) {
        const normalizedCodes = sortReasonCodes(survey.reasonCodes ?? [])
        const hasAllReasons = selectedReasons.every((code) => normalizedCodes.includes(code))
        if (!hasAllReasons) {
          return false
        }
      }

      if (usernameFilter.trim()) {
        const keyword = usernameFilter.trim().toLowerCase()
        const username = (survey.username ?? '').toLowerCase()
        const userId = String(survey.userId ?? '')
        if (!username.includes(keyword) && !userId.includes(keyword)) {
          return false
        }
      }

      if (fromDate) {
        const fromBoundary = dayjs(fromDate).startOf('day')
        if (!fromBoundary.isValid()) {
          return false
        }
        if (!dayjs(survey.createdDate).isSameOrAfter(fromBoundary)) {
          return false
        }
      }

      if (toDate) {
        const toBoundary = dayjs(toDate).endOf('day')
        if (!toBoundary.isValid()) {
          return false
        }
        if (!dayjs(survey.createdDate).isSameOrBefore(toBoundary)) {
          return false
        }
      }

      return true
    })
  }, [fromDate, surveys, selectedReasons, toDate, usernameFilter])

  useEffect(() => {
    let cancelled = false

    if (statistics?.reasonCounts && statistics.reasonCounts.length > 0) {
      const map = new Map<string, number>()
      statistics.reasonCounts.forEach(({ code, count }) => {
        const normalized = normalizeReasonCode(code)
        if (!normalized) return
        map.set(normalized, (map.get(normalized) ?? 0) + count)
      })
      if (!cancelled) {
        setGlobalReasonCounts(buildOrderedReasonList(map))
        const nextEarliest = statistics.earliestCreatedDate ?? null
        if (nextEarliest) {
          setGlobalEarliestDate((prev) => {
            if (!prev) return nextEarliest
            return nextEarliest < prev ? nextEarliest : prev
          })
        }
      }
      return
    }

    const loadAllPages = async () => {
      const aggregated = new Map<string, number>()
      let earliest: string | null = null
      let pageIndex = 0
      let lastPage = 0

      const baseParams = buildWithdrawSurveyParams({
        page: 0,
        size: Math.max(size, 50),
        sort: sortParam,
        reasonCodes: selectedReasons,
        username: usernameFilter.trim() || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      })

      do {
        const loopParams = new URLSearchParams(baseParams.toString())
        loopParams.set('page', String(pageIndex))
        try {
          const pageData = await fetchWithdrawSurveys(loopParams)
          pageData.content.forEach((survey) => {
            const codes = Array.isArray(survey.reasonCodes) ? survey.reasonCodes : []
            codes.forEach((code) => {
              const normalized = normalizeReasonCode(code)
              if (!normalized) return
              aggregated.set(normalized, (aggregated.get(normalized) ?? 0) + 1)
            })
            if (survey.createdDate) {
              const created = survey.createdDate
              if (!earliest || created < earliest) {
                earliest = created
              }
            }
          })
          if (pageData.statistics?.earliestCreatedDate) {
            const statEarliest = pageData.statistics.earliestCreatedDate
            if (!earliest || statEarliest < earliest) {
              earliest = statEarliest
            }
          }
          lastPage = pageData.totalPages ?? 0
          pageIndex += 1
        } catch (fetchError) {
          console.error('탈퇴 설문 통계 조회 실패:', fetchError)
          break
        }
      } while (pageIndex < lastPage)

      if (!cancelled) {
        setGlobalReasonCounts(aggregated.size > 0 ? buildOrderedReasonList(aggregated) : [])
        if (earliest) {
          setGlobalEarliestDate((prev) => {
            if (!prev) return earliest
            return earliest < prev ? earliest : prev
          })
        }
      }
    }

    setGlobalReasonCounts([])
    loadAllPages()

    return () => {
      cancelled = true
    }
  }, [
    filterSignature,
    selectedReasons,
    size,
    sortParam,
    statistics?.earliestCreatedDate,
    statistics?.reasonCounts,
    fromDate,
    toDate,
    usernameFilter,
  ])

  const reasonCounts = useMemo(() => {
    if (globalReasonCounts.length > 0) {
      return globalReasonCounts
    }

    if (statistics?.reasonCounts && statistics.reasonCounts.length > 0) {
      const aggregated = new Map<string, number>()
      statistics.reasonCounts.forEach(({ code, count }) => {
        const normalized = normalizeReasonCode(code)
        if (!normalized) return
        const numericCount = Number(count) || 0
        aggregated.set(normalized, (aggregated.get(normalized) ?? 0) + numericCount)
      })
      if (aggregated.size > 0) {
        return buildOrderedReasonList(aggregated)
      }
    }

    const fallbackCounter = new Map<string, number>()
    filteredSurveys.forEach((survey) => {
      const codes = Array.isArray(survey.reasonCodes) ? survey.reasonCodes : []
      codes.forEach((code) => {
        const normalized = normalizeReasonCode(code)
        if (!normalized) return
        fallbackCounter.set(normalized, (fallbackCounter.get(normalized) ?? 0) + 1)
      })
    })

    return buildOrderedReasonList(fallbackCounter)
  }, [filteredSurveys, globalReasonCounts, statistics?.reasonCounts])

  const isGlobalChart =
    globalReasonCounts.length > 0 || Boolean(statistics?.reasonCounts && statistics.reasonCounts.length > 0)

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
    setSortField(DEFAULT_SORT_FIELD)
    setSortDirection(DEFAULT_SORT_DIRECTION)
    setPage(0)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>탈퇴 설문 조사</h1>
          <span className={styles.totalCount}>총 {totalElements.toLocaleString()}건</span>
        </div>
      </div>

      <div className={styles.controlsRow}>
        
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

      {viewMode === 'table' && (
        <div className={styles.filterPanel}>
          <div className={styles.filterPanelHeader}>
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
            <DatePicker
              value={fromDateValue}
              onChange={handleFromDatePickerChange}
              format="YYYY-MM-DD"
              minDate={earliestDay ?? undefined}
              maxDate={toDateValue ?? todayDay}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  placeholder: 'YYYY-MM-DD',
                  sx: {
                    width: '220px',
                    maxWidth: '100%',
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(248, 250, 255, 0.96)',
                      minHeight: '42px',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(153, 176, 214, 0.7)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(79, 124, 255, 0.6)',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(79, 124, 255, 0.7)',
                    },
                    '& .MuiInputBase-input': {
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      fontSize: '14px',
                      color: '#2f3f69',
                      textAlign: 'justify',
                    },
                  },
                },
              }}
            />
          </label>
          <label className={styles.filterField}>
            <span>종료일</span>
            <DatePicker
              value={toDateValue}
              onChange={handleToDatePickerChange}
              format="YYYY-MM-DD"
              minDate={fromDateValue ?? earliestDay ?? undefined}
              maxDate={todayDay}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  placeholder: 'YYYY-MM-DD',
                  sx: {
                    width: '220px',
                    maxWidth: '100%',
                    '& .MuiInputBase-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(248, 250, 255, 0.96)',
                      minHeight: '42px',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(153, 176, 214, 0.7)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(79, 124, 255, 0.6)',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(79, 124, 255, 0.7)',
                    },
                    '& .MuiInputBase-input': {
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      fontSize: '14px',
                      color: '#2f3f69',
                      textAlign: 'justify',
                    },
                  },
                },
              }}
            />
          </label>

          <div className={styles.controlsGroup}>
            <div className={styles.pageSizeControl}>
              페이지 크기
              <div 
                ref={pageSizeRef}
                className={`${styles.boxSelect} ${showPageSizeDropdown ? styles.on : ''}`}
              >
                <button 
                  type="button" 
                  className={styles.selectDisplayField}
                  onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}
                >
                  {size}명씩 보기
                </button>
                <div className={styles.selectArrowContainer} onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}>
                  <span className={styles.selectArrowIcon}></span>
                </div>
                <div className={styles.boxLayer}>
                  <ul className={styles.listOptions}>
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <li key={option} className={styles.listItem}>
                        <button
                          type="button"
                          className={`${styles.buttonOption} ${option === size ? styles.buttonOptionSelected : ''}`}
                          onClick={() => {
                            setSize(Number(option))
                            setPage(0)
                            setShowPageSizeDropdown(false)
                          }}
                        >
                          {option}명씩 보기
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleResetFilters}
            >
              필터 초기화
            </button>
          </div>
        </div>
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingState}>
          <CircularProgress size={32} />
          <span>설문 데이터를 불러오는 중입니다…</span>
        </div>
      )}
      {isError && !isLoading && (
        <div className={styles.errorState}>{error instanceof Error ? error.message : '알림을 불러오지 못했습니다.'}</div>
      )}

      {!isLoading && !isError && filteredSurveys.length === 0 && (
        <div className={styles.emptyState}>설문 결과가 없습니다.</div>
      )}

      {!isLoading && !isError && filteredSurveys.length > 0 && viewMode === 'table' && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                {COLUMN_HEADERS.map((column) => {
                  const { key, label } = column
                  const width = 'width' in column ? column.width : undefined
                  const sortable = 'sortable' in column && Boolean(column.sortable)
                  return (
                    <th key={key} style={width ? { width } : undefined}>
                      {sortable ? (
                        <button
                          type="button"
                          className={styles.headerButton}
                          onClick={() => handleSortChange(column.key as SortKey)}
                        >
                          <SortableHeader
                            label={label}
                            direction={sortField === (column.key as SortKey) ? sortDirection : null}
                          />
                        </button>
                      ) : (
                        <span className={styles.headerLabel}>{label}</span>
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {filteredSurveys.map((survey) => (
                <tr
                  key={survey.id}
                  className={styles.tableRow}
                  onClick={() => {
                    cacheSurveyDetail(survey)
                    router.push(`/admin/survey/withdraw/${survey.id}`)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      cacheSurveyDetail(survey)
                      router.push(`/admin/survey/withdraw/${survey.id}`)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <td className={styles.tableCell}>{survey.displayIndex ?? '—'}</td>
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
                          <span className={styles.dateLine}>{formatDateParts(survey.createdDate)!.dateLine}</span>
                          <span className={styles.timeLine}>{formatDateParts(survey.createdDate)!.timeLine}</span>
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

      {!isLoading && !isError && filteredSurveys.length > 0 && viewMode === 'chart' && (
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>이유 코드 분포 ({isGlobalChart ? '전체' : '현재 페이지'})</div>
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

      {!isLoading && !isError && totalPages > 1 && viewMode === 'table' && (
        <div className={styles.paginationWrapper}>
          <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
      </div>
    </LocalizationProvider>
  )
}

