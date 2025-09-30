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
    }, []);

    if (!mounted) return null;

    // 표시할 영양성분 배열 생성 (값이 있고 0이 아닌 것만)
    const nutritionItems = [
        // 총 내용량은 servingSize가 0이 아니고 servingUnit이 존재할 때만 표시
        (product.servingSize > 0 && product.servingUnit) && 
            { label: '총 내용량', value: `${product.servingSize}${product.servingUnit}` },
        product.sugarG > 0 && { label: '당류', value: `${product.sugarG}g` },
        product.energyKcal > 0 && { label: '칼로리', value: `${product.energyKcal}kcal` },
        product.carbohydrateG > 0 && { label: '탄수화물', value: `${product.carbohydrateG}g` },
        product.sodiumMg > 0 && { label: '나트륨', value: `${product.sodiumMg}mg` },
        product.sugarAlcoholG > 0 && { label: '당알코올', value: `${product.sugarAlcoholG}g` },
        product.alluloseG > 0 && { label: '알룰로스', value: `${product.alluloseG}g` },
        product.erythritolG > 0 && { label: '에리스리톨', value: `${product.erythritolG}g` }
    ].filter(Boolean);

    // 표시할 영양성분이 없으면 null 반환
    if (nutritionItems.length === 0) return null;

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

export default function ProductList({ products, pageInfo, onPageChange, isLoading, filters }: ProductListProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const handleProductClick = (productNo: number) => {
        router.push(`/${productNo}`);
    };

    useEffect(() => {
        setMounted(true);
        // API 응답 데이터 확인을 위한 로그
        console.log('Chat ProductList - All Products:', products);
        // 카페인이 있는 제품만 필터링하여 로그
        const productsWithCaffeine = products.filter(p => p.caffeineMg > 0);
        console.log('Chat ProductList - Products with caffeine:', productsWithCaffeine);
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

    // 유효한 제품만 필터링
    const validProducts = products.filter(product => 
        product.imageurl && product.servingSize > 0 && product.servingUnit
    );

    // 페이지 정보 업데이트
    const updatedPageInfo = {
        ...pageInfo,
        totalElements: validProducts.length,
        totalPages: Math.ceil(validProducts.length / pageInfo.pageable.pageSize)
    };

    // 현재 페이지에 해당하는 제품만 표시
    const startIndex = pageInfo.pageable.offset;
    const endIndex = startIndex + pageInfo.pageable.pageSize;
    const currentPageProducts = validProducts.slice(startIndex, endIndex);

    if (!mounted) return null;

    return (
        <div>
            <div className={styles.productGrid}>
                {currentPageProducts.map((product) => (
                    <div 
                        key={product.productNo}
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
                                src={(() => {
                                    if (!product.imageurl) return '/images/default-product.png';
                                    
                                    const processedUrl = product.imageurl.split('/')
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
                        <div className={styles.productName}>{product.productName}</div>
                        <NutritionInfo product={product} />
                    </div>
                ))}
            </div>
            <PagingBar 
                currentPage={pageInfo.number}
                totalPages={updatedPageInfo.totalPages}
                onPageChange={onPageChange}
                isLoading={isLoading}
            />
        </div>
    );
}