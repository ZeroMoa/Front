'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import ProductGrid from '../product/components/ProductGrid';
import ProductPagination from '../product/components/ProductPagination';
import { fetchFavoriteProducts } from '../store/api/favorite';
import { ProductResponse } from '@/types/product';
import { useIsLoggedIn } from '../hooks/useAuth';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT = 'createdDate,desc';

export default function FavoritesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLoggedIn, isLoading: authLoading } = useIsLoggedIn();
    const alertShownRef = useRef(false);

    const pageParam = Number(searchParams.get('page') ?? '0');
    const sizeParam = Number(searchParams.get('size') ?? String(DEFAULT_PAGE_SIZE));
    const sortParam = searchParams.get('sort') ?? DEFAULT_SORT;

    const currentPage = Number.isNaN(pageParam) || pageParam < 0 ? 0 : pageParam;
    const currentSize = Number.isNaN(sizeParam) || sizeParam <= 0 ? DEFAULT_PAGE_SIZE : sizeParam;

    const [data, setData] = useState<ProductResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isLoggedIn && !alertShownRef.current) {
            alertShownRef.current = true;
            alert('로그인 후 이용해주세요');
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
                    page: currentPage,
                    size: currentSize,
                    sort: sortParam,
                });

                if (!cancelled) {
                    setData(response);
                }
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
    }, [authLoading, isLoggedIn, currentPage, currentSize, sortParam]);

    const totalElements = data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? 0;
    const currentContent = data?.content ?? [];

    const handlePageChange = useCallback(
        (nextPage: number) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(nextPage));
            params.set('size', String(currentSize));
            params.set('sort', sortParam);
            router.replace(`/favorites?${params.toString()}`, { scroll: true });
        },
        [currentSize, router, searchParams, sortParam],
    );

    const handlePageSizeChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const nextSize = Number(event.target.value);
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', '0');
            params.set('size', String(nextSize));
            params.set('sort', sortParam);
            router.replace(`/favorites?${params.toString()}`, { scroll: true });
        },
        [router, searchParams, sortParam],
    );

    const pageSizeOptions = useMemo(() => [20, 40, 60], []);

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>좋아요한 상품</h1>
                    <p className={styles.description}>
                        {isLoading ? '좋아요한 제품을 불러오는 중입니다...' : `총 ${totalElements.toLocaleString()}개의 제품을 확인할 수 있어요.`}
                    </p>
                </div>
                <div className={styles.controls}>
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
                ) : !isLoggedIn ? (
                    <p className={styles.message}>로그인 후 좋아요한 상품을 확인할 수 있습니다.</p>
                ) : isLoading ? (
                    <p className={styles.message}>좋아요한 제품을 불러오는 중입니다...</p>
                ) : currentContent.length === 0 ? (
                    <p className={styles.message}>아직 좋아요한 제품이 없어요.</p>
                ) : (
                    <ProductGrid products={currentContent} />
                )}

                {currentContent.length > 0 && totalPages > 1 && (
                    <ProductPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                )}
            </section>
        </div>
    );
}
