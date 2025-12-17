'use client'

import { useMemo, useState, MouseEvent } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import Image from 'next/image'
import { useAdminBoards, useDeleteAdminBoard } from '@/app/admin/hooks/boardHooks'
import {
  BOARD_DEFAULT_SORT,
  BOARD_MAX_VISIBLE_PAGES,
  BOARD_PAGE_SIZE,
  BOARD_SEARCH_TYPE_OPTIONS,
  BOARD_TYPE_LABELS,
  BOARD_TYPE_OPTIONS,
} from '@/constants/boardConstants'
import { BoardResponse, BoardSearchType, BoardType } from '@/types/boardTypes'
import { getCdnUrl } from '@/lib/cdn'
import Pagination from '@/components/pagination/Pagination'
import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/navigation'
import { ensureAuthSession } from '@/lib/common/api/fetchWithAuth'

const badgeClassMap: Record<BoardType, string> = {
    NOTICE: styles.badgeNOTICE,
    FAQ: styles.badgeFAQ,
    EVENT: styles.badgeEVENT,
};

export default function BoardPage() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [keyword, setKeyword] = useState('')
  const [searchType, setSearchType] = useState<BoardSearchType>('TITLE_OR_CONTENT')
  const [boardTypeFilter, setBoardTypeFilter] = useState<'ALL' | BoardType>('ALL')
  const [isPreparingWrite, setIsPreparingWrite] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const isSearchMode = keyword.trim().length > 0

  const listParams = useMemo(
    () => ({
      page,
      size: BOARD_PAGE_SIZE,
      sort: BOARD_DEFAULT_SORT,
      keyword: keyword || undefined,
      searchType: isSearchMode ? searchType : undefined,
      boardType: isSearchMode && boardTypeFilter !== 'ALL' ? boardTypeFilter : undefined,
    }),
    [page, keyword, searchType, boardTypeFilter, isSearchMode]
  )

  const { data, isLoading, isError, error } = useAdminBoards(listParams)
  const deleteMutation = useDeleteAdminBoard()

  const notices: BoardResponse[] = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPageIndex = data?.number ?? 0

    const emptyMessage = isSearchMode ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.';

    const handleSearch = () => {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setKeyword('');
            setSearchType('TITLE_OR_CONTENT');
            setBoardTypeFilter('ALL');
            setPage(0);
            return;
        }
        setKeyword(trimmed);
        setPage(0);
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    };

    const getDisplayNumber = (index: number) => {
        return totalElements - (currentPageIndex * BOARD_PAGE_SIZE + index);
    };

    const handlePageChange = (pageIndex: number) => {
        setPage(Math.max(pageIndex - 1, 0));
    };

  const handleWriteClick = async () => {
    if (isPreparingWrite) {
      return
    }
    setIsPreparingWrite(true)
    try {
      await ensureAuthSession({ showAlertOnFail: true })
      router.push('/admin/boards/write')
    } catch (sessionError) {
      if (sessionError instanceof Error) {
        console.error('세션 갱신 중 오류:', sessionError)
      }
    } finally {
      setIsPreparingWrite(false)
    }
  }

  const handleEditBoard = (event: MouseEvent<HTMLButtonElement>, boardNo: number) => {
    event.preventDefault()
    event.stopPropagation()
    router.push(`/admin/boards/edit?boardNo=${boardNo}`)
  }

  const handleDeleteBoard = async (event: MouseEvent<HTMLButtonElement>, notice: BoardResponse) => {
    event.preventDefault()
    event.stopPropagation()
    if (pendingDeleteId !== null) {
      return
    }
    const confirmed = window.confirm('이 게시글을 삭제하시겠습니까?')
    if (!confirmed) {
      return
    }
    setPendingDeleteId(notice.boardNo)
    try {
      await deleteMutation.mutateAsync(notice.boardNo)
      alert('게시글이 삭제되었습니다.')
    } catch (mutationError) {
      alert(mutationError instanceof Error ? mutationError.message : '게시글 삭제 중 오류가 발생했습니다.')
    } finally {
      setPendingDeleteId(null)
    }
  }

  const handleHeadingClick = () => {
    if (isLoading) {
      return
    }
    setSearchQuery('')
    setKeyword('')
    setSearchType('TITLE_OR_CONTENT')
    setBoardTypeFilter('ALL')
    setPage(0)
    router.replace('/admin/boards')
  }

  const listContent = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingState}>
          <CircularProgress size={32} />
          <span>게시글을 불러오는 중입니다...</span>
        </div>
      )
    }

    if (notices.length === 0) {
      return <div className={styles.noNotices}>{emptyMessage}</div>
    }

    return (
      <>
        <div className={styles.noticeTable}>
          <div className={styles.tableHeader}>
            <span className={styles.headerNo}>번호</span>
            <span className={styles.headerTitle}>제목</span>
            <span className={styles.headerDate}>작성일자</span>
            <span className={styles.headerManage}>관리</span>
          </div>
          {notices.map((notice, index) => (
            <Link href={`/admin/boards/${notice.boardNo}`} key={notice.boardNo} className={styles.noticeLink}>
              <div className={styles.noticeItem}>
                <span className={styles.itemNo}>{getDisplayNumber(index)}</span>
                <div className={styles.itemTitle}>
                  <span className={`${styles.noticeBadge} ${badgeClassMap[notice.boardType] ?? ''}`}>
                    {BOARD_TYPE_LABELS[notice.boardType] ?? notice.boardType}
                  </span>
                  <span className={styles.itemTitleText}>{notice.title}</span>
                </div>
                <span className={styles.itemDate}>
                  {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                </span>
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={(event) => handleEditBoard(event, notice.boardNo)}
                    aria-label="게시글 수정"
                  >
                    <Image src={getCdnUrl('/images/write.png')} alt="수정" width={20} height={20} />
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={(event) => handleDeleteBoard(event, notice)}
                    aria-label="게시글 삭제"
                    disabled={pendingDeleteId === notice.boardNo}
                  >
                    <Image src={getCdnUrl('/images/delete.png')} alt="삭제" width={20} height={20} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 0 && (
          <Pagination
            currentPage={currentPageIndex + 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageGroupSize={BOARD_MAX_VISIBLE_PAGES}
          />
        )}
      </>
    )
  }

    if (isError) {
        return (
            <div className={styles.container}>
                <div className={styles.errorBox}>
                    {error instanceof Error ? error.message : '게시글을 불러오지 못했습니다.'}
                </div>
            </div>
    )
    }

    return (
        <div className={styles.container}>
            <div className={styles.headerSection}>
                <div className={styles.headerTitleGroup}>
                    <h1>
                      <button
                        type="button"
                        className={styles.headingButton}
                        onClick={handleHeadingClick}
                        aria-label="공지사항 메인으로 이동"
                      >
                        공지사항
                      </button>
                    </h1>
                    <span className={styles.topInfo}>Total {totalElements}건 / {currentPageIndex + 1}페이지</span>
                </div>
                <div className={styles.headerActions}>
                    <button
                      type="button"
                      className={styles.writeButton}
                      onClick={handleWriteClick}
                      disabled={isPreparingWrite}
                    >
                      {isPreparingWrite ? '준비 중...' : '글쓰기'}
                    </button>
                </div>
            </div>

            <div className={styles.searchAndWriteSection}>
                <div className={styles.searchControls}>
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="검색어를 입력해주세요."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className={styles.searchButton} onClick={handleSearch}>
                            <Image src={getCdnUrl('/images/search.png')} alt="검색" width={20} height={20} />
                        </button>
                    </div>
                    <div className={styles.filterSelects}>
                        <select
                            className={styles.selectField}
                            value={searchType}
                            onChange={(event) => {
                                const nextType = event.target.value as BoardSearchType
                                setSearchType(nextType)
                                if (keyword) {
                                    setPage(0)
                                }
                            }}
                        >
                            {BOARD_SEARCH_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <select
                            className={styles.selectField}
                            value={boardTypeFilter}
                            onChange={(event) => {
                                const nextType = event.target.value as 'ALL' | BoardType
                                setBoardTypeFilter(nextType)
                                if (keyword) {
                                    setPage(0)
                                }
                            }}
                        >
                            <option value="ALL">전체</option>
                            {BOARD_TYPE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {BOARD_TYPE_LABELS[option]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
            </div>

            {listContent()}
        </div>
  )
}
