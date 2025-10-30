'use client'
import { useEffect, useState } from 'react';
import { Product, ProductResponse } from '../../../types/product';
import PagingBar from './PagingBar';
import Image from 'next/image';
import styles from './ProductList.module.css';
import { useRouter } from 'next/navigation';

interface ProductListProps {
    products: Product[];
    pageInfo: Omit<ProductResponse, 'content'> | null;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    filters: {
        isZeroCalorie: boolean;
        isZeroSugar: boolean;
        isLowCalorie: boolean;
        isLowSugar: boolean;
    };
}

const NutritionInfo = ({ product }: { product: Product }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 개별 제품의 영양 정보 확인
        console.log('Product Nutrition Info:', {
            name: product.productName,
            caffeine: product.caffeineMg,
            allNutrition: {
                sugar: product.sugarG,
                energy: product.energyKcal,
                caffeine: product.caffeineMg,
                // ... 기타 영양 정보
            }
        });
    }, [product]);

    if (!mounted) return null;

    // 디버깅을 위한 로그 추가
    console.log('Product caffeine:', product.productName, product.caffeineMg);

    // 표시할 영양성분 배열 생성 (값이 있고 0이 아닌 것만)
    const nutritionItems = [
        (product.servingSize && product.servingUnit) && 
            { label: '총 내용량', value: `${product.servingSize}${product.servingUnit}` },
        (product.caffeineMg !== undefined && product.caffeineMg > 0) && 
            { label: '카페인', value: `${product.caffeineMg}mg` },
        product.sugarG > 0 && { label: '당류', value: `${product.sugarG}g` },
        product.energyKcal > 0 && { label: '칼로리', value: `${product.energyKcal}kcal` },
        product.carbohydrateG > 0 && { label: '탄수화물', value: `${product.carbohydrateG}g` },
        product.proteinG > 0 && { label: '단백질', value: `${product.proteinG}g` },
        product.fatG > 0 && { label: '지방', value: `${product.fatG}g` },
        product.cholesterolMg > 0 && { label: '콜레스테롤', value: `${product.cholesterolMg}mg` },
        product.sodiumMg > 0 && { label: '나트륨', value: `${product.sodiumMg}mg` },
        product.sugarAlcoholG > 0 && { label: '당알코올', value: `${product.sugarAlcoholG}g` },
        product.alluloseG > 0 && { label: '알룰로스', value: `${product.alluloseG}g` },
        product.erythritolG > 0 && { label: '에리스리톨', value: `${product.erythritolG}g` }
    ].filter(Boolean);

    return (
        <div className={styles.nutritionTable}>
            {nutritionItems.map((item, index) => (
                <div key={index} className={styles.nutritionRow}>
                    <span className={styles.nutritionLabel}>{item.label}</span>
                    <span className={styles.nutritionValue}>{item.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function ProductList({ products, pageInfo, onPageChange, isLoading = false, filters }: ProductListProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const handleProductClick = (productNo: number) => {
        router.push(`/${productNo}`);
    };

    useEffect(() => {
        setMounted(true);
        // API 응답 데이터 확인을 위한 로그
        console.log('Categories ProductList - All Products:', products);
        // 카페인이 있는 제품만 필터링하여 로그
        const productsWithCaffeine = products.filter(p => p.caffeineMg > 0);
        console.log('Categories ProductList - Products with caffeine:', productsWithCaffeine);
    }, [products]);

    // 대체당 포함 여부 확인 함수
    const hasAlternativeSweeteners = (product: Product) => {
        return product.sugarAlcoholG || product.alluloseG || 
               product.erythritolG || product.xylitolG || product.maltitolG;
    };

    const filterProducts = (products: Product[]) => {
        return products.filter(product => {
            const per100Unit = product.servingUnit === 'ml' ? 100 / product.servingSize : 100 / product.servingSize;
            const caloriesPer100 = product.energyKcal * per100Unit;
            const sugarPer100 = product.sugarG * per100Unit;

            if (filters.isZeroCalorie && caloriesPer100 >= 4) return false;
            if (filters.isZeroSugar && sugarPer100 >= 0.5) return false;
            if (filters.isLowCalorie) {
                if (product.servingUnit === 'ml' && caloriesPer100 >= 20) return false;
                if (product.servingUnit === 'g' && caloriesPer100 >= 40) return false;
            }
            if (filters.isLowSugar) {
                if (product.servingUnit === 'ml' && sugarPer100 >= 2.5) return false;
                if (product.servingUnit === 'g' && sugarPer100 >= 5) return false;
            }
            return true;
        });
    };

    // 컴포넌트가 마운트되기 전에는 필터링하지 않음
    const filteredProducts = mounted ? filterProducts(products) : [];

    if (!mounted) return null;

    return (
        <div>
            <div className={styles.productGrid}>
                {products
                    .filter(product => product.imageUrl)
                    .map((product, index) => (
                    <div 
                        key={`${product.productNo}-${index}`}
                        className={styles.productCard}
                        onClick={() => handleProductClick(product.productNo)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleProductClick(product.productNo);
                            }
                        }}
                    >
                        {(hasAlternativeSweeteners(product) || Boolean(product.caffeineMg)) && (
                            <div className={styles.warningIconsContainer}>
                                {hasAlternativeSweeteners(product) && (
                                    <span className={styles.tooltipContainer}>
                                        <Image 
                                            src="/images/warning.png" 
                                            alt="대체당 경고" 
                                            width={30} 
                                            height={30}
                                            className={styles.warningIcon}
                                            priority
                                        />
                                        <span className={styles.tooltip}>
                                            대체당은 과다복용시 복통과 
                                            설사를 유발할 수 있어요! 조심!

                                        </span>
                                    </span>
                                )}
                                {Boolean(product.caffeineMg) && (
                                    <span className={styles.tooltipContainer}>
                                        <Image 
                                            src="/images/coffee.png" 
                                            alt="카페인 경고" 
                                            width={30} 
                                            height={30}
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
                        <div 
                            className={styles.imageContainer}
                            onClick={() => router.push(`/${product.productNo}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Image
                                src={(() => {
                                    if (!product.imageUrl) return '/images/default-product.png';
                                    
                                    const processedUrl = product.imageUrl.split('/')
                                        .map((part, index, array) => {
                                            if (index === array.length - 1) {
                                                const [filename, ext] = part.split('.');
                                                return `${encodeURIComponent(filename)}.${ext}`;
                                            }
                                            return encodeURIComponent(part);
                                        })
                                        .join('/');
                                    
                                    return processedUrl;
                                })()}
                                alt={product.productName || '제품 이미지'}
                                width={200}
                                height={200}
                                className={styles.productImage}
                                unoptimized
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/default-product.png';
                                }}
                            />
                        </div>
                        <div className={styles.productName}>{product.productName || '제품명 없음'}</div>
                        <NutritionInfo product={product} />
                    </div>
                ))}
            </div>
            {pageInfo && (
                <PagingBar 
                    currentPage={pageInfo.number}
                    totalPages={pageInfo.totalPages}
                    onPageChange={onPageChange}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}