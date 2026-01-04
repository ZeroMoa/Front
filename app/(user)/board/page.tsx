"use client"

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import Image from 'next/image';
import CircularProgress from '@mui/material/CircularProgress';
import { useBoards } from '../hooks/useBoard';
import { BOARD_TYPE_LABELS, BOARD_TYPE_OPTIONS, BOARD_SEARCH_TYPE_OPTIONS } from '@/constants/boardConstants';
import { BoardResponse, BoardSearchType, BoardType } from '@/types/boardTypes';
import { getCdnUrl } from '@/lib/cdn';
import Pagination from '@/components/pagination/Pagination';
import { useRouter, useSearchParams } from 'next/navigation';

const PAGE_SIZE = 10;
const MAX_VISIBLE_PAGES = 7;

const badgeClassMap: Record<BoardType, string> = {
    NOTICE: styles.badgeNOTICE,
    FAQ: styles.badgeFAQ,
    EVENT: styles.badgeEVENT,
};

const isValidBoardType = (value: string | null): value is BoardType => {
    return value === 'NOTICE' || value === 'FAQ' || value === 'EVENT';
};

const isValidBoardSearchType = (value: string | null): value is BoardSearchType => {
    return value === 'TITLE' || value === 'CONTENT' || value === 'TITLE_OR_CONTENT';
};

const parsePageParam = (value: string | null) => {
    if (!value) {
        return 0;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 1) {
        return 0;
    }
    return Math.max(parsed - 1, 0);
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
    const searchParams = useSearchParams();
    const searchParamsString = searchParams.toString();

    const initialKeyword = searchParams.get('keyword') ?? '';
    const initialSearchType = isValidBoardSearchType(searchParams.get('searchType'))
        ? (searchParams.get('searchType') as BoardSearchType)
        : 'TITLE_OR_CONTENT';
    const initialBoardTypeParam = searchParams.get('boardType');
    const initialBoardType: 'ALL' | BoardType = isValidBoardType(initialBoardTypeParam)
        ? (initialBoardTypeParam as BoardType)
        : 'ALL';
    const initialPage = parsePageParam(searchParams.get('page'));

    const [page, setPage] = useState(initialPage);
    const [searchQuery, setSearchQuery] = useState(initialKeyword);
    const [keyword, setKeyword] = useState(initialKeyword);
    const [searchType, setSearchType] = useState<BoardSearchType>(initialSearchType);
    const [boardTypeFilter, setBoardTypeFilter] = useState<'ALL' | BoardType>(
        initialKeyword ? initialBoardType : 'ALL'
    );

    // 커스텀 드롭다운 상태
    const [showSearchTypeDropdown, setShowSearchTypeDropdown] = useState(false);
    const [showBoardTypeDropdown, setShowBoardTypeDropdown] = useState(false);
    const searchTypeRef = useRef<HTMLDivElement>(null);
    const boardTypeRef = useRef<HTMLDivElement>(null);

    // 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchTypeRef.current && !searchTypeRef.current.contains(event.target as Node)) {
                setShowSearchTypeDropdown(false);
            }
            if (boardTypeRef.current && !boardTypeRef.current.contains(event.target as Node)) {
                setShowBoardTypeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const syncUrlState = useCallback((overrides?: Partial<{
        page: number;
        keyword: string;
        searchType: BoardSearchType;
        boardTypeFilter: 'ALL' | BoardType;
    }>) => {
        const targetPage = overrides?.page ?? page;
        const targetKeyword = overrides?.keyword ?? keyword;
        const targetSearchType = overrides?.searchType ?? searchType;
        const targetBoardType = overrides?.boardTypeFilter ?? boardTypeFilter;

        const params = new URLSearchParams();
        if (targetPage > 0) {
            params.set('page', String(targetPage + 1));
        }
        if (targetKeyword.trim()) {
            params.set('keyword', targetKeyword.trim());
            params.set('searchType', targetSearchType);
            if (targetBoardType !== 'ALL') {
                params.set('boardType', targetBoardType);
            }
        }
        const queryString = params.toString();
        const nextUrl = queryString ? `/board?${queryString}` : '/board';
        router.replace(nextUrl, { scroll: false });
    }, [router, page, keyword, searchType, boardTypeFilter]);

    useEffect(() => {
        const params = new URLSearchParams(searchParamsString);
        const nextPage = parsePageParam(params.get('page'));
        const nextKeyword = params.get('keyword') ?? '';
        const nextSearchTypeParam = params.get('searchType');
        const resolvedSearchType: BoardSearchType = nextKeyword && isValidBoardSearchType(nextSearchTypeParam)
            ? (nextSearchTypeParam as BoardSearchType)
            : 'TITLE_OR_CONTENT';
        const nextBoardTypeParam = params.get('boardType');
        const resolvedBoardType: 'ALL' | BoardType = nextKeyword && isValidBoardType(nextBoardTypeParam)
            ? (nextBoardTypeParam as BoardType)
            : 'ALL';

        setPage(nextPage);
        setKeyword(nextKeyword);
        setSearchQuery(nextKeyword);
        setSearchType(resolvedSearchType);
        setBoardTypeFilter(resolvedBoardType);
    }, [searchParamsString]);

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
            setSearchQuery('');
            setKeyword('');
            setSearchType('TITLE_OR_CONTENT');
            setBoardTypeFilter('ALL');
            setPage(0);
            router.replace('/board', { scroll: false });
            return;
        }

        setKeyword(trimmed);
        setPage(0);
        syncUrlState({ keyword: trimmed, page: 0 });
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
        const nextPage = Math.max(pageIndex - 1, 0);
        setPage(nextPage);
        syncUrlState({ page: nextPage });
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
        router.replace('/board', { scroll: false });
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
                                                    setSearchType(option.value);
                                                    setShowSearchTypeDropdown(false);
                                                    if (keyword) {
                                                        setPage(0);
                                                        syncUrlState({ searchType: option.value, page: 0 });
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
                                                setBoardTypeFilter('ALL');
                                                setShowBoardTypeDropdown(false);
                                                if (keyword) {
                                                    setPage(0);
                                                    syncUrlState({ boardTypeFilter: 'ALL', page: 0 });
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
                                                    setBoardTypeFilter(option);
                                                    setShowBoardTypeDropdown(false);
                                                    if (keyword) {
                                                        setPage(0);
                                                        syncUrlState({ boardTypeFilter: option, page: 0 });
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
    );
}
