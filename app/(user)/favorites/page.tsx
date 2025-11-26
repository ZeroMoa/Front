'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    { value: 'product.productName,asc', label: '제품명 오름차순' },
    { value: 'product.productName,desc', label: '제품명 내림차순' },
    { value: 'product.updatedDate,desc', label: '최신 업데이트순' },
    { value: 'createdDate,desc', label: '좋아요 최신순' },
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
                return;
            }

            setIsLoading(true);
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
    const effectiveIsFetching = hasHydrated && isFetching;

    const headerDescription = error
        ? '좋아요한 제품을 불러오지 못했습니다.'
        : effectiveIsFetching
        ? '좋아요 목록 불러오는 중...'
        : totalElements > 0
        ? `총 ${totalElements.toLocaleString()}개의 제품을 확인할 수 있어요.`
        : '좋아요한 제품을 찾을 수 없어요.';

    const handlePageChange = useCallback(
        (nextPage: number) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(nextPage + 1));
            params.set('size', String(currentSize));
            params.set('sort', normalizedSort);
            router.replace(`/favorites?${params.toString()}`, { scroll: true });
        },
        [currentSize, normalizedSort, router, searchParams],
    );

    const handlePageSizeChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const nextSize = Number(event.target.value);
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(PAGE_MIN));
            params.set('size', String(nextSize));
            params.set('sort', normalizedSort);
            router.replace(`/favorites?${params.toString()}`, { scroll: true });
        },
        [normalizedSort, router, searchParams],
    );

    const pageSizeOptions = useMemo(() => [20, 40, 60], []);

    const handleSortChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const nextSort = event.target.value;
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(PAGE_MIN));
            params.set('size', String(currentSize));
            params.set('sort', nextSort);
            router.replace(`/favorites?${params.toString()}`, { scroll: true });
        },
        [currentSize, router, searchParams],
    );

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>좋아요한 상품</h1>
                    <p className={styles.description}>{headerDescription}</p>
                </div>
                <div className={styles.controls}>
                    <label className={styles.sortLabel}>
                        정렬
                        <select value={normalizedSort} onChange={handleSortChange} className={styles.sortSelect}>
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.pageSizeLabel}>
                        페이지 크기
                        <select value={currentSize} onChange={handlePageSizeChange} className={styles.pageSizeSelect}>
                            {pageSizeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}개씩 보기
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </header>

            <section className={styles.content}>
                {error ? (
                    <p className={styles.errorMessage}>{error}</p>
                ) : effectiveIsFetching ? (
                    <p className={styles.message}>좋아요 목록 불러오는 중...</p>
                ) : currentContent.length === 0 ? (
                    <p className={styles.message}>아직 좋아요한 제품이 없어요.</p>
                ) : (
                    <ProductGrid products={currentContent} />
                )}

                {currentContent.length > 0 && totalPages > 1 && (
                    <ProductPagination currentPage={currentPageIndex} totalPages={totalPages} onPageChange={handlePageChange} />
                )}
            </section>
        </div>
    );
}
