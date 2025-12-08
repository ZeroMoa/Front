'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './page.module.css';
import { Product, normalizeProduct } from '../../../../types/productTypes';
import { getCdnUrl } from '@/lib/cdn';
import FavoriteToggleButton from '../components/FavoriteToggleButton';
import ProductGrid from '../components/ProductGrid';
import { fetchWithAuth } from '@/lib/common/api/fetchWithAuth';

const PRODUCT_API_BASE_URL =
    process.env.NEXT_PUBLIC_PRODUCT_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://localhost:8443';
const DEFAULT_IMAGE = getCdnUrl('/images/default-product.png');

const SWEETENER_KEYWORDS = [
    '알룰로스',
    '에리스리톨',
    '말티톨',
    '솔비톨',
    '자일리톨',
    '아스파탐',
    '아세설팜',
    '수크랄로스',
    '사카린',
    '스테비올',
    '이소말트',
    '타가토스',
];
const CAFFEINE_KEYWORDS = ['카페인'];

const hasNumberValue = (value: number) => !Number.isNaN(value);
const formatQuantity = (value: number, unit: string, emptyText = '없음') =>
    hasNumberValue(value) ? `${value}${unit}` : emptyText;
const formatPercentage = (value: number, base: number) =>
    hasNumberValue(value) ? `${Math.round((value / base) * 100)}%` : '-';

const fixUnencodedPercents = (value: string) => value.replace(/%(?![0-9A-Fa-f]{2})/g, '%25');

const resolveImageUrl = (url?: string | null) => {
    if (!url) {
        return DEFAULT_IMAGE;
    }
    const trimmed = url.trim();
    if (!trimmed) {
        return DEFAULT_IMAGE;
    }
    if (/^https?:\/\//i.test(trimmed)) {
        const corrected = fixUnencodedPercents(trimmed);
        try {
            const parsed = new URL(corrected);
            const encodedPath = parsed.pathname
                .split('/')
                .map((segment) => {
                    if (!segment) {
                        return segment;
                    }
                    try {
                        return encodeURIComponent(decodeURIComponent(segment));
                    } catch {
                        return encodeURIComponent(segment);
                    }
                })
                .join('/');
            return `${parsed.origin}${encodedPath}${parsed.search}${parsed.hash}`;
        } catch {
            return encodeURI(corrected);
        }
    }
    const sanitized = fixUnencodedPercents(trimmed);
    return getCdnUrl(sanitized.startsWith('/') ? sanitized : `/${sanitized}`);
};

const RelatedProducts = ({ currentProductNo, categoryNo }: { currentProductNo: number; categoryNo: number }) => {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                const endpoint = `${PRODUCT_API_BASE_URL.replace(/\/$/, '')}/product/category/${categoryNo}?page=0&size=24&sort=productName,asc`;

                const response = await fetch(endpoint, {
                    cache: 'no-store',
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('관련 제품을 가져오는데 실패했습니다');
                const data = await response.json();
                const normalizedContent: Product[] = Array.isArray(data?.content)
                    ? data.content.map((item: unknown) => normalizeProduct(item as Record<string, unknown>))
                    : [];
                
                const filteredProducts = normalizedContent
                    .filter((p: Product) => p.productNo !== currentProductNo)
                    .slice(0, 12);
                
                setRelatedProducts(filteredProducts);
            } catch (error) {
                console.error('Error fetching related products:', error);
            }
        };

        fetchRelatedProducts();
    }, [categoryNo, currentProductNo]);

    if (relatedProducts.length === 0) return null;

    return (
        <div className={styles.relatedProducts}>
            <h3 className={styles.sectionTitle}>관련 제품</h3>
            <ProductGrid products={relatedProducts} className={styles.relatedGrid} />
        </div>
    );
};

export default function ProductDetail() {
    
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shouldRedirectNotFound, setShouldRedirectNotFound] = useState(false);
    const [favoriteState, setFavoriteState] = useState({
        isFavorite: false,
        likesCount: 0,
    });

    useEffect(() => {
        let mounted = true;

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const response = await fetchWithAuth(`/product/${params.productNo}`, {
                    method: 'GET',
                    cache: 'no-store',
                });

                const data = await response.json();
                const normalized = normalizeProduct(data as Record<string, unknown>);
                
                if (mounted) {
                    setProduct(normalized);
                    setIsLoading(false);
                }
            } catch (err: unknown) {
                console.error('Error fetching product:', err);
                if (mounted) {
                    const message = err instanceof Error ? err.message : '제품 정보를 불러오지 못했습니다';
                    setError(message);
                    if (
                        message.toLowerCase().includes('not found') ||
                        message.includes('찾을 수 없습니다') ||
                        message.includes('404')
                    ) {
                        setShouldRedirectNotFound(true);
                    }
                    setProduct(null);
                    setIsLoading(false);
                }
            }
        };

        fetchProduct();

        // cleanup 함수
        return () => {
            mounted = false;
        };
    }, [params.productNo]);

    useEffect(() => {
        if (!product) {
            setFavoriteState({ isFavorite: false, likesCount: 0 });
            return;
        }

        setFavoriteState({
            isFavorite: Boolean(product.isFavorite),
            likesCount: product.likesCount ?? 0,
        });
    }, [product?.productNo, product?.isFavorite, product?.likesCount]);

    useEffect(() => {
        if (!shouldRedirectNotFound) {
            return;
        }
        router.replace('/404');
    }, [shouldRedirectNotFound, router]);

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <CircularProgress size={40} />
                <p>제품 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        if (shouldRedirectNotFound) {
            return null;
        }
        return <div className={styles.loading}>제품 정보를 불러오지 못했습니다.</div>;
    }

    if (!product) {
        return null;
    }

    // 카테고리 이름 가져오기
    const getCategoryNames = (parentCategoryNo: number, categoryNo: number) => {
        const parentCategories: Record<number, string> = {
            1: '음료',
            2: '과자',
            3: '아이스크림',
            4: '카페'
        };

        const subCategories: Record<number, string> = {
            // 음료 하위 카테고리
            4: '탄산',
            5: '주스',
            6: '유제품',
            7: '차',
            8: '커피',
            9: '에너지 드링크',
            10: '주류',
            11: '기타',
            // 과자 하위 카테고리
            12: '과자',
            13: '사탕',
            14: '젤리',
            15: '초콜릿',
            16: '시리얼',
            17: '기타'
        };

        const parentName = parentCategories[parentCategoryNo] || '기타';
        const subName = subCategories[categoryNo] || '기타';

        return `${parentName} | ${subName}`;
    };

    const totalContentLabel = product.totalContent?.trim() || undefined;
    const nutritionBasisText = product.nutritionBasisText?.trim() || undefined;
    const nutritionBasisValueLabel = hasNumberValue(product.nutritionBasisValue)
        ? `${product.nutritionBasisValue}${(product.nutritionBasisUnit ?? '').trim()}`
        : undefined;
    const nutritionBasisLabel = nutritionBasisText || nutritionBasisValueLabel;
    const servingSizeLabel = hasNumberValue(product.servingSize) && product.servingSize > 0
        ? `${product.servingSize}${(product.servingUnit ?? '').trim()}`
        : undefined;
    const nutritionSectionTitle = nutritionBasisText
        ? `영양정보 (${nutritionBasisText} 기준)`
        : nutritionBasisValueLabel
        ? `영양정보 (${nutritionBasisValueLabel} 기준)`
        : '영양정보';
    const allergensLabel = product.allergens?.split(',').map((item) => item.trim()).filter(Boolean).join(', ') || undefined;
    const servingHighlights = (
        [
            totalContentLabel ? { label: '총 내용량', value: totalContentLabel } : null,
            servingSizeLabel ? { label: '1회 제공량', value: servingSizeLabel } : null,
            allergensLabel ? { label: '알레르기', value: allergensLabel } : null,
        ].filter(Boolean) as Array<{ label: string; value: string }>
    );
    const nutritionRows: Array<{ label: string; value: string; percent?: string }> = [];
    const pushNutritionRow = (label: string, amount: number, unit: string, percentBase?: number) => {
        if (!hasNumberValue(amount) || amount === 0) { // 0 값 체크 추가
            return;
        }
        const row: { label: string; value: string; percent?: string } = {
            label,
            value: formatQuantity(amount, unit),
        };
        if (percentBase) {
            row.percent = formatPercentage(amount, percentBase);
        }
        nutritionRows.push(row);
    };

    pushNutritionRow('열량', product.energyKcal, 'kcal');
    pushNutritionRow('탄수화물', product.carbohydrateG, 'g', 324);
    pushNutritionRow('당류', product.sugarG, 'g', 100);
    pushNutritionRow('단백질', product.proteinG, 'g', 55);
    pushNutritionRow('지방', product.fatG, 'g', 54);
    pushNutritionRow('포화지방', product.saturatedFattyAcidsG, 'g', 15);
    pushNutritionRow('트랜스지방', product.transFattyAcidsG, 'g');
    pushNutritionRow('콜레스테롤', product.cholesterolMg, 'mg', 300);
    pushNutritionRow('나트륨', product.sodiumMg, 'mg', 2000);

    if (hasNumberValue(product.caffeineMg) && product.caffeineMg > 0) { // 0 값 체크 추가
        pushNutritionRow('카페인', product.caffeineMg, 'mg', 400);
    }
    if (hasNumberValue(product.taurineMg) && product.taurineMg > 0) { // 0 값 체크 추가
        pushNutritionRow('타우린', product.taurineMg, 'mg');
    }
    if (hasNumberValue(product.sugarAlcoholG) && product.sugarAlcoholG > 0) { // 0 값 체크 추가
        pushNutritionRow('당알코올', product.sugarAlcoholG, 'g');
    }
    if (hasNumberValue(product.alluloseG) && product.alluloseG > 0) { // 0 값 체크 추가
        pushNutritionRow('알룰로스', product.alluloseG, 'g');
    }
    if (hasNumberValue(product.erythritolG) && product.erythritolG > 0) { // 0 값 체크 추가
        pushNutritionRow('에리스리톨', product.erythritolG, 'g');
    }

    return (
            <div className={styles.wrapper}>
                <main className={styles.productContainer}>
                    <div className={styles.imageSection}>
                    <div className={styles.imageFavoriteOverlay}>
                        <span className={styles.imageFavoriteCount}>{favoriteState.likesCount.toLocaleString()}</span>
                        <FavoriteToggleButton
                            productNo={product.productNo}
                            initialIsFavorite={favoriteState.isFavorite}
                            initialLikesCount={favoriteState.likesCount}
                            onChange={(next) => {
                                setFavoriteState(next);
                            }}
                        />
                    </div>
                            <Image
                        src={resolveImageUrl((product as any).imageUrl ?? (product as any).imageurl)}
                                alt={product?.productName || '제품 이미지'}
                        width={300}
                        height={300}
                        className={styles.detailProductImage}
                                unoptimized
                        onError={(event) => {
                            const target = event.target as HTMLImageElement;
                            target.src = DEFAULT_IMAGE;
                        }}
                    />
                    </div>

                    <section className={styles.infoSection}>
                    <div className={styles.infoCard}>
                        <div className={styles.productHeader}>
                            <div className={styles.productMeta}>
                                <div className={styles.metaTopRow}>
                                    <span className={styles.category}>
                                        {getCategoryNames(
                                            (product as Product & { parentCategoryNo?: number }).parentCategoryNo ?? product.categoryNo,
                                            product.categoryNo,
                                        )}
                                    </span>
                                </div>
                                <div className={styles.productTitleGroup}>
                                    <div className={styles.productTitleRow}>
                                        <h1 className={styles.productName}>{product.productName}</h1>
                                    </div>
                                    <span className={styles.productHeaderDivider} aria-hidden="true" />
                                    {product.companyName?.trim() && (
                                        <>
                                            <p className={styles.companyNameDetail}>{product.companyName.trim()}</p>
                                            <span className={styles.productHeaderDivider} aria-hidden="true" />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {servingHighlights.length > 0 && (
                            <div className={styles.servingHighlights}>
                                {servingHighlights.map((item) => (
                                    <div key={item.label} className={styles.servingHighlight}>
                                        <span className={styles.servingHighlightLabel}>{item.label}</span>
                                        <span className={styles.servingHighlightValue}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {servingHighlights.length > 0 && nutritionRows.length > 0 && (
                            <div className={styles.sectionDivider} aria-hidden="true" />
                        )}

                        {nutritionRows.length > 0 && (
                            <div className={styles.nutritionTable}>
                                <h3 className={styles.sectionTitle}>{nutritionSectionTitle}</h3>
                                <div className={styles.nutritionTableWrapper}>
                                    <table className={styles.nutritionTableGrid}>
                                        <thead>
                                            <tr className={styles.nutritionHeaderRow}>
                                                <th>영양 성분</th>
                                                <th>함량</th>
                                                <th>1일 기준치 %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {nutritionRows.map((row, index) => (
                                                <tr
                                                    key={row.label}
                                                    className={`${styles.nutritionRow} ${
                                                        index % 2 === 0 ? styles.nutritionRowEven : ''
                                                    }`.trim()}
                                                >
                                                    <th scope="row">{row.label}</th>
                                                    <td>{row.value}</td>
                                                    <td>{row.percent ?? ''}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {nutritionRows.length > 0 && product.ingredients && product.ingredients.trim() && (
                            <div className={styles.sectionDivider} aria-hidden="true" />
                        )}
                    </div>

                    {product.ingredients && product.ingredients.trim() && (
                                <div className={styles.ingredients}>
                                    <h3 className={styles.sectionTitle}>원재료</h3>
                                    <p>
                                {product.ingredients.split(',').map((ingredient, index) => {
                                    const label = ingredient.trim();
                                    if (!label) {
                                        return null;
                                    }
                                    return (
                                        <span
                                            key={`${label}-${index}`}
                                            className={`${styles.ingredient} ${
                                                SWEETENER_KEYWORDS.some((keyword) => label.includes(keyword))
                                                    ? styles.ingredientHighlightSweetener
                                                    : CAFFEINE_KEYWORDS.some((keyword) => label.includes(keyword))
                                                    ? styles.ingredientHighlightCaffeine
                                                    : ''
                                            }`.trim()}
                                        >
                                            {label}
                                            </span>
                                    );
                                })}
                                    </p>
                                </div>
                            )}
                        </section>
                    </main>
                    
                    {product && (
                <RelatedProducts currentProductNo={product.productNo} categoryNo={product.categoryNo} />
                    )}
                </div>
        );
    }