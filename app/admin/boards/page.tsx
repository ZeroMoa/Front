'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import Image from 'next/image'
import { useAdminBoards } from '@/app/admin/hooks/boardHooks'
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

const badgeClassMap: Record<BoardType, string> = {
    NOTICE: styles.badgeNOTICE,
    FAQ: styles.badgeFAQ,
    EVENT: styles.badgeEVENT,
};

export default function BoardPage() {
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [keyword, setKeyword] = useState('')
  const [searchType, setSearchType] = useState<BoardSearchType>('TITLE_OR_CONTENT')
  const [boardTypeFilter, setBoardTypeFilter] = useState<'ALL' | BoardType>('ALL')

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

  const notices: BoardResponse[] = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPageIndex = data?.number ?? 0

    const emptyMessage = isSearchMode ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.';

    const handleSearch = () => {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setKeyword('');
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

    const listContent = () => {
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

    if (isLoading) {
    return null
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
                <h1>공지사항</h1>
                <div className={styles.topInfo}>
                    <span>Total {totalElements}건 / {currentPageIndex + 1}페이지</span>
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
                setSearchType(event.target.value as BoardSearchType)
                setPage(0)
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
                setBoardTypeFilter(event.target.value as 'ALL' | BoardType)
                setPage(0)
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
                <Link href="/admin/boards/write">
                    <button className={styles.writeButton}>글쓰기</button>
                </Link>
            </div>

            {listContent()}
        </div>
  )
}
