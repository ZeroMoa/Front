'use client'

import { useMemo, useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import Pagination from '@/components/pagination/Pagination'
import { getCdnUrl } from '@/lib/cdn'
import {
  useAdminNotifications,
  useDeleteAdminNotification,
  useUpdateAdminNotification,
  useUpdateAdminNotificationStatus,
} from '@/app/admin/hooks/notificationHooks'
import type { AdminNotificationResponse } from '@/types/notificationTypes'
import {
  formatDateTime,
  INITIAL_FILTERS,
  INITIAL_SORT_STATE,
  PAGE_SIZE_OPTIONS,
  SORT_FIELD_MAP,
  TABLE_COLUMNS,
  type FiltersState,
  type SortKey,
  type SortState,
} from '@/constants/adminNotificationsConstants'
import { createNotificationQueryParams } from '@/lib/utils/notificationUtils'

function nextSortState(current: SortState, field: SortKey): SortState {
  if (current.field !== field) {
    return { field, direction: 'asc' }
  }

  if (current.direction === 'asc') {
    return { field, direction: 'desc' }
  }

  return INITIAL_SORT_STATE
}

export default function AdminNotificationsPage() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [sortState, setSortState] = useState(INITIAL_SORT_STATE)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [editingTarget, setEditingTarget] = useState<AdminNotificationResponse | null>(null)
  const [editForm, setEditForm] = useState({ title: '', content: '', boardNo: '' })

  const sortParam =
    sortState.field && sortState.direction ? `${SORT_FIELD_MAP[sortState.field]},${sortState.direction}` : undefined

  const params = useMemo(
    () =>
      createNotificationQueryParams({
        page,
        size: pageSize,
        sort: sortParam,
        isActive: filters.isActive !== 'all' ? filters.isActive : undefined,
      }),
    [filters.isActive, page, pageSize, sortParam]
  )

  const { data, isLoading, isError, error, refetch } = useAdminNotifications(params)
  const updateMutation = useUpdateAdminNotification()
  const statusMutation = useUpdateAdminNotificationStatus()
  const deleteMutation = useDeleteAdminNotification()
  const isUpdating = updateMutation.status === 'pending'

  const filteredContent = useMemo(() => {
    if (!data?.content) return []

    return data.content.filter((notification) => {
      const matchTitle = filters.title
        ? notification.title.toLowerCase().includes(filters.title.toLowerCase())
        : true

      const matchBoardNo = filters.boardNo
        ? String(notification.boardNo).includes(filters.boardNo.trim())
        : true

      const matchActive =
        filters.isActive === 'all'
          ? true
          : filters.isActive === 'true'
          ? notification.isActive
          : !notification.isActive

      return matchTitle && matchBoardNo && matchActive
    })
  }, [data?.content, filters.boardNo, filters.isActive, filters.title])

  const displayNumberMapRef = useRef<Record<string, number>>({})
  const nextDisplayNoRef = useRef(1)

  useEffect(() => {
    const notifications = filteredContent
    notifications.forEach((notification) => {
      const pairKey = `${notification.adminNotificationNo}-${notification.boardNo ?? 'null'}`
      if (!displayNumberMapRef.current[pairKey]) {
        displayNumberMapRef.current[pairKey] = nextDisplayNoRef.current
        nextDisplayNoRef.current += 1
      }
    })
  }, [filteredContent])

  const totalElements = data?.totalElements ?? filteredContent.length
  const totalPages = data?.totalPages ?? 0
  const currentPage = data?.number ?? page
  const baseRowNumber = currentPage * pageSize
  const isDefaultFilters =
    filters.title === INITIAL_FILTERS.title &&
    filters.boardNo === INITIAL_FILTERS.boardNo &&
    filters.isActive === INITIAL_FILTERS.isActive
  const isDefaultSort =
    sortState.field === INITIAL_SORT_STATE.field && sortState.direction === INITIAL_SORT_STATE.direction

  const handleSort = (field: SortKey) => {
    const next = nextSortState(sortState, field)
    setSortState(next)
    setPage(0)
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
  }

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSize = Number(event.target.value)
    setPageSize(nextSize)
    setPage(0)
  }

  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const handleResetFilters = () => {
    setFilters({ ...INITIAL_FILTERS })
    setSortState({ ...INITIAL_SORT_STATE })
    setPage(0)
  }

  const openEditModal = (notification: AdminNotificationResponse) => {
    setEditingTarget(notification)
    setEditForm({
      title: notification.title,
      content: notification.content ?? '',
      boardNo: notification.boardNo ? String(notification.boardNo) : '',
    })
  }

  const closeEditModal = () => {
    setEditingTarget(null)
  }

  const handleEditFormChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingTarget) return

    const boardNoValue = Number(editForm.boardNo)

    try {
      await updateMutation.mutateAsync({
        adminNotificationNo: editingTarget.adminNotificationNo,
        data: {
          title: editForm.title.trim(),
          content: editForm.content.trim(),
          boardNo: boardNoValue,
        },
      })
      alert('알림이 수정되었습니다.')
      closeEditModal()
      refetch()
    } catch (mutationError) {
      alert(mutationError instanceof Error ? mutationError.message : '알림 수정 중 오류가 발생했습니다.')
    }
  }

  const handleToggleActive = async (notification: AdminNotificationResponse) => {
    try {
      await statusMutation.mutateAsync({
        adminNotificationNo: notification.adminNotificationNo,
        data: { isActive: !notification.isActive },
      })
      refetch()
    } catch (mutationError) {
      alert(mutationError instanceof Error ? mutationError.message : '활성화 상태 변경 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (notification: AdminNotificationResponse) => {
    const confirmed = window.confirm('이 알림을 삭제하면 연결된 사용자 알림도 함께 삭제됩니다. 계속하시겠습니까?')
    if (!confirmed) return

    try {
      await deleteMutation.mutateAsync(notification.adminNotificationNo)
      refetch()
    } catch (mutationError) {
      alert(mutationError instanceof Error ? mutationError.message : '알림 삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <div className={styles.headerSection}>
        <div className={styles.titleColumn}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>관리자 알림</h1>
            <span className={styles.resultInfo}>총 {totalElements.toLocaleString()}건</span>
          </div>
        </div>

      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            제목
            <div className={styles.filterInputContainer}>
            <input
              type="text"
              value={filters.title}
              onChange={(event) => handleFilterChange('title', event.target.value)}
              placeholder="게시글 제목을 입력하세요"
                className={styles.filterTextInput}
            />
              <Image src={getCdnUrl('/images/search.png')} alt="검색" width={20} height={20} className={styles.filterSearchIcon} />
            </div>
          </label>

          <label className={styles.filterLabel}>
            활성화 여부
            <select
              value={filters.isActive}
              onChange={(event) => handleFilterChange('isActive', event.target.value)}
            >
              <option value="all">전체</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </label>
        </div>
        <div className={styles.controlsGroup}>
          <label className={styles.pageSizeLabel}>
            페이지 크기
            <select className={styles.pageSizeSelect} value={pageSize} onChange={handlePageSizeChange}>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}개씩 보기
                </option>
              ))}
            </select>
          </label>
          {(!isDefaultFilters || !isDefaultSort) && (
        <button type="button" className={styles.resetButton} onClick={handleResetFilters}>
          필터 초기화
        </button>
          )}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeaderRow}>
          {TABLE_COLUMNS.map((column) => {
            const isActiveSort = sortState.field === column.key
            const directionSymbol =
              isActiveSort && sortState.direction
                ? sortState.direction === 'asc'
                  ? '▲'
                  : '▼'
                : '↕'

            return (
              <button
                key={column.key}
                type="button"
                className={styles.tableHeaderCell}
                style={{ width: column.width }}
                onClick={() => handleSort(column.key)}
              >
                <span>{column.label}</span>
                <span className={styles.sortIndicator}>{directionSymbol}</span>
              </button>
            )
          })}
          <div className={`${styles.tableHeaderCell} ${styles.actionsHeader}`}>관리</div>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>알림을 불러오는 중입니다...</div>
        ) : isError ? (
          <div className={styles.errorState}>
            {error instanceof Error ? error.message : '알림을 불러오지 못했습니다.'}
          </div>
        ) : filteredContent.length === 0 ? (
          <div className={styles.emptyState}>표시할 알림이 없습니다.</div>
        ) : (
          <ul className={styles.tableBody}>
            {filteredContent.map((notification, index) => {
              const [sentDate, sentTime] = formatDateTime(notification.sentAt)
              const [createdDate, createdTime] = formatDateTime(notification.createdDate)
              const [updatedDate, updatedTime] = formatDateTime(notification.updatedDate)
              const rowNumber = baseRowNumber + index + 1
              const pairKey = `${notification.adminNotificationNo}-${notification.boardNo ?? 'null'}`
              const displayNo = displayNumberMapRef.current[pairKey] ?? rowNumber
              return (
                <li key={notification.adminNotificationNo} className={styles.tableRow}>
                  <div className={styles.tableCell} style={{ width: TABLE_COLUMNS[0].width }}>
                    {displayNo}
                  </div>
                  <div className={styles.tableCell}>
                    {notification.title ? (
                      notification.boardNo ? (
                        <Link href={`/admin/boards/${notification.boardNo}`} className={styles.boardLink}>
                          {notification.title}
                        </Link>
                      ) : (
                        notification.title
                      )
                    ) : (
                      '—'
                    )}
                  </div>
                  <div className={styles.tableCell} style={{ width: TABLE_COLUMNS[2].width }}>
                    {displayNo}
                  </div>
                  <div className={styles.tableCell} style={{ width: TABLE_COLUMNS[3].width }}>
                    <span className={styles.dateLine}>{sentDate}</span>
                    <span className={styles.timeLine}>{sentTime}</span>
                  </div>
                  <div className={styles.tableCell} style={{ width: TABLE_COLUMNS[4].width }}>
                    <label
                      className={`${styles.toggleSwitch} ${notification.isActive ? styles.toggleSwitchActive : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={notification.isActive}
                        onChange={() => handleToggleActive(notification)}
                      />
                      <span className={styles.toggleButton} />
                    </label>
                  </div>
                  <div className={styles.tableCell} style={{ width: TABLE_COLUMNS[5].width }}>
                    <span className={styles.dateLine}>{createdDate}</span>
                    <span className={styles.timeLine}>{createdTime}</span>
                  </div>
                  <div className={styles.tableCell} style={{ width: TABLE_COLUMNS[6].width }}>
                    <span className={styles.dateLine}>{updatedDate}</span>
                    <span className={styles.timeLine}>{updatedTime}</span>
                  </div>
                  <div className={`${styles.tableCell} ${styles.actionsCell}`}>
                    <button type="button" className={styles.deleteButton} onClick={() => handleDelete(notification)}>
                      삭제
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className={styles.footer}>
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>

      {editingTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>알림 수정</h2>
            <form className={styles.modalForm} onSubmit={handleSubmitEdit}>
              <label className={styles.modalLabel}>
                제목
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  required
                />
              </label>
              <label className={styles.modalLabel}>
                내용
                <textarea
                  name="content"
                  value={editForm.content}
                  onChange={handleEditFormChange}
                  rows={6}
                  placeholder="알림 내용을 입력하세요"
                />
              </label>
              <label className={styles.modalLabel}>
                게시글 번호
                <input
                  name="boardNo"
                  value={editForm.boardNo}
                  onChange={handleEditFormChange}
                  required
                />
              </label>
              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancelButton} onClick={closeEditModal}>
                  취소
                </button>
                <button type="submit" className={styles.modalSubmitButton} disabled={isUpdating}>
                  {isUpdating ? '저장 중…' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
