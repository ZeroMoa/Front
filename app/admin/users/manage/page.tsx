'use client'

import {
  ChangeEvent,
  CSSProperties,
  FormEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import styles from './page.module.css'
import Pagination from '@/components/pagination/Pagination'
import {
  deleteAdminUser,
  fetchAdminUserManagement,
  patchAdminUserInfo,
  patchAdminUserLock,
  patchAdminUserRole,
} from '@/app/admin/store/api/adminUserApi'
import {
  MANAGE_USER_FILTER_OPTIONS,
  MANAGE_USER_TABLE_COLUMNS,
  PAGE_SIZE_OPTIONS,
  USER_TOGGLE_LABELS,
} from '@/constants/userConstants'
import type {
  EditFormState,
  ManageUser,
  ManageUserSortKey,
  PageResponse,
  UserFilters,
} from '@/types/userTypes'

type SortState = {
  field: ManageUserSortKey | null
  direction: 'asc' | 'desc'
}

const INITIAL_FILTERS: UserFilters = {
  username: '',
  email: '',
  roleType: 'ALL',
  isLock: 'ALL',
}

const INITIAL_SORT_STATE: SortState = {
  field: null,
  direction: 'asc',
}

const PAGE_SIZE_OPTIONS_LIST = PAGE_SIZE_OPTIONS

export default function AdminUserManagePage() {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(PAGE_SIZE_OPTIONS_LIST[0])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [data, setData] = useState<PageResponse<ManageUser> | null>(null)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>({ email: '', nickname: '' })
  const [filters, setFilters] = useState<UserFilters>(INITIAL_FILTERS)
  const [sortState, setSortState] = useState<SortState>(INITIAL_SORT_STATE)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
    const nextData = await fetchAdminUserManagement({
      page,
      size,
      sortField: sortState.field ?? undefined,
      sortDirection: sortState.field ? sortState.direction : undefined,
      filters,
    })
      setData(nextData)
    } catch (fetchError: unknown) {
      console.error('Failed to fetch admin users', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : '회원 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [filters, page, size, sortState.direction, sortState.field])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleLockToggle = async (user: ManageUser) => {
    try {
      const nextLock = !user.isLock
      await patchAdminUserLock(user.username, nextLock)
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
      await patchAdminUserRole(user.username, payloadRole)
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
      await deleteAdminUser(user.username)
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
    const payload: Record<string, string> = {}
    if (editForm.email !== user.email && editForm.email.trim()) {
      payload.email = editForm.email.trim()
    }
    if (editForm.nickname !== user.nickname && editForm.nickname.trim()) {
      payload.nickname = editForm.nickname.trim()
    }
    if (Object.keys(payload).length === 0) {
      setEditingUser(null)
      return
    }
    try {
      await patchAdminUserInfo(user.username, payload)
      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((item) =>
                item.username === user.username
                  ? { ...item, email: payload.email ?? item.email, nickname: payload.nickname ?? item.nickname }
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

  const hasActiveFilters = useMemo(
    () =>
      filters.username.trim() !== '' ||
      filters.email.trim() !== '' ||
      filters.roleType !== 'ALL' ||
      filters.isLock !== 'ALL',
    [filters]
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
    setFilters({ ...INITIAL_FILTERS })
    setSortState({ ...INITIAL_SORT_STATE })
    setPage(0)
  }

  const handleSortChange = (field: ManageUserSortKey) => {
    setSortState((prev) => {
      if (prev.field === field) {
        if (prev.direction === 'asc') {
          return { field, direction: 'desc' }
        }
        return { field: null, direction: 'asc' }
      }
      const defaultDirection = field === 'createdDate' || field === 'updatedDate' ? 'desc' : 'asc'
      return { field, direction: defaultDirection }
    })
    setPage(0)
  }

  const renderSortSymbol = (field: Exclude<SortState['field'], null>) =>
    sortState.field === field ? (sortState.direction === 'asc' ? '▲' : '▼') : '↕'

  const users = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0

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
            {PAGE_SIZE_OPTIONS_LIST.map((option) => (
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
              {MANAGE_USER_FILTER_OPTIONS.role.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filterField}>
            <span>정지 여부</span>
            <select name="isLock" value={filters.isLock} onChange={handleFilterSelectChange}>
              {MANAGE_USER_FILTER_OPTIONS.lock.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.resetButton} onClick={handleResetFilters} disabled={!hasActiveFilters}>
            필터 초기화
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              {MANAGE_USER_TABLE_COLUMNS.map(({ key, label }) => (
                <th key={key}>
                  <button type="button" className={styles.headerButton} onClick={() => handleSortChange(key)}>
                    {label}
                    {sortState.field && key === sortState.field && (
                      <span className={styles.sortIndicator}>{renderSortSymbol(key)}</span>
                    )}
                    {!(sortState.field && key === sortState.field) && (
                      <span className={styles.sortIndicator}>↕</span>
                    )}
                  </button>
                </th>
              ))}
              <th>관리</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {loading && (
              <tr>
                <td colSpan={MANAGE_USER_TABLE_COLUMNS.length + 1} className={styles.loadingState}>
                  회원 정보를 불러오는 중입니다…
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={MANAGE_USER_TABLE_COLUMNS.length + 1} className={styles.emptyState}>
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
                            user.isLock ? USER_TOGGLE_LABELS.lock[0] : USER_TOGGLE_LABELS.lock[1]
                          } 상태로 전환`}
                        />
                        <span
                          className={styles.toggleTrack}
                          data-on-label={USER_TOGGLE_LABELS.lock[0]}
                          data-off-label={USER_TOGGLE_LABELS.lock[1]}
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
                            user.roleType === 'ROLE_ADMIN' ? USER_TOGGLE_LABELS.role[0] : USER_TOGGLE_LABELS.role[1]
                          }로 전환`}
                        />
                        <span
                          className={styles.toggleTrack}
                          data-on-label={USER_TOGGLE_LABELS.role[1]}
                          data-off-label={USER_TOGGLE_LABELS.role[0]}
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
                      <td colSpan={MANAGE_USER_TABLE_COLUMNS.length + 1}>
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

