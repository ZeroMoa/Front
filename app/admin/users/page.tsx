'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { getCdnUrl } from '@/lib/cdn'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import styles from './page.module.css'
import { useAdminHeader } from '../layout'
import { fetchWithAuth } from '@/lib/common/api/fetchWithAuth'
import Pagination from '@/components/pagination/Pagination'

type SortDirection = 'asc' | 'desc' | null
type SortKey =
  | 'username'
  | 'email'
  | 'nickname'
  | 'isLock'
  | 'isSocial'
  | 'createdDate'
  | 'updateDate'
  | 'isDeleted'
  | 'deletedAt'

type AdminUser = {
  username: string
  email: string
  nickname: string
  isLock: boolean
  isSocial: boolean
  createdDate: string | null
  updateDate: string | null
  isDeleted: boolean
  deletedAt: string | null
}

type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const SORT_FIELD_MAP: Record<SortKey, string> = {
  username: 'username',
  email: 'email',
  nickname: 'nickname',
  isLock: 'isLock',
  isSocial: 'isSocial',
  createdDate: 'createdDate',
  updateDate: 'updatedDate',
  isDeleted: 'isDeleted',
  deletedAt: 'deletedAt',
}

const TABLE_COLUMNS: Array<{
  key: SortKey
  label: string
  width?: string
}> = [
  { key: 'username', label: '회원명' },
  { key: 'email', label: '이메일' },
  { key: 'nickname', label: '닉네임' },
  { key: 'isLock', label: '정지 여부', width: '140px' },
  { key: 'isSocial', label: '소셜 여부', width: '140px' },
  { key: 'createdDate', label: '가입 날짜', width: '160px' },
  { key: 'updateDate', label: '정보 변경 날짜', width: '170px' },
  { key: 'isDeleted', label: '탈퇴 여부', width: '140px' },
  { key: 'deletedAt', label: '탈퇴 날짜', width: '160px' },
]

const PAGE_SIZE_OPTIONS = [20, 40, 60]
const SKELETON_ROW_COUNT = 8

type SortState = { field: SortKey | null; direction: SortDirection }

const INITIAL_SORT_STATE: SortState = { field: null, direction: null }

function parseSortState(sortParam: string | null): SortState {
  if (!sortParam) return INITIAL_SORT_STATE
  const [field, direction] = sortParam.split(',')
  if (!field || (direction !== 'asc' && direction !== 'desc')) {
    return INITIAL_SORT_STATE
  }

  const entries = Object.entries(SORT_FIELD_MAP) as Array<[SortKey, string]>
  const matched = entries.find(([, value]) => value === field)
  if (!matched) return INITIAL_SORT_STATE

  return { field: matched[0], direction }
}

function nextSortState(current: SortState, field: SortKey): SortState {
  if (current.field !== field) {
    return { field, direction: 'asc' }
  }
  if (current.direction === 'asc') {
    return { field, direction: 'desc' }
  }
  return INITIAL_SORT_STATE
}

function formatDateParts(value: string | null): { dateLine: string; timeLine: string } | null {
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

function normalizeUser(raw: any): AdminUser {
  return {
    username: raw.username ?? '',
    email: raw.email ?? '',
    nickname: raw.nickname ?? '',
    isLock: (raw.isLock ?? raw.is_lock ?? false) as boolean,
    isSocial: (raw.isSocial ?? raw.is_social ?? false) as boolean,
    createdDate: (raw.createdDate ?? raw.created_date ?? null) as string | null,
    updateDate: (raw.updateDate ?? raw.update_date ?? null) as string | null,
    isDeleted: (raw.isDeleted ?? raw.is_deleted ?? false) as boolean,
    deletedAt: (raw.deletedAt ?? raw.deleted_at ?? null) as string | null,
  }
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

  useEffect(() => {
    setSearchTerm(keyword)
  }, [keyword])

  useEffect(() => {
    let isMounted = true

    const fetchCount = async (path: string) => {
      const response = await fetchWithAuth(path)
      const data = await response.json()
      if (typeof data === 'number') return data
      if (data && typeof (data as { count?: number }).count === 'number') return (data as { count: number }).count
      if (data && typeof (data as { total?: number }).total === 'number') return (data as { total: number }).total
      if (data && typeof (data as { value?: number }).value === 'number') return (data as { value: number }).value
      return 0
    }

    async function fetchUserCounters() {
      try {
        const [registeredToday, deletedToday] = await Promise.all([
          fetchCount('/admin/users/today-registered-count'),
          fetchCount('/admin/users/today-deleted-count'),
        ])

        if (isMounted) {
          setHeaderValues({
            registeredToday,
            deletedToday,
          })
        }
      } catch (statsError) {
        console.error('어드민 요약 지표를 불러오지 못했습니다.', statsError)
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

  useEffect(() => {
    const controller = new AbortController()

    async function fetchUsers() {
      setLoading(true)
      setError(null)

      const isSearching = Boolean(keyword.trim())
      const endpoint = isSearching ? '/admin/users/search' : '/admin/users'
      const params = new URLSearchParams()
      params.set('page', Math.max(page, 0).toString())
      params.set('size', size.toString())
      if (isSearching) {
        params.set('q', keyword.trim())
      }
      if (sortState.field && sortState.direction) {
        params.set('sort', `${SORT_FIELD_MAP[sortState.field]},${sortState.direction}`)
      }

      const requestPath = params.toString() ? `${endpoint}?${params.toString()}` : endpoint

      try {
        const response = await fetchWithAuth(requestPath, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const json = await response.json()
        const pageResponse: PageResponse<AdminUser> = {
          content: Array.isArray(json.content) ? json.content.map(normalizeUser) : [],
          totalElements:
            typeof json.totalElements === 'number' ? json.totalElements : json.total_elements ?? 0,
          totalPages:
            typeof json.totalPages === 'number' ? json.totalPages : json.total_pages ?? 0,
          number: typeof json.number === 'number' ? json.number : json.page ?? 0,
          size: typeof json.size === 'number' ? json.size : json.pageSize ?? size,
        }

        setData(pageResponse)
      } catch (fetchError: unknown) {
        if ((fetchError as Error).name === 'AbortError') {
          return
        }
        setError((fetchError as Error).message ?? '알 수 없는 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()

    return () => controller.abort()
  }, [keyword, page, size, sortState.direction, sortState.field])

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

  const handleSort = (field: SortKey) => {
    const next = nextSortState(sortState, field)
    updateQueryParams({
      sort:
        next.field && next.direction
          ? `${SORT_FIELD_MAP[next.field]},${next.direction}`
          : null,
      page: '0',
    })
  }

  const handlePageChange = (nextPage: number) => {
    const targetPage = Math.max(Math.min(nextPage, Math.max(totalPages - 1, 0)), 0)
    updateQueryParams({ page: targetPage.toString() })
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({
      size: event.target.value,
      page: '0',
    })
  }

  const currentPage = Math.max(data?.number ?? page, 0)
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0
  const tableContent = data?.content ?? []

  const pageNumbers = useMemo(() => {
    if (totalPages <= 0) return []
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index)
    }
    let start = Math.max(currentPage - 2, 0)
    let end = Math.min(start + 4, totalPages - 1)
    if (end - start < 4) {
      start = Math.max(end - 4, 0)
    }
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }, [currentPage, totalPages])

  const sortIndicator = (field: SortKey) => {
    if (sortState.field !== field || !sortState.direction) {
      return <span className={styles.sortIndicator}>↕</span>
    }
    return (
      <span className={styles.sortIndicator}>
        {sortState.direction === 'asc' ? '▲' : '▼'}
      </span>
    )
  }

  const renderSkeletonTable = () => (
    <table className={`${styles.table} ${styles.tableLoading}`}>
      <thead className={styles.tableHead}>
        <tr>
          {TABLE_COLUMNS.map(({ key, label, width }) => (
            <th key={key} style={width ? { width } : undefined} className={styles.sortable}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: Math.min(size, SKELETON_ROW_COUNT) }).map((_, rowIndex) => (
          <tr key={`skeleton-${rowIndex}`} className={styles.skeletonRow}>
            {TABLE_COLUMNS.map(({ key }) => (
              <td key={`${key}-${rowIndex}`}>
                <div className={styles.skeletonBlock} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div className={styles.container}>
      <div className={styles.summarySection}>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>회원 조회</h1>
          <span className={styles.resultInfo}>
            총
            {' '}
            {(loading && totalElements === 0 ? '—' : totalElements.toLocaleString())}
            명
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
              placeholder="회원명을 입력해 검색하세요"
            />
            <button type="submit" className={styles.searchButton}>
              <Image src={getCdnUrl('/images/search.png')} alt="검색" width={20} height={20} />
            </button>
          </form>

          
        </div>

        <div className={styles.controlsGroup}>
          <select
            value={size}
            onChange={handlePageSizeChange}
            className={styles.pageSizeSelect}
          >
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
          renderSkeletonTable()
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  {TABLE_COLUMNS.map(({ key, label, width }) => (
                    <th
                      key={key}
                      style={width ? { width } : undefined}
                      className={styles.sortable}
                      onClick={() => handleSort(key)}
                    >
                      {label}
                      {sortIndicator(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && tableContent.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length}>
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

