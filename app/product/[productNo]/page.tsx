'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { Product, normalizeProduct } from '../../../types/product';
import SearchHeader from '../../../components/SearchHeader';
import { getCdnUrl } from '@/lib/cdn';
import FavoriteToggleButton from '../components/FavoriteToggleButton';

const PRODUCT_API_BASE_URL =
    process.env.NEXT_PUBLIC_PRODUCT_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:8080';

const PRODUCT_ENDPOINT = `${PRODUCT_API_BASE_URL.replace(/\/$/, '')}/product`;
const DEFAULT_IMAGE = getCdnUrl('/images/default-product.png');
const WARN_ICON = getCdnUrl('/images/warning.png');
const CAFFEINE_ICON = getCdnUrl('/images/coffee.png');

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
const hasPositiveValue = (value: number) => !Number.isNaN(value) && value > 0;
const formatQuantity = (value: number, unit: string, emptyText = '없음') =>
    hasNumberValue(value) ? `${value}${unit}` : emptyText;
const formatPercentage = (value: number, base: number) =>
    hasNumberValue(value) ? `${Math.round((value / base) * 100)}%` : '-';

const resolveImageUrl = (url?: string | null) => {
    if (!url) {
        return DEFAULT_IMAGE;
    }
    return /^https?:\/\//i.test(url) ? url : getCdnUrl(url);
};

const RelatedProducts = ({ currentProductNo, categoryNo }: { currentProductNo: number, categoryNo: number }) => {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const router = useRouter();

    // 대체당 포함 여부 확인 함수 추가
    const hasAlternativeSweeteners = (product: Product) => {
        return (
            hasPositiveValue(product.sugarAlcoholG) ||
            hasPositiveValue(product.alluloseG) ||
            hasPositiveValue(product.erythritolG)
        );
    };

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                // size를 11로 설정 (현재 제품 제외하고 10개 보여주기 위해)
                const endpoint = `${PRODUCT_API_BASE_URL.replace(/\/$/, '')}/product/category/${categoryNo}?page=0&size=20&sort=productName,asc`;

                const response = await fetch(endpoint, {
                    cache: 'no-store',
                    credentials: 'omit',
                });

                if (!response.ok) throw new Error('관련 제품을 가져오는데 실패했습니다');
                const data = await response.json();
                const normalizedContent: Product[] = Array.isArray(data?.content)
                    ? data.content.map((item: unknown) => normalizeProduct(item as Record<string, unknown>))
                    : [];
                
                // 현재 제품을 제외하고 처음 10개 선택
                const filteredProducts = normalizedContent
                    .filter((p: Product) => p.productNo !== currentProductNo)
                    .slice(0, 10);
                
                setRelatedProducts(filteredProducts);
            } catch (error) {
                console.error('Error fetching related products:', error);
            }
        };

        fetchRelatedProducts();
    }, [categoryNo, currentProductNo]);

    // 제품 클릭 핸들러 추가
    const handleProductClick = (productNo: number) => {
        router.push(`/product/${productNo}`);
    };

    if (relatedProducts.length === 0) return null;

    return (
        <div className={styles.relatedProducts}>
            <h3 className={styles.sectionTitle}>관련 제품</h3>
            <div className={styles.relatedProductsGrid}>
                 {relatedProducts.map((product) => {
                     const hasSweeteners = hasAlternativeSweeteners(product);
                    const hasCaffeine = hasPositiveValue(product.caffeineMg);
                     const hasBadges = hasSweeteners || hasCaffeine;
                    const servingSizeText = hasNumberValue(product.servingSize)
                        ? `${product.servingSize}${product.servingUnit || ''}`
                        : '-';
 
                     return (
                    <div 
                        key={product.productNo} 
                        className={styles.relatedProductCard}
                        onClick={() => handleProductClick(product.productNo)}
                        role="button"
                        tabIndex={0}
                    >
                             <div
                                 className={`${styles.relatedBadgeRow} ${hasBadges ? styles.relatedBadgeRowVisible : ''}`.trim()}
                             >
                                 {hasBadges && (
                                     <>
                                         {hasSweeteners && (
                                             <span className={`${styles.relatedBadge} ${styles.relatedBadgeSweetener}`}>
                                                 <Image src={WARN_ICON} alt="대체당 경고" width={18} height={18} />
                                                 <span>대체당</span>
                                    </span>
                                )}
                                         {hasCaffeine && (
                                             <span className={`${styles.relatedBadge} ${styles.relatedBadgeCaffeine}`}>
                                                 <Image src={CAFFEINE_ICON} alt="카페인 경고" width={18} height={18} />
                                                 <span>카페인</span>
                                    </span>
                                         )}
                                     </>
                                )}
                            </div>
                        <div className={styles.relatedProductImage}>
                            <Image
                                     src={resolveImageUrl((product as any).imageUrl ?? (product as any).imageurl)}
                                alt={product.productName}
                                width={100}
                                height={100}
                                className={styles.productImage}
                                unoptimized
                                     onError={(event) => {
                                         const target = event.target as HTMLImageElement;
                                         target.src = DEFAULT_IMAGE;
                                     }}
                            />
                        </div>
                        <div className={styles.relatedProductInfo}>
                            <h4>{product.productName}</h4>
                            <div className={styles.nutritionDivider} />
                            <div className={styles.relatedServingSize}>
                                    내용량: {servingSizeText}
                            </div>
                            <div className={styles.nutritionInfo}>
                                    {hasNumberValue(product.energyKcal) && (
                                    <div className={styles.related_nutrition}>
                                        <span className={styles.related_nutrition_label}>칼로리</span>
                                            <span>{formatQuantity(product.energyKcal, 'kcal', '-')}</span>
                                    </div>
                                )}
                                    {hasNumberValue(product.sugarG) && (
                                    <div className={styles.related_nutrition}>
                                        <span className={styles.related_nutrition_label}>당류</span>
                                            <span>{formatQuantity(product.sugarG, 'g', '-')}</span>
                                    </div>
                                )}
                                    {hasPositiveValue(product.sugarAlcoholG) && (
                                    <div className={styles.related_nutrition}>
                                        <span className={styles.related_nutrition_label}>당알코올</span>
                                            <span>{formatQuantity(product.sugarAlcoholG, 'g', '-')}</span>
                                    </div>
                                )}
                                    {hasPositiveValue(product.alluloseG) && (
                                    <div className={styles.related_nutrition}>
                                        <span className={styles.related_nutrition_label}>알룰로스</span>
                                            <span>{formatQuantity(product.alluloseG, 'g', '-')}</span>
                                    </div>
                                )}
                                    {hasPositiveValue(product.erythritolG) && (
                                    <div className={styles.related_nutrition}>
                                        <span className={styles.related_nutrition_label}>에리스리톨</span>
                                            <span>{formatQuantity(product.erythritolG, 'g', '-')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                     );
                 })}
            </div>
        </div>
    );
};

export default function ProductDetail() {

    // 대체당 포함 여부 확인 함수 추가
    const hasAlternativeSweeteners = (product: Product) => {
        return (
            hasPositiveValue(product.sugarAlcoholG) ||
            hasPositiveValue(product.alluloseG) ||
            hasPositiveValue(product.erythritolG)
        );
    };
    
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const endpoint = `${PRODUCT_ENDPOINT}/${params.productNo}`;

                const response = await fetch(endpoint, {
                    cache: 'no-store',
                    credentials: 'omit',
                });

                if (!response.ok) {
                    throw new Error('제품을 찾을 수 없습니다');
                }

                const data = await response.json();
                const normalized = normalizeProduct(data as Record<string, unknown>);
                
                if (mounted) {
                    setProduct(normalized);
                    setIsLoading(false);
                }
            } catch (err: any) {
                setError(err.message);
                console.error('Error fetching product:', err);
                if (mounted) {
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

    if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
    if (error) return <div className={styles.error}>오류: {error}</div>;
    if (!product) return <div className={styles.notFound}>제품을 찾을 수 없습니다</div>;

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

    const [favoriteState, setFavoriteState] = useState({
        isFavorite: Boolean(product.isFavorite),
        likesCount: product.likesCount ?? 0,
    });

    useEffect(() => {
        setFavoriteState({
            isFavorite: Boolean(product.isFavorite),
            likesCount: product.likesCount ?? 0,
        });
    }, [product.productNo, product.isFavorite, product.likesCount]);

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
    const manufacturerLabel = product.manufacturerName?.trim() || undefined;
    const distributorLabel = product.distributorName?.trim() || undefined;
    const foodTypeLabel = product.foodType?.trim() || undefined;
    const servingHighlights = (
        [
            totalContentLabel ? { label: '총 내용량', value: totalContentLabel } : null,
            servingSizeLabel ? { label: '1회 제공량', value: servingSizeLabel } : null,
        ].filter(Boolean) as Array<{ label: string; value: string }>
    );
    const likesLabel = favoriteState.likesCount > 0 ? `${favoriteState.likesCount.toLocaleString()}명` : null;
    const metaItems = (
        [
            // manufacturerLabel ? { label: '제조사', value: manufacturerLabel } : null, // 제거
            // distributorLabel ? { label: '유통사', value: distributorLabel } : null,   // 제거
            foodTypeLabel ? { label: '식품 유형', value: foodTypeLabel } : null,
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
        <>
            <SearchHeader />
            <div className={styles.wrapper}>
                <main className={styles.productContainer}>
                    {/* 왼쪽: 상품 이미지 섹션 */}
                    <div className={styles.imageSection}>
                            <Image
                            src={resolveImageUrl((product as any).imageUrl ?? (product as any).imageurl)}
                                alt={product?.productName || '제품 이미지'}
                            width={300}
                            height={300}
                                className={styles.productImage}
                                unoptimized
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_IMAGE;
                                }}
                            />
                    </div>

                    {/* 오른쪽: 상품 정보 섹션 */}
                    <section className={styles.infoSection}>
                        <div className={styles.infoCard}>
                        <div className={styles.productHeader}>
                            <div className={styles.productMeta}>
                                <span className={styles.category}>
                                        {getCategoryNames(
                                            (product as Product & { parentCategoryNo?: number }).parentCategoryNo ?? product.categoryNo,
                                            product.categoryNo,
                                        )}
                                </span>
                                    <div className={styles.productTitleRow}>
                                    <h1 className={styles.productName}>
                                        {product.productName}
                                            {product.companyName?.trim() && (
                                                <span className={styles.companyNameInline}>{product.companyName.trim()}</span>
                                            )}
                                    </h1>
                                        <FavoriteToggleButton
                                            productNo={product.productNo}
                                            initialIsFavorite={favoriteState.isFavorite}
                                            initialLikesCount={favoriteState.likesCount}
                                            className={styles.detailFavoriteButton}
                                            onChange={(next) => {
                                                setFavoriteState(next);
                                            }}
                                        />
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

                            {metaItems.length > 0 || likesLabel ? (
                                <div className={styles.metaGrid}>
                                    {metaItems.map((item) => (
                                        <div key={item.label} className={styles.metaItem}>
                                            <span className={styles.metaLabel}>{item.label}</span>
                                            <span className={styles.metaValue}>{item.value}</span>
                                        </div>
                                    ))}
                                    {likesLabel && (
                                        <div className={`${styles.metaItem} ${styles.metaItemAccent}`}>
                                            <span className={styles.metaLabel}>관심도</span>
                                            <span className={styles.metaValue}>{likesLabel}</span>
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {nutritionRows.length > 0 && (
                                <div className={styles.nutritionTable}>
                                    <h3 className={styles.sectionTitle}>{nutritionSectionTitle}</h3>
                                    <div className={styles.nutritionContent}>
                                        {nutritionRows.map((row) => (
                                            <div key={row.label} className={styles.page_nutrition}>
                                                <span>{row.label}</span>
                                                <span>{row.value}</span>
                                                <span>{row.percent ?? ''}</span>
                                        </div>
                                        ))}
                                        </div>
                                        </div>
                                    )}
                            </div>

                        {product.ingredients && product.ingredients.trim() && (
                                <div className={styles.ingredients}>
                                    <h3 className={styles.sectionTitle}>원재료</h3>
                                    <p>
                                    {product.ingredients
                                        .split(',')
                                        .map((ingredient, index) => {
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
                    
                    {/* 관련 제품 섹션 추가 */}
                    {product && (
                        <RelatedProducts 
                            currentProductNo={product.productNo} 
                            categoryNo={product.categoryNo}
                        />
                    )}
                </div>
            </>
        );
    }