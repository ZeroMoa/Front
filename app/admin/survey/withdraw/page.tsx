
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import AdminProductGrid from '@/app/admin/products/AdminProductGrid'
import styles from './page.module.css'
import AdminSummaryCard from '@/components/AdminSummaryCard'
import AdminPagination from '@/components/AdminPagination'
import { fetchWithAuth } from '@/lib/common/api/fetchWithAuth'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
)

interface WithdrawSurvey {
  id: number
  userId: number
  username: string
  reasonCodes: string[]
  reasonComment: string | null
  createdDate: string
  updatedDate: string
}

interface Pageable {
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  offset: number
  pageNumber: number
  pageSize: number
  paged: boolean
  unpaged: boolean
}

interface WithdrawSurveyResponse {
  content: WithdrawSurvey[]
  pageable: Pageable
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

interface FilterState {
  reasonCodes: string[]
  username: string
  from: string
  to: string
}

type SortKey = 'id' | 'username' | 'createdDate' | 'updatedDate' | null
type SortOrder = 'asc' | 'desc' | null

interface SortState {
  key: SortKey
  order: SortOrder
}

const PRIORITY_REASON_LABELS: Array<{ code: string; label: string }> = [
  { code: 'NOT_ENOUGH_INFO', label: '정보가 적음' },
  { code: 'INACCURATE_INFO', label: '정보가 정확하지 않음' },
  { code: 'FEW_FEATURES', label: '사이트의 기능이 적음' },
  { code: 'LOW_VISIT_FREQUENCY', label: '방문 빈도가 낮음' },
]

const REASON_LABEL_MAP: Record<string, string> = {
  ...PRIORITY_REASON_LABELS.reduce((acc, { code, label }) => ({ ...acc, [code]: label }), {}),
  TOO_COSTLY: '가격이 비쌈',
  POOR_TASTE: '맛이 별로임',
  NOT_EFFECTIVE: '효과가 적음',
}

const REASON_LABEL_ORDER = [
  ...PRIORITY_REASON_LABELS,
  { code: 'TOO_COSTLY', label: '가격이 비쌈' },
  { code: 'POOR_TASTE', label: '맛이 별로임' },
  { code: 'NOT_EFFECTIVE', label: '효과가 적음' },
]

function sortReasonCodes(codes: string[]): string[] {
  const orderMap = new Map(REASON_LABEL_ORDER.map((item, index) => [item.code, index]))
  return [...codes].sort((a, b) => (orderMap.get(a) ?? Infinity) - (orderMap.get(b) ?? Infinity))
}

function normalizeSurvey(raw: any): WithdrawSurvey {
  const reasonCodes: string[] = Array.isArray(raw.reasonCodes)
    ? raw.reasonCodes
    : typeof raw.reasonCodes === 'string'
    ? raw.reasonCodes.split(',').map((item: string) => item.trim())
    : []
  const orderedReasonCodes = sortReasonCodes(reasonCodes) // Apply sorting here

  return {
    id: raw.id,
    userId: raw.userId,
    username: raw.username,
    reasonCodes: orderedReasonCodes, // Use ordered reason codes
    reasonComment: raw.reasonComment,
    createdDate: raw.createdDate,
    updatedDate: raw.updatedDate,
  }
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const optionsDate: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }

  const formattedDate = date.toLocaleDateString('ko-KR', optionsDate).replace(/\s/g, '') // Remove spaces
  const formattedTime = date.toLocaleTimeString('ko-KR', optionsTime)

  return (
    <>
      <span className={styles.dateLine}>{formattedDate.slice(0, -1)}</span>
      <span className={styles.timeLine}>{formattedTime}</span>
    </>
  )
}

export default function AdminWithdrawSurveyPage() {
  const [data, setData] = useState<WithdrawSurveyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table') // 'table' or 'chart'
  const [sort, setSort] = useState<SortState>({ key: null, order: null })
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<FilterState>({
    reasonCodes: [],
    username: '',
    from: '',
    to: '',
  })

  const fetchSurveys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('size', '20')

      if (sort.key && sort.order) {
        params.append('sort', `${sort.key},${sort.order}`)
      }

      if (filters.reasonCodes.length > 0) {
        filters.reasonCodes.forEach((code) => params.append('reasonCodes', code))
      }
      if (filters.username) {
        params.append('username', filters.username)
      }
      if (filters.from) {
        params.append('from', filters.from)
      }
      if (filters.to) {
        params.append('to', filters.to)
      }

      const response = await fetchWithAuth(`/admin/survey/withdraw?${params.toString()}`, {
        method: 'GET',
      })
      const result = await response.json()
      setData({
        ...result,
        content: result.content.map(normalizeSurvey),
      })
    } catch (err) {
      console.error('Failed to fetch withdraw surveys:', err)
      setError('설문조사 데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [currentPage, sort, filters])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSortChange = (key: SortKey) => {
    if (!key) return // Should not happen with current setup

    setSort((prev) => {
      if (prev.key === key) {
        if (prev.order === 'asc') return { key, order: 'desc' }
        if (prev.order === 'desc') return { key: null, order: null } // Reset
        return { key, order: 'asc' } // Default to asc if no sort
      }
      return { key, order: 'asc' }
    })
  }

  const getSortIndicator = (key: SortKey) => {
    if (sort.key === key) {
      if (sort.order === 'asc') return ' ▲'
      if (sort.order === 'desc') return ' ▼'
    }
    return ' ↕'
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleReasonCodeFilterChange = (code: string) => {
    setFilters((prev) => {
      const currentReasons = prev.reasonCodes
      if (currentReasons.includes(code)) {
        return { ...prev, reasonCodes: currentReasons.filter((r) => r !== code) }
      } else {
        return { ...prev, reasonCodes: sortReasonCodes([...currentReasons, code]) }
      }
    })
  }

  const handleFilterReset = () => {
    setFilters({
      reasonCodes: [],
      username: '',
      from: '',
      to: '',
    })
    setSort({ key: null, order: null })
    setCurrentPage(0) // Reset to first page on filter reset
  }

  const reasonCodeDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    data?.content.forEach((survey) => {
      survey.reasonCodes.forEach((code) => {
        counts[code] = (counts[code] || 0) + 1
      })
    })

    const labels = REASON_LABEL_ORDER.filter(item => counts[item.code]).map(item => item.label);
    const backgroundColors = labels.map((_, index) =>
      `hsl(${index * (360 / labels.length)}, 70%, 50%)`
    );

    return {
      labels,
      datasets: [
        {
          label: '탈퇴 이유',
          data: labels.map(label => counts[REASON_LABEL_ORDER.find(item => item.label === label)?.code || ''] || 0),
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('70%', '50%')),
          borderWidth: 1,
        },
      ],
    }
  }, [data])

  if (loading) {
    return <div className={styles.loading}>데이터를 불러오는 중...</div>
  }

  if (error) {
    return <div className={styles.error}>오류: {error}</div>
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>설문조사 확인</h1>

      <div className={styles.summaryCards}>
        <AdminSummaryCard title="총 설문 수" value={data?.totalElements ?? 0} />
        {/* Add more summary cards if needed */}
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <label htmlFor="usernameFilter" className={styles.filterLabel}>
              사용자명
            </label>
            <input
              type="text"
              id="usernameFilter"
              name="username"
              value={filters.username}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="fromFilter" className={styles.filterLabel}>
              기간 (시작)
            </label>
            <input
              type="datetime-local"
              id="fromFilter"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="toFilter" className={styles.filterLabel}>
              기간 (끝)
            </label>
            <input
              type="datetime-local"
              id="toFilter"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>
        </div>

        <div className={styles.toggleButtonGroup}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={viewMode === 'chart'}
              onChange={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
            />
            <span className={styles.slider}>
              <span
                className={`${styles.toggleText} ${viewMode === 'table' ? styles.activeText : ''}`}
                data-on-label="그래프 보기"
                data-off-label="표 보기"
              ></span>
            </span>
          </label>
        </div>
      </div>

      <div className={styles.reasonCodeFilters}>
        {REASON_LABEL_ORDER.map((reason) => (
          <div
            key={reason.code}
            className={`${styles.reasonChip} ${
              filters.reasonCodes.includes(reason.code) ? styles.reasonChipActive : ''
            }`}
            onClick={() => handleReasonCodeFilterChange(reason.code)}
          >
            {reason.label}
          </div>
        ))}
        <button onClick={handleFilterReset} className={styles.resetButton}>
          필터 초기화
        </button>
      </div>

      {viewMode === 'table' ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <button onClick={() => handleSortChange('id')}>
                    ID {getSortIndicator('id')}
                  </button>
                </th>
                <th>사용자명</th>
                <th>
                  <button onClick={() => handleSortChange('reasonCodes')}>
                    탈퇴 이유 {getSortIndicator('reasonCodes')}
                  </button>
                </th>
                <th>상세 의견</th>
                <th>
                  <button onClick={() => handleSortChange('createdDate')}>
                    생성일 {getSortIndicator('createdDate')}
                  </button>
                </th>
                <th>
                  <button onClick={() => handleSortChange('updatedDate')}>
                    수정일 {getSortIndicator('updatedDate')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.content.map((survey) => (
                <tr key={survey.id}>
                  <td>{survey.id}</td>
                  <td>{survey.username}</td>
                  <td>
                    {survey.reasonCodes
                      .map((code) => REASON_LABEL_MAP[code] || code)
                      .join(', ')}
                  </td>
                  <td>{survey.reasonComment || '-'}</td>
                  <td>{formatDateTime(survey.createdDate)}</td>
                  <td>{formatDateTime(survey.updatedDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.chartContainer}>
          {reasonCodeDistribution.labels.length > 0 ? (
            <div className={styles.pieChartWrapper}>
              <Pie
                data={reasonCodeDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        color: 'black',
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          let label = context.label || ''
                          if (label) {
                            label += ': '
                          }
                          if (context.parsed !== null) {
                            label += context.parsed
                          }
                          return label
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <p className={styles.noDataMessage}>
              필터 조건에 맞는 설문 데이터가 없어 그래프를 표시할 수 없습니다.
            </p>
          )}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <AdminPagination
          currentPage={data.number}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
