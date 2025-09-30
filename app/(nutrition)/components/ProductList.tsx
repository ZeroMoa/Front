'use client'

import { useEffect, useState } from 'react';
import { Product, ProductResponse } from '../../types/product';
import PagingBar from '../components/PagingBar';  // PagingBar 컴포넌트 import
import Image from 'next/image';
import styles from './ProductList.module.css';
import { useRouter } from 'next/navigation';

export const CATEGORY_MAPPING = {
    '음료': 1,
    '제과': 2,
    '아이스크림': 3,
    '탄산': 4,
    '주스': 5,
    '유제품': 6,
    '차': 7,
    '커피': 8,
    '에너지 드링크': 9,
    '주류': 10,
    '과자': 12,
    '사탕': 13,
    '젤리': 14,
    '초콜릿': 15,
    '시리얼': 16
} as const;

interface ProductListProps {
    products: Product[];
    pageInfo: Omit<ProductResponse, 'content'>;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    filters: {
        isZeroCalorie: boolean;
        isZeroSugar: boolean;
        isLowCalorie: boolean;
        isLowSugar: boolean;
    };
    selectedCategories?: string[];
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

    const nutritionItems = [
        { label: product.servingUnit === 'ml' ? '용량' : '중량', value: `${product.servingSize}${product.servingUnit}` },
        product.sugarG > 0 && { label: '당류', value: `${product.sugarG}g` },
        product.energyKcal > 0 && { label: '칼로리', value: `${product.energyKcal}kcal` },
        product.carbohydrateG > 0 && { label: '탄수화물', value: `${product.carbohydrateG}g` },
        product.proteinG > 0 && { label: '단백질', value: `${product.proteinG}g` },
        product.fatG > 0 && { label: '지방', value: `${product.fatG}g` },
        product.cholesterolMg > 0 && { label: '콜레스테롤', value: `${product.cholesterolMg}mg` },
        product.sodiumMg > 0 && { label: '나트륨', value: `${product.sodiumMg}mg` },
        product.caffeineMg > 0 && { label: '카페인', value: `${product.caffeineMg}mg` },
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

export default function ProductList({ 
    products, 
    pageInfo, 
    onPageChange, 
    isLoading,
    filters
}: ProductListProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const handleProductClick = (productNo: number) => {
        router.push(`/${productNo}`);
    };

    useEffect(() => {
        setMounted(true);
        // API 응답 데이터 확인을 위한 로그
        console.log('Nutrition ProductList - All Products:', products);
        // 카페인이 있는 제품만 필터링하여 로그
        const productsWithCaffeine = products.filter(p => p.caffeineMg > 0);
        console.log('Nutrition ProductList - Products with caffeine:', productsWithCaffeine);
    }, [products]);

    const hasAlternativeSweeteners = (product: Product): boolean => {
        return Boolean(
            product.sugarAlcoholG || 
            product.alluloseG || 
            product.erythritolG || 
            product.xylitolG || 
            product.maltitolG
        );
    };

    if (!mounted) return null;

    return (
        <div>
            <div className={styles.productGrid}>
                {products.map((product) => (
                    <div 
                        key={`${product.productNo}-${product.productName}`}
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
                        {(hasAlternativeSweeteners(product) || product.caffeineMg > 0) && (
                            <div className={styles.warningIconsContainer}>
                                {hasAlternativeSweeteners(product) && (
                                    <span className={styles.tooltipContainer}>
                                        <Image 
                                            src="/images/warning.png" 
                                            alt="대체당 경고" 
                                            width={30} 
                                            height={30}
                                        />
                                        <span className={styles.tooltip}>
                                            대체당은 과다복용시 복통과 설사를 유발할 수 있어요! 조심!
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
                                src={product.imageurl 
                                    ? product.imageurl.split('/').map(segment => 
                                        encodeURIComponent(segment)
                                    ).join('/')
                                    : '/images/default-product.png'  // 기본 이미지 경로
                                }
                                alt={product.productName}
                                width={200}
                                height={200}
                                className={styles.productImage}
                                onError={(e: any) => {
                                    e.currentTarget.src = '/images/default-product.png';
                                }}
                            />
                        </div>
                        <div className={styles.productName}>{product.productName}</div>
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