"use client"

import { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import Image from 'next/image';
import CircularProgress from '@mui/material/CircularProgress';
import { useBoards } from '../hooks/useBoard';
import { BOARD_TYPE_LABELS, BOARD_TYPE_OPTIONS, BOARD_SEARCH_TYPE_OPTIONS } from '@/constants/boardConstants';
import { BoardResponse, BoardSearchType, BoardType } from '@/types/boardTypes';
import { getCdnUrl } from '@/lib/cdn';
import Pagination from '@/components/pagination/Pagination';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 10;
const MAX_VISIBLE_PAGES = 7;

const badgeClassMap: Record<BoardType, string> = {
    NOTICE: styles.badgeNOTICE,
    FAQ: styles.badgeFAQ,
    EVENT: styles.badgeEVENT,
};

const resolveErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
        const lowered = error.message.toLowerCase();
        if (lowered.includes('fetch failed') || lowered.includes('failed to fetch')) {
            return '게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
        }
        return error.message;
    }
    return '게시글을 불러오지 못했습니다.';
};

export default function BoardPage() {
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [keyword, setKeyword] = useState('');
    const [searchType, setSearchType] = useState<BoardSearchType>('TITLE_OR_CONTENT');
    const [boardTypeFilter, setBoardTypeFilter] = useState<'ALL' | BoardType>('ALL');

    const isSearchMode = keyword.trim().length > 0;

    const params = useMemo(() => {
        const searchParams = new URLSearchParams();
        searchParams.set('page', String(page));
        searchParams.set('size', String(PAGE_SIZE));
        searchParams.set('sort', 'boardNo,desc'); // boardNo 기준으로 내림차순 정렬 추가

        if (isSearchMode) {
            searchParams.set('keyword', keyword);
            searchParams.set('searchType', searchType);
            if (boardTypeFilter !== 'ALL') {
                searchParams.set('boardType', boardTypeFilter);
            }
        }

        return searchParams;
    }, [page, keyword, searchType, boardTypeFilter, isSearchMode]);

    const { data, isLoading, isError, error } = useBoards(params, { search: isSearchMode });

    const notices: BoardResponse[] = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? 1;
    const currentPageIndex = data?.number ?? 0;

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
        return totalElements - (currentPageIndex * PAGE_SIZE + index);
    };

    const handlePageChange = (pageIndex: number) => {
        setPage(Math.max(pageIndex - 1, 0));
    };

    const emptyMessage = isSearchMode ? '조건에 맞는 게시글이 없습니다.' : '등록된 게시글이 없습니다.';

    const handleHeadingClick = () => {
        if (isLoading) {
            return;
        }
        setSearchQuery('');
        setKeyword('');
        setSearchType('TITLE_OR_CONTENT');
        setBoardTypeFilter('ALL');
        setPage(0);
        router.replace('/board');
    };

    const listContent = () => {
        if (isLoading) {
            return (
                <div className={styles.loadingBox}>
                    <CircularProgress size={32} />
                    <span>게시글을 불러오는 중입니다...</span>
                </div>
            );
        }

        if (notices.length === 0) {
            return <div className={styles.noNotices}>{emptyMessage}</div>;
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
                        <Link href={`/board/${notice.boardNo}`} key={notice.boardNo} className={styles.noticeLink}>
                            <div className={styles.noticeItem}>
                                <span className={styles.itemNo}>{getDisplayNumber(index)}</span>
                                <div className={styles.itemTitle}>
                                    <span
                                        className={`${styles.noticeBadge} ${badgeClassMap[notice.boardType] ?? ''}`}
                                    >
                                        {BOARD_TYPE_LABELS[notice.boardType] ?? notice.boardType}
                                    </span>
                                    <span className={styles.itemTitleText}>{notice.title}</span>
                                </div>
                                <span className={styles.itemDate}>{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {totalPages > 0 && (
                    <Pagination
                        currentPage={currentPageIndex + 1}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        pageGroupSize={MAX_VISIBLE_PAGES}
                    />
                )}
            </>
        );
    };

    if (isError) {
        return (
            <div className={styles.container}>
                <div className={styles.errorBox}>
                    <Image
                        src={getCdnUrl('/images/error.jpg')}
                        alt="에러"
                        width={420}
                        height={320}
                        className={styles.statusIcon}
                    />
                    <span>{resolveErrorMessage(error)}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.headerSection}>
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
                                const nextType = event.target.value as BoardSearchType;
                                setSearchType(nextType);
                                if (keyword) {
                                    setPage(0);
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
                                const nextType = event.target.value as 'ALL' | BoardType;
                                setBoardTypeFilter(nextType);
                                if (keyword) {
                                    setPage(0);
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
    );
}
