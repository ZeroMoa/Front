'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { Product } from '../../types/product';
import SearchHeader from '../../../components/SearchHeader';

const RelatedProducts = ({ currentProductNo, categoryNo }: { currentProductNo: number, categoryNo: number }) => {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const router = useRouter();

    // 대체당 포함 여부 확인 함수 추가
    const hasAlternativeSweeteners = (product: Product) => {
        return Boolean(
            product.sugarAlcoholG || 
            product.alluloseG || 
            product.erythritolG
        );
    };

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                // size를 11로 설정 (현재 제품 제외하고 10개 보여주기 위해)
                const response = await fetch(
                    `http://localhost:8000/product/category/${categoryNo}?page=0&size=20&sort=productName,asc`
                );
                if (!response.ok) throw new Error('관련 제품을 가져오는데 실패했습니다');
                const data = await response.json();
                
                // 현재 제품을 제외하고 처음 10개 선택
                const filteredProducts = data.content
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
        router.push(`/${productNo}`);
    };

    if (relatedProducts.length === 0) return null;

    return (
        <div className={styles.relatedProducts}>
            <h3 className={styles.sectionTitle}>관련 제품</h3>
            <div className={styles.relatedProductsGrid}>
                {relatedProducts.map((product) => (
                    <div 
                        key={product.productNo} 
                        className={styles.relatedProductCard}
                        onClick={() => handleProductClick(product.productNo)}
                        role="button"
                        tabIndex={0}
                    >
                        {/* 경고 아이콘 추가 */}
                        {(hasAlternativeSweeteners(product) || product.caffeineMg > 0) && (
                            <div className={styles.warningIconsContainer}>
                                {hasAlternativeSweeteners(product) && (
                                    <span className={styles.tooltipContainer}>
                                        <Image 
                                            src="/images/warning.png" 
                                            alt="대체당 경고" 
                                            width={20} 
                                            height={20}
                                            className={styles.warningIcon}
                                            priority
                                        />
                                        <span className={styles.tooltip}>
                                            대체당은 과다복용시 복통과 
                                            설사를 유발할 수 있어요! 조심!
                                        </span>
                                    </span>
                                )}
                                {product.caffeineMg > 0 && (
                                    <span className={styles.tooltipContainer}>
                                        <Image 
                                            src="/images/coffee.png" 
                                            alt="카페인 경고" 
                                            width={20} 
                                            height={20}
                                            className={styles.coffeeIcon}
                                            priority
                                        />
                                        <span className={styles.tooltip}>
                                            카페인이 포함돼있어요! 불면증을 조심하세요~
                                        </span>
                                    </span>
                                )}
                            </div>
                        )}
                        <div className={styles.relatedProductImage}>
                            <Image
                                src={(() => {
                                    if (!product.imageurl) return '/images/default-product.png';
                                    return product.imageurl.split('/')
                                        .map((part, index, array) => {
                                            if (index === array.length - 1) {
                                                const [filename, ext] = part.split('.');
                                                return `${encodeURIComponent(filename)}.${ext}`;
                                            }
                                            return encodeURIComponent(part);
                                        })
                                        .join('/');
                                })()}
                                alt={product.productName}
                                width={100}
                                height={100}
                                className={styles.productImage}
                                unoptimized
                            />
                        </div>
                        <div className={styles.relatedProductInfo}>
                            <h4>{product.productName}</h4>
                            <div className={styles.nutritionDivider} />
                            <div className={styles.relatedServingSize}>
                                내용량: {product.servingSize}{product.servingUnit}
                            </div>
                            <div className={styles.nutritionInfo}>
                                {product.energyKcal > 0 && (
                                    <div className={styles.related_nutrition}>
                                        <span className={styles.related_nutrition_label}>칼로리</span>
                                        <span>{`${product.energyKcal}kcal`}</span>
                                    </div>
                                )}
                                {product.sugarG > 0 && (
                                    <div className={styles.related_nutrition}>
                                        <span className={styles.related_nutrition_label}>당류</span>
                                        <span>{`${product.sugarG}g`}</span>
                                    </div>
                                )}
                                {product.sugarAlcoholG > 0 && (
                                    <div className={styles.related_nutrition}>
                                        <span className={styles.related_nutrition_label}>당알코올</span>
                                        <span>{`${product.sugarAlcoholG}g`}</span>
                                    </div>
                                )}
                                {product.alluloseG > 0 && (
                                    <div className={styles.related_nutrition}>
                                        <span className={styles.related_nutrition_label}>알룰로스</span>
                                        <span>{`${product.alluloseG}g`}</span>
                                    </div>
                                )}
                                {product.erythritolG > 0 && (
                                    <div className={styles.related_nutrition}>
                                        <span className={styles.related_nutrition_label}>에리스리톨</span>
                                        <span>{`${product.erythritolG}g`}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function ProductDetail() {

    // 대체당 포함 여부 확인 함수 추가
    const hasAlternativeSweeteners = (product: Product) => {
        return Boolean(
            product.sugarAlcoholG || 
            product.alluloseG || 
            product.erythritolG
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
                const response = await fetch(`http://localhost:8000/product/${params.productNo}`);
                if (!response.ok) throw new Error('제품을 찾을 수 없습니다');
                const data = await response.json();
                
                if (mounted) {
                    setProduct(data);
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

    // 이미지 URL 처리 로직
    const processedImageUrl = (() => {
        if (!product?.imageurl) return '/images/default-product.png';
        
        return product.imageurl.split('/')
            .map((part, index, array) => {
                if (index === array.length - 1) {
                    const [filename, ext] = part.split('.');
                    return `${encodeURIComponent(filename)}.${ext}`;
                }
                return encodeURIComponent(part);
            })
            .join('/');
    })();

    return (
        <>
            <SearchHeader />
            <div className={styles.wrapper}>
                <main className={styles.productContainer}>
                    {/* 왼쪽: 상품 이미지 섹션 */}
                    <div className={styles.imageSection}>
                        <div className={styles.imageWrapper}>
                            <Image
                                src={processedImageUrl}
                                alt={product?.productName || '제품 이미지'}
                                width={430}
                                height={552}
                                className={styles.productImage}
                                unoptimized
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/default-product.png';
                                }}
                            />
                        </div>
                    </div>

                    {/* 오른쪽: 상품 정보 섹션 */}
                    <section className={styles.infoSection}>
                        {/* 상품 기본 정보 */}
                        <div className={styles.productHeader}>
                            <div className={styles.productMeta}>
                                <span className={styles.category}>
                                    {getCategoryNames(product.parentCategoryNo, product.categoryNo)}
                                </span>
                                <div className={styles.productTitleContainer}>
                                    <h1 className={styles.productName}>
                                        {product.productName}
                                        <span className={styles.companyName}>| {product.companyName || '제조사 정보 없음'}</span>
                                    </h1>
                                    {/* 경고 아이콘 컨테이너 */}
                                    <div className={styles.warningIconsContainer}>
                                        {hasAlternativeSweeteners(product) && (
                                            <Image 
                                                src="/images/warning.png" 
                                                alt="대체당 경고" 
                                                width={24} 
                                                height={24}
                                                className={styles.warningIcon}
                                                priority
                                            />
                                        )}
                                        {product.caffeineMg > 0 && (
                                            <Image 
                                                src="/images/coffee.png" 
                                                alt="카페인 경고" 
                                                width={24} 
                                                height={24}
                                                className={styles.coffeeIcon}
                                                priority
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 영양 정보 테이블 */}
                        <div className={styles.nutritionTable}>
                            <div className={styles.servingSize}>
                                내용량: {product.servingSize}{product.servingUnit}
                            </div>
                            <h3 className={styles.sectionTitle}>영양성분</h3>
                            {/* 총 내용량 추가 */}
                            <div className={styles.nutritionContent}>
                                {/* 기본 영양성분 - 항상 표시 */}
                                <div className={styles.page_nutrition}>
                                    <span>열량</span>
                                    <span>{!product.energyKcal ? '없음' : `${product.energyKcal}kcal`}</span>
                                    <span></span>
                                </div>
                                <div className={styles.page_nutrition}>
                                    <span>탄수화물</span>
                                    <span>{!product.carbohydrateG ? '없음' : `${product.carbohydrateG}g`}</span>
                                    <span>{product.carbohydrateG ? `${Math.round((product.carbohydrateG / 324) * 100)}%` : '-'}</span>
                                </div>
                                <div className={styles.page_nutrition}>
                                    <span>당류</span>
                                    <span>{!product.sugarG ? '없음' : `${product.sugarG}g`}</span>
                                    <span>{product.sugarG ? `${Math.round((product.sugarG / 100) * 100)}%` : '-'}</span>
                                </div>
                                <div className={styles.page_nutrition}>
                                    <span>단백질</span>
                                    <span>{!product.proteinG ? '없음' : `${product.proteinG}g`}</span>
                                    <span>{product.proteinG ? `${Math.round((product.proteinG / 55) * 100)}%` : '-'}</span>
                                </div>
                                <div className={styles.page_nutrition}>
                                    <span>지방</span>
                                    <span>{!product.fatG ? '없음' : `${product.fatG}g`}</span>
                                    <span>{product.fatG ? `${Math.round((product.fatG / 54) * 100)}%` : '-'}</span>
                                </div>
                                <div className={styles.page_nutrition}>
                                    <span>포화지방</span>
                                    <span>{!product.saturatedFattyAcidsG ? '없음' : `${product.saturatedFattyAcidsG}g`}</span>
                                    <span>{product.saturatedFattyAcidsG ? `${Math.round((product.saturatedFattyAcidsG / 15) * 100)}%` : '-'}</span>
                                </div>
                                <div className={styles.page_nutrition}>
                                    <span>트랜스지방</span>
                                    <span>{!product.transFattyAcidsG ? '없음' : `${product.transFattyAcidsG}g`}</span>
                                    <span>-</span>
                                </div>
                                <div className={styles.page_nutrition}>
                                    <span>콜레스테롤</span>
                                    <span>{!product.cholesterolMg ? '없음' : `${product.cholesterolMg}mg`}</span>
                                    <span>{product.cholesterolMg ? `${Math.round((product.cholesterolMg / 300) * 100)}%` : '-'}</span>
                                </div>
                                <div className={styles.page_nutrition}>
                                    <span>나트륨</span>
                                    <span>{!product.sodiumMg ? '없음' : `${product.sodiumMg}mg`}</span>
                                    <span>{product.sodiumMg ? `${Math.round((product.sodiumMg / 2000) * 100)}%` : '-'}</span>
                                </div>

                                    {/* 선택적 영양성분 - 값이 있을 때만 표시 */}
                                    {product.caffeineMg > 0 && (
                                        <div className={styles.page_nutrition}>
                                            <span>카페인</span>
                                            <span>{`${product.caffeineMg}mg`}</span>
                                            <span>{`${Math.round((product.caffeineMg / 400) * 100)}%`}</span>
                                        </div>
                                    )}
                                    {product.taurineMg > 0 && (
                                        <div className={styles.page_nutrition}>
                                            <span>타우린</span>
                                            <span>{`${product.taurineMg}mg`}</span>
                                            <span>-</span>
                                        </div>
                                    )}
                                    {/* 대체당 정보 - 값이 있을 때만 표시 */}
                                    {product.sugarAlcoholG > 0 && (
                                        <div className={styles.page_nutrition}>
                                            <span>당알코올</span>
                                            <span>{`${product.sugarAlcoholG}g`}</span>
                                            <span>-</span>
                                        </div>
                                    )}
                                    {product.alluloseG > 0 && (
                                        <div className={styles.page_nutrition}>
                                            <span>알룰로스</span>
                                            <span>{`${product.alluloseG}g`}</span>
                                            <span>-</span>
                                        </div>
                                    )}
                                    {product.erythritolG > 0 && (
                                        <div className={styles.page_nutrition}>
                                            <span>에리스리톨</span>
                                            <span>{`${product.erythritolG}g`}</span>
                                            <span>-</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 원재료 정보 */}
                            {product.ingredients && (
                                <div className={styles.ingredients}>
                                    <h3 className={styles.sectionTitle}>원재료</h3>
                                    <p>
                                        {product.ingredients.split(',').map((ingredient, index) => (
                                            <span key={index} className={styles.ingredient}>
                                                {ingredient.trim()}
                                                {index < product.ingredients.split(',').length - 1 && ','}
                                            </span>
                                        ))}
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