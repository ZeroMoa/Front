'use client'

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Image from 'next/image'
import { getCdnUrl } from '@/lib/cdn'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import styles from './page.module.css'
import { useAdminHeader } from '../layout'
import Pagination from '@/components/pagination/Pagination'
import { fetchAdminUserStats, fetchAdminUsersList } from '@/app/admin/store/api/adminUserApi'
import { ADMIN_USER_TABLE_COLUMNS, PAGE_SIZE_OPTIONS, SORT_FIELD_MAP } from '@/constants/userConstants'
import type {
  AdminUser,
  PageResponse,
  AdminUserSortKey,
  SortDirection,
} from '@/types/userTypes'
import SortableHeader from '@/components/table/SortableHeader'

type SortState = { field: AdminUserSortKey | null; direction: SortDirection | null }

const INITIAL_SORT_STATE: SortState = { field: null, direction: null }
const DEFAULT_SORT_KEY: AdminUserSortKey = 'createdDate'
const DEFAULT_SORT_STATE: SortState = { field: DEFAULT_SORT_KEY, direction: 'desc' }

function parseSortState(sortParam: string | null): SortState {
  if (!sortParam) return DEFAULT_SORT_STATE

  const [field, direction] = sortParam.split(',')
  if (!field || (direction !== 'asc' && direction !== 'desc')) {
    return DEFAULT_SORT_STATE
  }

  const entries = Object.entries(SORT_FIELD_MAP) as Array<[AdminUserSortKey, string]>
  const matched = entries.find(([, value]) => value === field)
  if (!matched) return DEFAULT_SORT_STATE
  return { field: matched[0], direction }
}

function nextSortState(current: SortState, field: AdminUserSortKey): SortState {
  if (current.field !== field) {
    return { field, direction: 'asc' }
  }
  if (current.direction === 'asc') {
    return { field, direction: 'desc' }
  }
  return INITIAL_SORT_STATE
}

function formatDateParts(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { dateLine: value, timeLine: '' }
  }
  const dateLine = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  const timeLine = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
  return { dateLine, timeLine }
}

function renderDateCell(value: string | null) {
  const parts = formatDateParts(value)
  if (!parts) {
    return '—'
  }
  return (
    <div className={styles.dateCell}>
      <span>{parts.dateLine}</span>
      {parts.timeLine ? <span>{parts.timeLine}</span> : null}
    </div>
  )
}

export default function AdminUsersPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setValues: setHeaderValues } = useAdminHeader()

  const [data, setData] = useState<PageResponse<AdminUser> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') ?? '')

  const pageParamRaw = searchParams.get('page')
  const pageParam = pageParamRaw ? Number(pageParamRaw) : 0
  const page = Number.isNaN(pageParam) ? 0 : pageParam

  const sizeParamRaw = searchParams.get('size')
  const sizeParam = sizeParamRaw ? Number(sizeParamRaw) : PAGE_SIZE_OPTIONS[0]
  const size = PAGE_SIZE_OPTIONS.includes(sizeParam) ? sizeParam : PAGE_SIZE_OPTIONS[0]
  const sortParam = searchParams.get('sort')
  const sortState = useMemo(() => parseSortState(sortParam), [sortParam])
  const keyword = searchParams.get('q') ?? ''

  const isDefaultSortActive = sortParam === null

  useEffect(() => {
    setSearchTerm(keyword)
  }, [keyword])

  useEffect(() => {
    let isMounted = true

    async function fetchUserCounters() {
      try {
        const { registeredToday, deletedToday } = await fetchAdminUserStats()
        if (isMounted) {
          setHeaderValues({
            registeredToday,
            deletedToday,
          })
        }
      } catch (statsError) {
        console.error('관리자 요약 지표를 불러오지 못했습니다.', statsError)
      }
    }

    fetchUserCounters()

    return () => {
      isMounted = false
    }
  }, [setHeaderValues])

  const updateQueryParams = useCallback(
    (nextParams: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(nextParams).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      const queryString = params.toString()
      const url = queryString ? `${pathname}?${queryString}` : pathname
      router.push(url, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const fetchUsers = useCallback(async () => {
      setLoading(true)
      setError(null)
    try {
      const nextData = await fetchAdminUsersList({
        page,
        size,
        keyword: keyword.trim(),
        sortField: sortState.field ? SORT_FIELD_MAP[sortState.field] : undefined,
        sortDirection: sortState.direction,
      })
      setData(nextData)
      } catch (fetchError: unknown) {
        if ((fetchError as Error).name === 'AbortError') {
          return
        }
        setError((fetchError as Error).message ?? '알 수 없는 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
  }, [keyword, page, size, sortState.field, sortState.direction])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchTerm.trim()
    updateQueryParams({
      q: trimmed || null,
      page: '0',
      sort: null,
    })
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    updateQueryParams({
      q: null,
      page: '0',
      sort: null,
    })
  }

  const handleSort = (field: AdminUserSortKey) => {
    const baselineState = isDefaultSortActive && field === DEFAULT_SORT_KEY ? INITIAL_SORT_STATE : sortState
    const next = nextSortState(baselineState, field)
    updateQueryParams({
      sort: next.field && next.direction ? `${SORT_FIELD_MAP[next.field]},${next.direction}` : null,
      page: '0',
    })
  }

  const handlePageChange = (nextPage: number) => {
    const totalPagesCount = Math.max(data?.totalPages ?? 1, 1)
    const zeroBasedPage = Math.min(Math.max(nextPage - 1, 0), totalPagesCount - 1)
    updateQueryParams({ page: zeroBasedPage.toString() })
  }

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({
      size: event.target.value,
      page: '0',
    })
  }

  const currentPageIndex = Math.max(data?.number ?? page, 0)
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0
  const tableContent = data?.content ?? []

const renderLoadingState = () => (
  <div className={styles.loadingOverlay}>
    <CircularProgress size={40} className={styles.loadingSpinner} />
    <p>회원 목록 불러오는 중...</p>
  </div>
  )

  return (
    <div className={styles.container}>
      <div className={styles.summarySection}>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>회원 조회</h1>
        <span className={styles.resultInfo}>
            총 {(loading && totalElements === 0 ? '—' : totalElements.toLocaleString())}명
          </span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchArea}>
          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className={styles.searchInput}
              placeholder="회원명을 입력하세요"
            />
            <button type="submit" className={styles.searchButton}>
              <Image src={getCdnUrl('/images/search.png')} alt="검색" width={20} height={20} />
            </button>
          </form>
        </div>

        <div className={styles.controlsGroup}>
          <select value={size} onChange={handlePageSizeChange} className={styles.pageSizeSelect}>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                페이지당 {option}명
              </option>
            ))}
          </select>
          {(keyword || sortState.field) && (
            <button type="button" className={styles.resetButton} onClick={handleResetFilters}>
              필터 초기화
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          renderLoadingState()
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  {ADMIN_USER_TABLE_COLUMNS.map(({ key, label, width }) => (
                    <th
                      key={key}
                      style={width ? { width } : undefined}
                      className={styles.sortable}
                      onClick={() => handleSort(key)}
                    >
                      <SortableHeader
                        label={label}
                        direction={sortState.field === key ? sortState.direction : null}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && tableContent.length === 0 ? (
                  <tr>
                    <td colSpan={ADMIN_USER_TABLE_COLUMNS.length}>
                      <div className={styles.emptyState}>
                        조회된 회원 정보가 없습니다. 조건을 변경하거나 다른 검색어를 시도해주세요.
                      </div>
                    </td>
                  </tr>
                ) : (
                  tableContent.map((user) => (
                    <tr key={user.username} className={styles.tableRow}>
                      <td>{user.username || '—'}</td>
                      <td>{user.email || '—'}</td>
                      <td>{user.nickname || '—'}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            user.isLock ? styles.statusInactive : styles.statusActive
                          }`}
                        >
                          {user.isLock ? '정지' : '정상'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            user.isSocial ? styles.statusNeutral : styles.statusActive
                          }`}
                        >
                          {user.isSocial ? '소셜' : '일반'}
                        </span>
                      </td>
                      <td>{renderDateCell(user.createdDate)}</td>
                      <td>{renderDateCell(user.updateDate)}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            user.isDeleted ? styles.statusInactive : styles.statusActive
                          }`}
                        >
                          {user.isDeleted ? '탈퇴' : '활동 중'}
                        </span>
                      </td>
                      <td>{renderDateCell(user.deletedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className={styles.tableFooter}>
              <Pagination currentPage={currentPageIndex + 1} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

