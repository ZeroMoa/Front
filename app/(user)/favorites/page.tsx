'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './page.module.css';
import ProductGrid from '../product/components/ProductGrid';
import ProductPagination from '../product/components/ProductPagination';
import { fetchFavoriteProducts } from '../store/api/userFavoriteApi';
import { ProductResponse } from '@/types/productTypes';
import { useIsLoggedIn } from '../hooks/useAuth';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT = 'createdDate,desc';
const PAGE_MIN = 1;

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'createdDate,desc', label: '좋아요 최신순' },
    { value: 'product.productName,asc', label: '제품명 오름차순' },
    { value: 'product.productName,desc', label: '제품명 내림차순' },
    { value: 'product.updatedDate,desc', label: '최신 업데이트순' },
    { value: 'product.likesCount,desc', label: '인기순' },
] as const;

export default function FavoritesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLoggedIn, isLoading: authLoading } = useIsLoggedIn();
    const alertShownRef = useRef(false);

    const pageParamRaw = searchParams.get('page');
    const sizeParamRaw = searchParams.get('size');
    const sortParamRaw = searchParams.get('sort');

    const displayPage = useMemo(() => {
        const parsed = Number(pageParamRaw);
        if (Number.isNaN(parsed) || parsed < PAGE_MIN) {
            return PAGE_MIN;
        }
        return Math.floor(parsed);
    }, [pageParamRaw]);

    const currentPageIndex = displayPage - 1;

    const currentSize = useMemo(() => {
        const parsed = Number(sizeParamRaw);
        if (Number.isNaN(parsed) || parsed <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.floor(parsed);
    }, [sizeParamRaw]);

    const normalizedSort = useMemo(() => {
        if (!sortParamRaw) {
            return DEFAULT_SORT;
        }
        const hasMatch = SORT_OPTIONS.some((option) => option.value === sortParamRaw);
        return hasMatch ? sortParamRaw : DEFAULT_SORT;
    }, [sortParamRaw]);

    const [data, setData] = useState<ProductResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasHydrated, setHasHydrated] = useState(false);
    const [hasCompletedInitialFetch, setHasCompletedInitialFetch] = useState(false);

    // 커스텀 드롭다운 상태
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);
    const pageSizeRef = useRef<HTMLDivElement>(null);

    // 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
            if (pageSizeRef.current && !pageSizeRef.current.contains(event.target as Node)) {
                setShowPageSizeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isLoggedIn && !alertShownRef.current) {
            alertShownRef.current = true;
            alert('로그인 후 이용해주세요~.~');
            router.replace('/');
        }
    }, [authLoading, isLoggedIn, router]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (authLoading || !isLoggedIn) {
                setHasCompletedInitialFetch(true);
                return;
            }

            setIsLoading(true);
            setHasCompletedInitialFetch(false);
            setError(null);

            try {
                const response = await fetchFavoriteProducts({
                    page: currentPageIndex,
                    size: currentSize,
                    sort: normalizedSort,
                });

                if (cancelled) {
                    return;
                }

                const totalPages = typeof response.totalPages === 'number' ? response.totalPages : 0;
                if (totalPages > 0 && currentPageIndex >= totalPages) {
                    const safeLastIndex = Math.max(0, totalPages - 1);
                    if (safeLastIndex !== currentPageIndex) {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', String(safeLastIndex + 1));
                        params.set('size', String(currentSize));
                        params.set('sort', normalizedSort);
                        router.replace(`/favorites?${params.toString()}`, { scroll: true });
                        return;
                    }
                }

                setData(response);
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : '좋아요한 제품을 불러오지 못했습니다.';
                    setError(message);
                    setData(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    setHasCompletedInitialFetch(true);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [authLoading, isLoggedIn, currentPageIndex, currentSize, normalizedSort, router, searchParams]);

    const totalElements = data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? 0;
    const currentContent = data?.content ?? [];
    const isFetching = authLoading || isLoading;
    const showLoadingState = !hasHydrated || isFetching || !hasCompletedInitialFetch;

    const headerDescription = error
        ? '좋아요한 제품을 불러오지 못했습니다.'
        : showLoadingState
        ? '좋아요 목록 불러오는 중...'
        : totalElements > 0
        ? `총 ${totalElements.toLocaleString()}개의 제품을 확인할 수 있어요.`
        : '좋아요한 제품을 찾을 수 없어요.';

    const handlePageChange = useCallback(
        (nextPage: number) => {
            const safePage = Math.max(PAGE_MIN, Math.floor(nextPage));
            if (safePage === displayPage) {
                return;
            }
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(safePage));
            params.set('size', String(currentSize));
            params.set('sort', normalizedSort);
            router.replace(`/favorites?${params.toString()}`, { scroll: true });
        },
        [currentSize, normalizedSort, router, searchParams, displayPage],
    );

    const pageSizeOptions = useMemo(() => [20, 40, 60], []);

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>좋아요한 상품</h1>
                    <p className={styles.description}>{headerDescription}</p>
                </div>
                <div className={styles.controls}>
                    <div className={styles.sortLabel}>
                        <span className={styles.labelText}>정렬</span>
                        <div 
                            ref={sortRef}
                            className={`${styles.boxSelect} ${showSortDropdown ? styles.on : ''}`}
                        >
                            <button 
                                type="button" 
                                className={styles.selectDisplayField}
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                            >
                                {SORT_OPTIONS.find(opt => opt.value === normalizedSort)?.label || '정렬'}
                            </button>
                            <div className={styles.selectArrowContainer} onClick={() => setShowSortDropdown(!showSortDropdown)}>
                                <span className={styles.selectArrowIcon}></span>
                            </div>
                            <div className={styles.boxLayer}>
                                <ul className={styles.listOptions}>
                                    {SORT_OPTIONS.map((option) => (
                                        <li key={option.value} className={styles.listItem}>
                                            <button
                                                type="button"
                                                className={`${styles.buttonOption} ${option.value === normalizedSort ? styles.buttonOptionSelected : ''}`}
                                                onClick={() => {
                                                    const params = new URLSearchParams(searchParams.toString());
                                                    params.set('page', String(PAGE_MIN));
                                                    params.set('size', String(currentSize));
                                                    params.set('sort', option.value);
                                                    router.replace(`/favorites?${params.toString()}`, { scroll: true });
                                                    setShowSortDropdown(false);
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className={styles.pageSizeLabel}>
                        <span className={styles.labelText}>페이지 크기</span>
                        <div 
                            ref={pageSizeRef}
                            className={`${styles.boxSelect} ${showPageSizeDropdown ? styles.on : ''} ${styles.pageSizeBox}`}
                        >
                            <button 
                                type="button" 
                                className={styles.selectDisplayField}
                                onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}
                            >
                                {currentSize}개씩 보기
                            </button>
                            <div className={styles.selectArrowContainer} onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}>
                                <span className={styles.selectArrowIcon}></span>
                            </div>
                            <div className={styles.boxLayer}>
                                <ul className={styles.listOptions}>
                                    {pageSizeOptions.map((option) => (
                                        <li key={option} className={styles.listItem}>
                                            <button
                                                type="button"
                                                className={`${styles.buttonOption} ${option === currentSize ? styles.buttonOptionSelected : ''}`}
                                                onClick={() => {
                                                    const params = new URLSearchParams(searchParams.toString());
                                                    params.set('page', String(PAGE_MIN));
                                                    params.set('size', String(option));
                                                    params.set('sort', normalizedSort);
                                                    router.replace(`/favorites?${params.toString()}`, { scroll: true });
                                                    setShowPageSizeDropdown(false);
                                                }}
                                            >
                                                {option}개씩 보기
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className={styles.content}>
                {error ? (
                    <p className={styles.errorMessage}>{error}</p>
                ) : showLoadingState ? (
                    <div className={styles.loadingState}>
                        <CircularProgress size={32} />
                        <span>좋아요 목록 불러오는 중...</span>
                    </div>
                ) : currentContent.length === 0 ? (
                    <p className={styles.message}>아직 좋아요한 제품이 없어요.</p>
                ) : (
                    <ProductGrid products={currentContent} />
                )}

                {currentContent.length > 0 && totalPages > 1 && (
                    <ProductPagination currentPage={displayPage} totalPages={totalPages} onPageChange={handlePageChange} />
                )}
            </section>
        </div>
    );
}
