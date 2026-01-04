'use client'

import { useMemo, useState, useEffect, useCallback, MouseEvent, useRef } from 'react'
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
import { useRouter, useSearchParams } from 'next/navigation'
import { ensureAuthSession } from '@/lib/common/api/fetchWithAuth'

const badgeClassMap: Record<BoardType, string> = {
    NOTICE: styles.badgeNOTICE,
    FAQ: styles.badgeFAQ,
    EVENT: styles.badgeEVENT,
};

const isValidBoardType = (value: string | null): value is BoardType => {
    return value === 'NOTICE' || value === 'FAQ' || value === 'EVENT'
}

const isValidBoardSearchType = (value: string | null): value is BoardSearchType => {
    return value === 'TITLE' || value === 'CONTENT' || value === 'TITLE_OR_CONTENT'
}

const parsePageParam = (value: string | null) => {
    if (!value) {
        return 0
    }
    const parsed = Number(value)
    if (Number.isNaN(parsed) || parsed < 1) {
        return 0
    }
    return Math.max(parsed - 1, 0)
}

export default function BoardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()

  const initialKeyword = searchParams.get('keyword') ?? ''
  const initialSearchType = isValidBoardSearchType(searchParams.get('searchType'))
    ? (searchParams.get('searchType') as BoardSearchType)
    : 'TITLE_OR_CONTENT'
  const initialBoardTypeParam = searchParams.get('boardType')
  const initialBoardType: 'ALL' | BoardType = isValidBoardType(initialBoardTypeParam)
    ? (initialBoardTypeParam as BoardType)
    : 'ALL'
  const initialPage = parsePageParam(searchParams.get('page'))

  const [page, setPage] = useState(initialPage)
  const [searchQuery, setSearchQuery] = useState(initialKeyword)
  const [keyword, setKeyword] = useState(initialKeyword)
  const [searchType, setSearchType] = useState<BoardSearchType>(initialSearchType)
  const [boardTypeFilter, setBoardTypeFilter] = useState<'ALL' | BoardType>(
    initialKeyword ? initialBoardType : 'ALL'
  )
  const [isPreparingWrite, setIsPreparingWrite] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  // 커스텀 드롭다운 상태
  const [showSearchTypeDropdown, setShowSearchTypeDropdown] = useState(false)
  const [showBoardTypeDropdown, setShowBoardTypeDropdown] = useState(false)
  const searchTypeRef = useRef<HTMLDivElement>(null)
  const boardTypeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (searchTypeRef.current && !searchTypeRef.current.contains(event.target as Node)) {
        setShowSearchTypeDropdown(false)
      }
      if (boardTypeRef.current && !boardTypeRef.current.contains(event.target as Node)) {
        setShowBoardTypeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const emptyMessage = isSearchMode ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.'

  const syncUrlState = useCallback(
    (overrides?: Partial<{
      page: number
      keyword: string
      searchType: BoardSearchType
      boardTypeFilter: 'ALL' | BoardType
    }>) => {
      const targetPage = overrides?.page ?? page
      const targetKeyword = overrides?.keyword ?? keyword
      const targetSearchType = overrides?.searchType ?? searchType
      const targetBoardType = overrides?.boardTypeFilter ?? boardTypeFilter

      const params = new URLSearchParams()
      if (targetPage > 0) {
        params.set('page', String(targetPage + 1))
      }
      if (targetKeyword.trim()) {
        params.set('keyword', targetKeyword.trim())
        params.set('searchType', targetSearchType)
        if (targetBoardType !== 'ALL') {
          params.set('boardType', targetBoardType)
        }
      }
      const queryString = params.toString()
      const nextUrl = queryString ? `/admin/boards?${queryString}` : '/admin/boards'
      router.replace(nextUrl, { scroll: false })
    },
    [router, page, keyword, searchType, boardTypeFilter]
  )

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString)
    const nextPage = parsePageParam(params.get('page'))
    const nextKeyword = params.get('keyword') ?? ''
    const nextSearchTypeParam = params.get('searchType')
    const resolvedSearchType: BoardSearchType =
      nextKeyword && isValidBoardSearchType(nextSearchTypeParam)
        ? (nextSearchTypeParam as BoardSearchType)
        : 'TITLE_OR_CONTENT'
    const nextBoardTypeParam = params.get('boardType')
    const resolvedBoardType: 'ALL' | BoardType =
      nextKeyword && isValidBoardType(nextBoardTypeParam)
        ? (nextBoardTypeParam as BoardType)
        : 'ALL'

    setPage(nextPage)
    setKeyword(nextKeyword)
    setSearchQuery(nextKeyword)
    setSearchType(resolvedSearchType)
    setBoardTypeFilter(resolvedBoardType)
  }, [searchParamsString])

  const handleSearch = () => {
    const trimmed = searchQuery.trim()
    if (!trimmed) {
      setKeyword('')
      setSearchType('TITLE_OR_CONTENT')
      setBoardTypeFilter('ALL')
      setPage(0)
      router.replace('/admin/boards', { scroll: false })
      return
    }

    setKeyword(trimmed)
    setPage(0)
    syncUrlState({ keyword: trimmed, page: 0 })
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSearch()
    }
  }

    const getDisplayNumber = (index: number) => {
        return totalElements - (currentPageIndex * BOARD_PAGE_SIZE + index);
    };

  const handlePageChange = (pageIndex: number) => {
    const nextPage = Math.max(pageIndex - 1, 0)
    setPage(nextPage)
    syncUrlState({ page: nextPage })
  }

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
                        {/* 검색 조건 드롭다운 */}
                        <div 
                            ref={searchTypeRef}
                            className={`${styles.boxSelect} ${showSearchTypeDropdown ? styles.on : ''}`}
                        >
                            <button 
                                type="button" 
                                className={styles.selectDisplayField}
                                onClick={() => setShowSearchTypeDropdown(!showSearchTypeDropdown)}
                            >
                                {BOARD_SEARCH_TYPE_OPTIONS.find(opt => opt.value === searchType)?.label || '검색 조건'}
                            </button>
                            <div className={styles.selectArrowContainer} onClick={() => setShowSearchTypeDropdown(!showSearchTypeDropdown)}>
                                <span className={styles.selectArrowIcon}></span>
                            </div>
                            <div className={styles.boxLayer}>
                                <ul className={styles.listOptions}>
                                    {BOARD_SEARCH_TYPE_OPTIONS.map((option) => (
                                        <li key={option.value} className={styles.listItem}>
                                            <button
                                                type="button"
                                                className={`${styles.buttonOption} ${option.value === searchType ? styles.buttonOptionSelected : ''}`}
                                                onClick={() => {
                                                    const nextType = option.value as BoardSearchType
                                                    setSearchType(nextType)
                                                    setShowSearchTypeDropdown(false)
                                                    if (keyword) {
                                                        setPage(0)
                                                        syncUrlState({ searchType: nextType, page: 0 })
                                                    }
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* 게시글 타입 드롭다운 */}
                        <div 
                            ref={boardTypeRef}
                            className={`${styles.boxSelect} ${showBoardTypeDropdown ? styles.on : ''}`}
                        >
                            <button 
                                type="button" 
                                className={styles.selectDisplayField}
                                onClick={() => setShowBoardTypeDropdown(!showBoardTypeDropdown)}
                            >
                                {boardTypeFilter === 'ALL' ? '전체' : (BOARD_TYPE_LABELS[boardTypeFilter] || boardTypeFilter)}
                            </button>
                            <div className={styles.selectArrowContainer} onClick={() => setShowBoardTypeDropdown(!showBoardTypeDropdown)}>
                                <span className={styles.selectArrowIcon}></span>
                            </div>
                            <div className={styles.boxLayer}>
                                <ul className={styles.listOptions}>
                                    <li className={styles.listItem}>
                                        <button
                                            type="button"
                                            className={`${styles.buttonOption} ${boardTypeFilter === 'ALL' ? styles.buttonOptionSelected : ''}`}
                                            onClick={() => {
                                                setBoardTypeFilter('ALL')
                                                setShowBoardTypeDropdown(false)
                                                if (keyword) {
                                                    setPage(0)
                                                    syncUrlState({ boardTypeFilter: 'ALL', page: 0 })
                                                }
                                            }}
                                        >
                                            전체
                                        </button>
                                    </li>
                                    {BOARD_TYPE_OPTIONS.map((option) => (
                                        <li key={option} className={styles.listItem}>
                                            <button
                                                type="button"
                                                className={`${styles.buttonOption} ${boardTypeFilter === option ? styles.buttonOptionSelected : ''}`}
                                                onClick={() => {
                                                    const nextType = option as 'ALL' | BoardType
                                                    setBoardTypeFilter(nextType)
                                                    setShowBoardTypeDropdown(false)
                                                    if (keyword) {
                                                        setPage(0)
                                                        syncUrlState({ boardTypeFilter: nextType, page: 0 })
                                                    }
                                                }}
                                            >
                                                {BOARD_TYPE_LABELS[option]}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {listContent()}
        </div>
  )
}
