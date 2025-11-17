
'use client'

import {
  ChangeEvent,
  FormEvent,
  Fragment,
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import styles from './page.module.css'
import Pagination from '@/components/pagination/Pagination'
import { fetchWithAuth } from '@/lib/api/fetchWithAuth'

type ManageUser = {
  username: string
  email: string
  nickname: string
  isLock: boolean
  roleType: string
}

type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

type EditFormState = {
  email: string
  nickname: string
}

type UserFilters = {
  username: string
  email: string
  roleType: 'ALL' | 'USER' | 'ADMIN'
  isLock: 'ALL' | 'true' | 'false'
}

type SortState = {
  field: 'username' | 'email' | 'nickname' | 'createdDate' | 'updatedDate' | 'roleType' | 'isLock' | null
  direction: 'asc' | 'desc'
}

const PAGE_SIZE_OPTIONS = [20, 40, 60]

function normalizeUser(raw: any): ManageUser {
  const rawRole = raw.roleType ?? raw.role ?? raw.role_type ?? 'ROLE_USER'
  const normalizedRole =
    typeof rawRole === 'string' && !rawRole.startsWith('ROLE_') ? `ROLE_${rawRole}` : rawRole ?? 'ROLE_USER'
  return {
    username: raw.username ?? '',
    email: raw.email ?? '',
    nickname: raw.nickname ?? '',
    isLock: Boolean(raw.isLock ?? raw.is_lock ?? false),
    roleType: normalizedRole,
  }
}

export default function AdminUserManagePage() {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [data, setData] = useState<PageResponse<ManageUser> | null>(null)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>({ email: '', nickname: '' })
  const [filters, setFilters] = useState<UserFilters>({
    username: '',
    email: '',
    roleType: 'ALL',
    isLock: 'ALL',
  })
  const [sortState, setSortState] = useState<SortState>({
    field: null,
    direction: 'asc',
  })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('size', size.toString())
      if (sortState.field) {
        params.append('sort', `${sortState.field},${sortState.direction}`)
      }
      if (filters.username.trim()) {
        params.set('username', filters.username.trim())
      }
      if (filters.email.trim()) {
        params.set('email', filters.email.trim())
      }
      if (filters.roleType !== 'ALL') {
        params.set('roleType', filters.roleType)
      }
      if (filters.isLock !== 'ALL') {
        params.set('isLock', filters.isLock)
      }

      const hasFilters =
        filters.username.trim() ||
        filters.email.trim() ||
        filters.roleType !== 'ALL' ||
        filters.isLock !== 'ALL'

      const endpoint = hasFilters ? '/admin/users/search' : '/admin/users'

      const response = await fetchWithAuth(`${endpoint}?${params.toString()}`)
      const json = await response.json()
      const pageResponse: PageResponse<ManageUser> = {
        content: Array.isArray(json.content) ? json.content.map(normalizeUser) : [],
        totalElements: typeof json.totalElements === 'number' ? json.totalElements : 0,
        totalPages: typeof json.totalPages === 'number' ? json.totalPages : 0,
        number: typeof json.number === 'number' ? json.number : page,
        size: typeof json.size === 'number' ? json.size : size,
      }
      setData(pageResponse)
    } catch (fetchError) {
      console.error('Failed to fetch admin users', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : '회원 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [filters.email, filters.isLock, filters.roleType, filters.username, page, size, sortState.direction, sortState.field])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleLockToggle = async (user: ManageUser) => {
    try {
      const nextLock = !user.isLock
      await fetchWithAuth(`/admin/users/${encodeURIComponent(user.username)}/lock`, {
        method: 'PATCH',
        body: JSON.stringify({ isLock: nextLock }),
      })
      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((item) =>
                item.username === user.username ? { ...item, isLock: nextLock } : item
              ),
            }
          : prev
      )
    } catch (toggleError) {
      console.error('Failed to toggle lock', toggleError)
      alert('계정 잠금 상태를 변경하지 못했습니다.')
    }
  }

  const handleRoleToggle = async (user: ManageUser) => {
    const nextRole = user.roleType === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN'
    const payloadRole = nextRole === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'
    try {
      await fetchWithAuth(`/admin/users/${encodeURIComponent(user.username)}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ roleType: payloadRole }),
      })
      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((item) =>
                item.username === user.username ? { ...item, roleType: nextRole } : item
              ),
            }
          : prev
      )
    } catch (roleError) {
      console.error('Failed to change role', roleError)
      alert('역할을 변경하지 못했습니다.')
    }
  }

  const handleDelete = async (user: ManageUser) => {
    const confirmed = window.confirm(`${user.username} 계정을 삭제하시겠습니까?`)
    if (!confirmed) return
    try {
      await fetchWithAuth(`/admin/users/${encodeURIComponent(user.username)}`, {
        method: 'DELETE',
      })
      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.filter((item) => item.username !== user.username),
              totalElements: Math.max((prev.totalElements ?? 1) - 1, 0),
            }
          : prev
      )
    } catch (deleteError) {
      console.error('Failed to delete user', deleteError)
      alert('계정을 삭제하지 못했습니다.')
    }
  }

  const handleEditClick = (user: ManageUser) => {
    if (editingUser === user.username) {
      setEditingUser(null)
      setEditForm({ email: '', nickname: '' })
      return
    }
    setEditingUser(user.username)
    setEditForm({
      email: user.email,
      nickname: user.nickname,
    })
  }

  const handleEditFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>, user: ManageUser) => {
    event.preventDefault()
    try {
      await fetchWithAuth(`/admin/users/${encodeURIComponent(user.username)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          email: editForm.email !== user.email ? editForm.email : undefined,
          nickname: editForm.nickname !== user.nickname ? editForm.nickname : undefined,
        }),
      })
      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((item) =>
                item.username === user.username
                  ? { ...item, email: editForm.email, nickname: editForm.nickname }
                  : item
              ),
            }
          : prev
      )
      setSuccessMessage('회원 정보가 수정되었습니다.')
      setEditingUser(null)
      setEditForm({ email: '', nickname: '' })
      setTimeout(() => setSuccessMessage(null), 2500)
    } catch (updateError) {
      console.error('Failed to update user', updateError)
      alert('회원 정보를 수정하지 못했습니다.')
    }
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
  }

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSize(Number(event.target.value))
    setPage(0)
  }

  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0
  const users = data?.content ?? []

  const hasActiveFilters = useMemo(
    () =>
      filters.username.trim() !== '' ||
      filters.email.trim() !== '' ||
      filters.roleType !== 'ALL' ||
      filters.isLock !== 'ALL',
    [filters.email, filters.isLock, filters.roleType, filters.username]
  )

  const toggleLabel = useMemo(
    () => ({
      lock: ['활성', '정지'] as const,
      role: ['유저', '어드민'] as const,
    }),
    []
  )

  const handleFilterInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
    setPage(0)
  }

  const handleFilterSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
    setPage(0)
  }

  const handleResetFilters = () => {
    setFilters({
      username: '',
      email: '',
      roleType: 'ALL',
      isLock: 'ALL',
    })
    setSortState({
      field: null,
      direction: 'asc',
    })
    setPage(0)
  }

  const handleSortChange = (field: SortState['field']) => {
    if (!field) return
    setSortState((prev) => {
      if (prev.field === field) {
        if (prev.direction === 'asc') {
          return {
            field,
            direction: 'desc',
          }
        }
        return {
          field: null,
          direction: 'asc',
        }
      }
      const defaultDirection = field === 'createdDate' || field === 'updatedDate' ? 'desc' : 'asc'
      return {
        field,
        direction: defaultDirection,
      }
    })
    setPage(0)
  }

  const renderSortSymbol = (field: Exclude<SortState['field'], null>) =>
    sortState.field === field ? (sortState.direction === 'asc' ? '▲' : '▼') : '↕'

  const canReset = hasActiveFilters || sortState.field !== null

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>회원 관리</h1>
          <span className={styles.totalInfo}>총 {totalElements.toLocaleString()}명</span>
        </div>
        <div className={styles.pageSizeControl}>
          페이지 크기
          <select value={size} onChange={handlePageSizeChange} className={styles.pageSizeSelect}>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}명씩 보기
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className={`${styles.statusMessage} ${styles.errorMessage}`}>{error}</div>}
      {successMessage && <div className={`${styles.statusMessage} ${styles.successMessage}`}>{successMessage}</div>}

      <div className={styles.filtersBar}>
        <div className={styles.filtersRow}>
          <label className={styles.filterField}>
            <span>회원명</span>
            <input
              name="username"
              value={filters.username}
              onChange={handleFilterInputChange}
              placeholder="아이디 또는 이름"
            />
          </label>
          <label className={styles.filterField}>
            <span>이메일</span>
            <input name="email" value={filters.email} onChange={handleFilterInputChange} placeholder="email@example.com" />
          </label>
          <label className={styles.filterField}>
            <span>역할</span>
            <select name="roleType" value={filters.roleType} onChange={handleFilterSelectChange}>
              <option value="ALL">전체</option>
              <option value="USER">ROLE_USER</option>
              <option value="ADMIN">ROLE_ADMIN</option>
            </select>
          </label>
          <label className={styles.filterField}>
            <span>정지 여부</span>
            <select name="isLock" value={filters.isLock} onChange={handleFilterSelectChange}>
              <option value="ALL">전체</option>
              <option value="false">활성</option>
              <option value="true">정지</option>
            </select>
          </label>
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleResetFilters}
            disabled={!canReset}
          >
            초기화
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th>
                <button type="button" className={styles.headerButton} onClick={() => handleSortChange('username')}>
                  회원명
                  <span className={styles.sortIndicator}>{renderSortSymbol('username')}</span>
                </button>
              </th>
              <th>
                <button type="button" className={styles.headerButton} onClick={() => handleSortChange('email')}>
                  이메일
                  <span className={styles.sortIndicator}>{renderSortSymbol('email')}</span>
                </button>
              </th>
              <th>
                <button type="button" className={styles.headerButton} onClick={() => handleSortChange('nickname')}>
                  닉네임
                  <span className={styles.sortIndicator}>{renderSortSymbol('nickname')}</span>
                </button>
              </th>
              <th>
                <button type="button" className={styles.headerButton} onClick={() => handleSortChange('isLock')}>
                  정지
                  <span className={styles.sortIndicator}>{renderSortSymbol('isLock')}</span>
                </button>
              </th>
              <th>
                <button type="button" className={styles.headerButton} onClick={() => handleSortChange('roleType')}>
                  역할
                  <span className={styles.sortIndicator}>{renderSortSymbol('roleType')}</span>
                </button>
              </th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {loading && (
              <tr>
                <td colSpan={6} className={styles.loadingState}>
                  회원 정보를 불러오는 중입니다…
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  표시할 회원이 없습니다.
                </td>
              </tr>
            )}
            {!loading &&
              users.map((user) => (
                <Fragment key={user.username}>
                  <tr>
                    <td>{user.username}</td>
                    <td>{user.email || '—'}</td>
                    <td>{user.nickname || '—'}</td>
                    <td>
                      <label className={styles.toggleSwitch} aria-live="polite">
                        <input
                          type="checkbox"
                          checked={!user.isLock}
                          onChange={() => handleLockToggle(user)}
                          aria-label={`${user.username} 계정 ${
                            user.isLock ? toggleLabel.lock[0] : toggleLabel.lock[1]
                          } 상태로 전환`}
                        />
                        <span
                          className={styles.toggleTrack}
                          data-on-label={toggleLabel.lock[0]}
                          data-off-label={toggleLabel.lock[1]}
                          style={{ '--toggle-active-color': '#4cd964' } as CSSProperties}
                          aria-hidden="true"
                        >
                          <span className={styles.toggleHandle} />
                        </span>
                      </label>
                    </td>
                    <td>
                      <label className={styles.toggleSwitch} aria-live="polite">
                        <input
                          type="checkbox"
                          checked={user.roleType === 'ROLE_ADMIN'}
                          onChange={() => handleRoleToggle(user)}
                          aria-label={`${user.username} 역할을 ${
                            user.roleType === 'ROLE_ADMIN' ? toggleLabel.role[0] : toggleLabel.role[1]
                          }로 전환`}
                        />
                        <span
                          className={styles.toggleTrack}
                          data-on-label={toggleLabel.role[1]}
                          data-off-label={toggleLabel.role[0]}
                          style={{ '--toggle-active-color': '#6c5cff' } as CSSProperties}
                          aria-hidden="true"
                        >
                          <span className={styles.toggleHandle} />
                        </span>
                      </label>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button type="button" className={styles.editButton} onClick={() => handleEditClick(user)}>
                          정보 수정
                        </button>
                        <button type="button" className={styles.deleteButton} onClick={() => handleDelete(user)}>
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingUser === user.username && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={6}>
                        <form className={styles.editForm} onSubmit={(event) => handleEditSubmit(event, user)}>
                          <div className={styles.formField}>
                            <label htmlFor={`nickname-${user.username}`} className={styles.formLabel}>
                              닉네임
                            </label>
                            <input
                              id={`nickname-${user.username}`}
                              name="nickname"
                              value={editForm.nickname}
                              onChange={handleEditFieldChange}
                              className={styles.formInput}
                            />
                          </div>
                          <div className={styles.formField}>
                            <label htmlFor={`email-${user.username}`} className={styles.formLabel}>
                              이메일
                            </label>
                            <input
                              id={`email-${user.username}`}
                              name="email"
                              type="email"
                              value={editForm.email}
                              onChange={handleEditFieldChange}
                              className={styles.formInput}
                            />
                          </div>
                          <div className={styles.formActions}>
                            <button type="button" className={styles.cancelButton} onClick={() => setEditingUser(null)}>
                              취소
                            </button>
                            <button type="submit" className={styles.submitButton}>
                              수정 완료
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className={styles.paginationWrapper}>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}

