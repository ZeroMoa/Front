'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import styles from './page.module.css'
import ProductGrid from '../product/components/ProductGrid'
import { fetchFavoriteProducts } from '../store/api/userFavoriteApi'
import { fetchProductSearch } from '../store/api/userProductApi'
import { Product } from '@/types/productTypes'
import { useIsLoggedIn } from '../hooks/useAuth'
import { getCdnUrl } from '@/lib/cdn'
import { useAppDispatch, useAppSelector } from '../store/slices/store'
import { selectIsLoggedIn, setLoggedIn, setUser } from '../store/slices/authSlice'

const isNetworkErrorMessage = (message?: string | null) => {
    if (!message) {
        return false;
    }
    const lowered = message.toLowerCase();
    return lowered.includes('fetch failed') || lowered.includes('failed to fetch');
};

export default function HomePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const { isLoggedIn: queryIsLoggedIn, userData, isLoading: authLoading, error: authError } = useIsLoggedIn();
    const reduxIsLoggedIn = useAppSelector(selectIsLoggedIn);
    const isAuthenticated = Boolean(queryIsLoggedIn || reduxIsLoggedIn);
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
    const [favoriteError, setFavoriteError] = useState<string | null>(null);
    const [newProducts, setNewProducts] = useState<Product[]>([]);
    const [isNewLoading, setIsNewLoading] = useState(false);
    const [newError, setNewError] = useState<string | null>(null);
    const [hasHydrated, setHasHydrated] = useState(false);
    const [hasLoadedFavorites, setHasLoadedFavorites] = useState(false);
    const [hasLoadedNew, setHasLoadedNew] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/product/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleTagClick = (query: string) => {
        router.push(`/product/search?q=${encodeURIComponent(query)}`);
    };

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    // React Query의 로그인 상태를 Redux에 동기화
    useEffect(() => {
        if (!authLoading && !authError) {
            if (userData && queryIsLoggedIn) {
                dispatch(setLoggedIn(true));
                dispatch(setUser({ id: userData.username, username: userData.username }));
            } else {
                dispatch(setLoggedIn(false));
                dispatch(setUser(null));
            }
        }
    }, [authLoading, authError, userData, queryIsLoggedIn, dispatch]);

    useEffect(() => {
        let cancelled = false;

        const loadFavorites = async () => {
            if (!isAuthenticated) {
                setFavoriteProducts([]);
                setFavoriteError(null);
                setIsFavoriteLoading(false);
                setHasLoadedFavorites(true);
                return;
            }

            setIsFavoriteLoading(true);
            setHasLoadedFavorites(false);
            setFavoriteError(null);

            try {
                const response = await fetchFavoriteProducts({ page: 0, size: 10, sort: 'createdDate,desc' });
                if (!cancelled) {
                    setFavoriteProducts(response.content.slice(0, 10));
                }
            } catch (error) {
                if (!cancelled) {
                    const fallbackMessage = '좋아하는 상품을 불러오지 못했습니다.';
                    const message =
                        error instanceof Error && error.message && !isNetworkErrorMessage(error.message)
                            ? error.message
                            : fallbackMessage;
                    setFavoriteError(message);
                    setFavoriteProducts([]);
                }
            } finally {
                if (!cancelled) {
                    setIsFavoriteLoading(false);
                    setHasLoadedFavorites(true);
                }
            }
        };

        loadFavorites();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated]);

    const handleViewAllFavorites = () => {
        if (!isAuthenticated) {
            alert('로그인 후 이용해주세요~.~');
            return;
        }
        router.push('/favorites');
    };

    useEffect(() => {
        let cancelled = false;

        const loadNewProducts = async () => {
            setIsNewLoading(true);
            setHasLoadedNew(false);
            setNewError(null);

            try {
                const response = await fetchProductSearch({ page: 0, size: 10, sort: 'createdDate,desc', isNew: true });
                if (!cancelled) {
                    setNewProducts(response.content.slice(0, 10));
                }
            } catch (error) {
                if (!cancelled) {
                    const fallbackMessage = '신제품을 불러오지 못했습니다.';
                    const message =
                        error instanceof Error && error.message && !isNetworkErrorMessage(error.message)
                            ? error.message
                            : fallbackMessage;
                    setNewError(message);
                    setNewProducts([]);
                }
            } finally {
                if (!cancelled) {
                    setIsNewLoading(false);
                    setHasLoadedNew(true);
                }
            }
        };

        loadNewProducts();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleViewAllNew = () => {
        router.push('/product/new');
    };

    const showNewLoading = isNewLoading || !hasLoadedNew;
    const shouldShowFavoriteLoading =
        !hasHydrated || authLoading || (isAuthenticated && (!hasLoadedFavorites || isFavoriteLoading));

    return (
        <main>
            <section className={styles.heroSection}>
                <h1 className={styles.heroTitle}>모든 저당, 저칼로리 식품을 한번에!</h1>
                <form onSubmit={handleSearch} className={styles.searchContainer}>
                    <input 
                        type="text" 
                        placeholder="건강하게 즐길 식품을 검색해보세요!" 
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className={styles.searchButton}>
                        <Image src={getCdnUrl('/images/search.png')} alt="검색" width={20} height={20} />
                    </button>
                </form>
                <div className={styles.searchTags}>
                    <button
                        className={styles.tag}
                        onClick={() => handleTagClick("제로")}
                        aria-label="제로 검색"
                    >
                        <span className={styles.tagEmoji}>0️⃣</span>
                        <span className={styles.tagLabel}>제로</span>
                    </button>
                    <button
                        className={styles.tag}
                        onClick={() => handleTagClick("저당")}
                        aria-label="저당 검색"
                    >
                        <span className={styles.tagEmoji}>🥗</span>
                        <span className={styles.tagLabel}>저당</span>
                    </button>
                    <button
                        className={styles.tag}
                        onClick={() => handleTagClick("단백질")}
                        aria-label="단백질 검색"
                    >
                        <span className={styles.tagEmoji}>💪</span>
                        <span className={styles.tagLabel}>단백질</span>
                    </button>
                    <button
                        className={styles.tag}
                        onClick={() => handleTagClick("콜라")}
                        aria-label="콜라 검색"
                    >
                        <span className={styles.tagEmoji}>🥤</span>
                        <span className={styles.tagLabel}>콜라</span>
                    </button>
                    <button
                        className={styles.tag}
                        onClick={() => handleTagClick("초콜릿")}
                        aria-label="초콜릿 검색"
                    >
                        <span className={styles.tagEmoji}>🍫</span>
                        <span className={styles.tagLabel}>초콜릿</span>
                    </button>
                </div>
            </section>

            <section className={styles.features}>
                <Link
                    href={{
                        pathname: '/product',
                        query: { collection: 'zero-calorie' },
                    }}
                >
                    <div className={styles.featureItem}>
                        <Image 
                            src={getCdnUrl('/images/zero_calorie2.png')} 
                            alt="제로 칼로리" 
                            width={80} 
                            height={80}
                            className={styles.featureImage}
                        />
                        <div className={styles.featureText}>
                            <h3>제로 칼로리</h3>
                            <span>100g(ml)당 4kcal 미만</span>
                        </div>
                    </div>
                </Link>
                <Link
                    href={{
                        pathname: '/product',
                        query: { collection: 'zero-sugar' },
                    }}
                >
                    <div className={styles.featureItem}>
                        <Image 
                            src={getCdnUrl('/images/zero_sugar2.png')} 
                            alt="제로 슈가" 
                            width={80} 
                            height={80}
                            className={styles.featureImage}
                        />
                        <div className={styles.featureText}>
                            <h3>제로 슈가</h3>
                            <span>100g(ml)당 0.5g 미만</span>
                        </div>
                    </div>
                </Link>
                <Link
                    href={{
                        pathname: '/product',
                        query: { collection: 'low-calorie' },
                    }}
                >
                    <div className={styles.featureItem}>
                        <Image 
                            src={getCdnUrl('/images/low_calorie2.png')} 
                            alt="저칼로리" 
                            width={80} 
                            height={80}
                            className={styles.featureImage}
                        />
                        <div className={styles.featureText}>
                            <h3>저칼로리</h3>
                            <span>100g당 40kcal 미만</span>
                            <span>100ml당 20kcal 미만</span>
                        </div>
                    </div>
                </Link>
                <Link
                    href={{
                        pathname: '/product',
                        query: { collection: 'low-sugar' },
                    }}
                >
                    <div className={styles.featureItem}>
                        <Image 
                            src={getCdnUrl('/images/low_sugar4.png')} 
                            alt="저당 식품" 
                            width={80} 
                            height={80}
                            className={styles.featureImage}
                        />
                        <div className={styles.featureText}>
                            <h3>저당 식품</h3>
                            <span>100g당 5g 미만</span>
                            <span>100ml당 2.5g 미만</span>
                        </div>
                    </div>
                </Link>
            </section>

            <section className={styles.noticeSection}> {/* 공지사항 섹션 추가 */}
                <Link href="/board" className={styles.noticeLink}>
                    <div className={styles.noticeItem}>
                        <Image
                            src={getCdnUrl('/images/notice2.png')}
                            alt="공지사항"
                            width={80}
                            height={80}
                            className={styles.noticeImage}
                        />
                        <div className={styles.noticeText}>
                            <h3>공지사항</h3>
                            <span>제로모아의 새로운 소식을 만나보세요!</span>
                        </div>
                    </div>
                </Link>
            </section>
            <div className={styles.sectionDivider} aria-hidden="true" />
            <section className={styles.newSection}>
                <div className={styles.favoriteHeader}>
                    <h2 className={styles.favoriteTitle}>
                        따끈따끈 <span className={styles.highlightNew}>신제품</span>
                    </h2>
                    <button type="button" className={styles.favoriteViewAllButton} onClick={handleViewAllNew}>
                        전체 보기
                    </button>
                </div>

                {showNewLoading ? (
                    <div className={styles.sectionLoadingBox} role="status">
                        <CircularProgress size={32} />
                        <span>목록을 불러오는 중...</span>
                    </div>
                ) : newError ? (
                    <div className={styles.sectionErrorBox} role="alert">
                        <p>{newError}</p>
                    </div>
                ) : newProducts.length === 0 ? (
                    <p className={styles.favoriteMessage}>아직 등록된 신제품이 없어요.</p>
                ) : (
                    <ProductGrid products={newProducts} className={styles.favoriteGrid} />
                )}
            </section>
            <div className={styles.sectionDivider} aria-hidden="true" />
            <section className={styles.favoriteSection}>
                <div className={styles.favoriteHeader}>
                    <h2 className={styles.favoriteTitle}>
                        내가 <span className={styles.highlightFavorite}>좋아하는</span> 상품
                    </h2>
                    <button type="button" className={styles.favoriteViewAllButton} onClick={handleViewAllFavorites}>
                        전체 보기
                    </button>
                </div>

                {shouldShowFavoriteLoading ? (
                    <div className={styles.sectionLoadingBox} role="status">
                        <CircularProgress size={32} />
                        <span>목록을 불러오는 중...</span>
                    </div>
                ) : !isAuthenticated ? (
                    <p className={styles.favoriteMessage}>로그인 후 좋아하는 제품을 확인해보세요!</p>
                ) : favoriteError ? (
                    <div className={styles.sectionErrorBox} role="alert">
                        <p>{favoriteError}</p>
                    </div>
                ) : favoriteProducts.length === 0 ? (
                    <p className={styles.favoriteMessage}>아직 좋아요한 제품이 없어요.</p>
                ) : (
                    <ProductGrid products={favoriteProducts} className={styles.favoriteGrid} />
                )}
            </section>

            
        </main>
    )
}