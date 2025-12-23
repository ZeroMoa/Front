'use client'

import {
  ChangeEvent,
  CSSProperties,
  FormEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import styles from './page.module.css'
import Pagination from '@/components/pagination/Pagination'
import {
  fetchAdminUserManagement,
  patchAdminUserInfo,
  patchAdminUserLock,
  patchAdminUserRole,
} from '@/app/admin/store/api/adminUserApi'
import { MANAGE_USER_FILTER_OPTIONS, MANAGE_USER_TABLE_COLUMNS, PAGE_SIZE_OPTIONS, USER_TOGGLE_LABELS } from '@/constants/userConstants'
import type {
  EditFormState,
  ManageUser,
  ManageUserSortKey,
  PageResponse,
  UserFilters,
} from '@/types/userTypes'
import SortableHeader from '@/components/table/SortableHeader'

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
const EMAIL_DOMAINS = [
  'naver.com',
  'gmail.com',
  'hanmail.net',
  'nate.com',
  'hotmail.com',
  'daum.net',
  'outlook.com',
  'kakao.com',
] as const

const INITIAL_EDIT_STATE: EditFormState = {
  nickname: '',
  emailFront: '',
  emailBack: '',
  isDirectInput: false,
}

const splitEmail = (email: string): [string, string] => {
  if (!email || !email.includes('@')) {
    return ['', '']
  }
  const [front, ...rest] = email.split('@')
  return [front, rest.join('@')]
}

export default function AdminUserManagePage() {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(PAGE_SIZE_OPTIONS_LIST[0])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [data, setData] = useState<PageResponse<ManageUser> | null>(null)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>(INITIAL_EDIT_STATE)
  const [filters, setFilters] = useState<UserFilters>(INITIAL_FILTERS)
  const [sortState, setSortState] = useState<SortState>(INITIAL_SORT_STATE)
  const [isEmailDomainOpen, setIsEmailDomainOpen] = useState(false)
  const emailDropdownRef = useRef<HTMLDivElement | null>(null)

  const fetchUsers = useCallback(async () => {
    const hasUsername = filters.username.trim().length > 0
    const hasEmail = filters.email.trim().length > 0

    if (hasUsername && hasEmail) {
      setError('아이디와 이메일 검색은 동시에 사용할 수 없습니다. 하나만 입력해주세요.')
      setLoading(false)
      return
    }

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

  useEffect(() => {
    if (!isEmailDomainOpen) {
      return
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target as Node)) {
        setIsEmailDomainOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isEmailDomainOpen])

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

  const handleNicknameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setEditForm((prev) => ({ ...prev, nickname: value }))
  }

  const handleEmailFrontChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setEditForm((prev) => ({ ...prev, emailFront: value }))
  }

  const handleEmailBackInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setEditForm((prev) => ({ ...prev, emailBack: value, isDirectInput: true }))
  }

  const handleDomainSelect = (domain: string) => {
    if (domain === '직접입력') {
      setEditForm((prev) => ({ ...prev, emailBack: '', isDirectInput: true }))
      setIsEmailDomainOpen(false)
      return
    }
    setEditForm((prev) => ({ ...prev, emailBack: domain, isDirectInput: false }))
    setIsEmailDomainOpen(false)
  }

  const handleEditCancel = () => {
    setEditingUser(null)
    setEditForm(INITIAL_EDIT_STATE)
    setIsEmailDomainOpen(false)
  }

  const handleEditClick = (user: ManageUser) => {
    if (editingUser === user.username) {
      handleEditCancel()
      return
    }
    const [front, back] = splitEmail(user.email)
    const domainKnown = back ? EMAIL_DOMAINS.includes(back as (typeof EMAIL_DOMAINS)[number]) : false
    setEditingUser(user.username)
    setEditForm({
      nickname: user.nickname,
      emailFront: front,
      emailBack: back,
      isDirectInput: !domainKnown,
    })
    setIsEmailDomainOpen(false)
  }

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>, user: ManageUser) => {
    event.preventDefault()
    const trimmedFront = editForm.emailFront.trim()
    const trimmedBack = editForm.emailBack.trim()
    const trimmedNickname = editForm.nickname.trim()

    if (!trimmedFront || !trimmedBack) {
      alert('유효한 이메일을 입력해주세요.')
      return
    }

    const composedEmail = `${trimmedFront}@${trimmedBack}`
    const payload: Record<string, string> = {}
    if (composedEmail !== user.email) {
      payload.email = composedEmail
    }
    if (trimmedNickname && trimmedNickname !== user.nickname) {
      payload.nickname = trimmedNickname
    }

    if (Object.keys(payload).length === 0) {
      handleEditCancel()
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
                  ? {
                      ...item,
                      email: payload.email ?? item.email,
                      nickname: payload.nickname ?? item.nickname,
                    }
                  : item
              ),
            }
          : prev
      )
      setSuccessMessage('회원 정보가 수정되었습니다.')
      handleEditCancel()
      setTimeout(() => setSuccessMessage(null), 2500)
    } catch (updateError) {
      console.error('Failed to update user', updateError)
      alert('회원 정보를 수정하지 못했습니다.')
    }
  }

  const handlePageChange = (nextPage: number) => {
    setPage(Math.max(nextPage - 1, 0))
  }

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSize(Number(event.target.value))
    setPage(0)
  }

  const hasActiveControls = useMemo(() => {
    const filterActive =
      filters.username.trim() !== '' ||
      filters.email.trim() !== '' ||
      filters.roleType !== 'ALL' ||
      filters.isLock !== 'ALL'
    const sortActive = sortState.field !== null
    return filterActive || sortActive
  }, [filters, sortState.field])

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

  const users = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0

  const renderLoadingOverlay = () => (
    <div className={styles.loadingOverlay}>
      <CircularProgress size={32} className={styles.loadingSpinner} />
      <p>회원 목록 불러오는 중...</p>
    </div>
  )

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>회원 관리</h1>
          <span className={styles.totalInfo}>총 {totalElements.toLocaleString()}명</span>
        </div>
        
      </div>

      <div className={styles.legendNote} role="status" aria-live="polite">
        <span className={styles.deletedLegendChip} aria-hidden="true" />
        <span>빨간색 배경은 탈퇴한 회원을 의미합니다.</span>
      </div>

      {error && <div className={`${styles.statusMessage} ${styles.errorMessage}`}>{error}</div>}
      {successMessage && <div className={`${styles.statusMessage} ${styles.successMessage}`}>{successMessage}</div>}

      <div className={styles.filtersBar}>
        <div className={styles.filtersRow}>
          <label className={styles.filterUsernameField}>
            <span>회원명</span>
            <input
              name="username"
              value={filters.username}
              onChange={handleFilterInputChange}
              placeholder="검색할 아이디를 입력하세요"
            />
          </label>
          <label className={styles.filterEmailField}>
            <span>이메일</span>
            <input name="email" value={filters.email} onChange={handleFilterInputChange} placeholder="email@example.com" />
          </label>
          <label className={`${styles.filterLockField} ${styles.filterFieldSmall}`}>
            <span>정지 여부</span>
            <select name="isLock" value={filters.isLock} onChange={handleFilterSelectChange}>
              {MANAGE_USER_FILTER_OPTIONS.lock.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.filtersActions}>
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
            <button type="button" className={styles.resetButton} onClick={handleResetFilters} disabled={!hasActiveControls}>
              필터 초기화
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          renderLoadingOverlay()
        ) : (
          <>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>                            
                  {MANAGE_USER_TABLE_COLUMNS.map(({ key, label, width }) => {
                    const direction = sortState.field === key ? sortState.direction : null
                    return (
                      <th key={key} style={width ? { width } : undefined}>
                        <button type="button" className={styles.headerButton} onClick={() => handleSortChange(key)}>
                          <SortableHeader label={label} direction={direction} />
                        </button>
                      </th>
                    )
                  })}
                  <th style={{ width: '140px' }}>관리</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={MANAGE_USER_TABLE_COLUMNS.length + 1} className={styles.emptyState}>
                      표시할 회원이 없습니다.
                    </td>
                  </tr>
                )}
                {users.map((user) => {
                  const rowClassName = [
                    styles.tableRow,
                    user.isDeleted ? styles.deletedRow : '',
                    !user.isDeleted && user.isLock ? styles.lockedRow : '',
                  ]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <Fragment key={user.username}>
                      <tr className={rowClassName}>
                        <td className={styles.wordBreakCell}>{user.username}</td>
                        <td className={`${styles.wordBreakCell} ${styles.emailCell}`}>{user.email || '—'}</td>
                        <td className={styles.wordBreakCell}>{user.nickname || '—'}</td>
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
                          </div>
                        </td>
                      </tr>
                      {editingUser === user.username && (
                        <tr
                          className={[
                            styles.expandedRow,
                            user.isDeleted ? styles.deletedRow : '',
                            !user.isDeleted && user.isLock ? styles.lockedRow : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <td colSpan={MANAGE_USER_TABLE_COLUMNS.length + 1}>
                            <form className={styles.editForm} onSubmit={(event) => handleEditSubmit(event, user)}>
                              <div className={`${styles.formField} ${styles.formFieldCompact}`}>
                                <label htmlFor={`nickname-${user.username}`} className={styles.formLabel}>
                                  닉네임
                                </label>
                                <input
                                  id={`nickname-${user.username}`}
                                  name="nickname"
                                  value={editForm.nickname}
                                  onChange={handleNicknameChange}
                                  className={styles.formInput}
                                />
                              </div>
                              <div className={`${styles.formField} ${styles.formFieldWide}`}>
                                <label htmlFor={`email-front-${user.username}`} className={styles.formLabel}>
                                  이메일
                                </label>
                                <div className={styles.boxEmail}>
                                  <div
                                    className={`${styles.boxInput} ${
                                      editForm.emailFront.trim() ? styles.hasValue : ''
                                    }`}
                                  >
                                    <input
                                      id={`email-front-${user.username}`}
                                      value={editForm.emailFront}
                                      onChange={handleEmailFrontChange}
                                      className={`${styles.inputInfo} ${styles.emailInput}`}
                                      placeholder="이메일 앞자리"
                                    />
                                  </div>
                                  <span className={styles.textAt}>@</span>
                                  <div ref={emailDropdownRef} className={styles.boxSelect}>
                                    {editForm.isDirectInput ? (
                                      <input
                                        value={editForm.emailBack}
                                        onChange={handleEmailBackInputChange}
                                        className={`${styles.domainInputField} ${
                                          editForm.emailBack.trim() ? styles.hasValue : ''
                                        }`}
                                        placeholder="도메인을 입력하세요"
                                      />
                                    ) : (
                                      <div
                                        className={`${styles.domainDisplayField} ${
                                          editForm.emailBack.trim() ? styles.hasValue : ''
                                        }`}
                                        onClick={() => setIsEmailDomainOpen((prev) => !prev)}
                                      >
                                        {editForm.emailBack || '도메인을 선택하세요'}
                                      </div>
                                    )}
                                    <div
                                      className={styles.selectArrowContainer}
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        setIsEmailDomainOpen((prev) => !prev)
                                      }}
                                    >
                                      <span className={styles.selectArrow}>{isEmailDomainOpen ? '▲' : '▼'}</span>
                                    </div>
                                    {isEmailDomainOpen && (
                                      <div className={styles.boxLayer}>
                                        <ul className={styles.listAdress}>
                                          <li className={styles.listItem}>
                                            <button
                                              type="button"
                                              className={styles.buttonMail}
                                              onClick={() => handleDomainSelect('직접입력')}
                                            >
                                              직접입력
                                            </button>
                                          </li>
                                          {EMAIL_DOMAINS.map((domain) => (
                                            <li key={domain} className={styles.listItem}>
                                              <button
                                                type="button"
                                                className={styles.buttonMail}
                                                onClick={() => handleDomainSelect(domain)}
                                              >
                                                {domain}
                                              </button>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className={styles.formActions}>
                                <button type="button" className={styles.cancelButton} onClick={handleEditCancel}>
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
                  )
                })}
              </tbody>
            </table>
            {!loading && totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
