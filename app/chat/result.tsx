'use client';

import { useState, useEffect } from 'react';
import CategoryHeader from './components/CategoryHeader';
import ProductList from './components/ProductList';
import Navbar, { CATEGORY_MAPPING } from './components/Navbar';
import { Product } from '../types/product';

interface ResultPageProps { 
    products: Product[];
}

export default function ResultPage({ products }: ResultPageProps) {
    // 유효한 제품만 필터링하는 함수
    const getValidProducts = (prods: Product[]) => {
        return prods.filter(product => 
            product.imageurl && product.servingSize > 0 && product.servingUnit
        );
    };

    // 초기 필터링된 제품 설정
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(getValidProducts(products));
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [pageSize, setPageSize] = useState<number>(30);
    const [currentPage, setCurrentPage] = useState<number>(0);

    // products가 변경될 때마다 유효한 제품만 필터링
    useEffect(() => {
        setFilteredProducts(getValidProducts(products));
    }, [products]);

    const handleNutritionFilter = (type: string) => {
        if (type === 'ALL') {
            setFilteredProducts(getValidProducts(products));
            return;
        }

        const filtered = getValidProducts(products).filter(product => {
            // 100g/ml 당 영양성분 계산
            const per100Unit = product.servingUnit === 'ml' ? 
                100 / product.servingSize : 
                100 / product.servingSize;
            
            const caloriesPer100 = product.energyKcal * per100Unit;
            const sugarPer100 = product.sugarG * per100Unit;

            switch (type) {
                case 'ZERO_CALORIE':
                    return caloriesPer100 < 4;
                case 'ZERO_SUGAR':
                    return sugarPer100 < 0.5;
                case 'LOW_CALORIE':
                    return product.servingUnit === 'ml' ? 
                        caloriesPer100 < 20 : 
                        caloriesPer100 < 40;
                case 'LOW_SUGAR':
                    return product.servingUnit === 'ml' ? 
                        sugarPer100 < 2.5 : 
                        sugarPer100 < 5;
                default:
                    return true;
            }
        });
        
        setFilteredProducts(filtered);
        setCurrentPage(0);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filtered = getValidProducts(products).filter(product => 
            product.productName.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredProducts(filtered);
    };

    const handleCategorySelect = (category: string) => {
        if (category === '전체') {
            setFilteredProducts(getValidProducts(products));
            return;
        }

        const filtered = getValidProducts(products).filter(product => {
            // 선택된 카테고리의 번호
            const categoryNo = CATEGORY_MAPPING[category as keyof typeof CATEGORY_MAPPING];
            
            // 부모 카테고리인 경우 (음료, 제과, 아이스크림)
            if (['음료', '제과', '아이스크림'].includes(category)) {
                return product.parentCategoryNo === categoryNo;
            }
            
            // 하위 카테고리인 경우
            return product.categoryNo === categoryNo;
        });

        setFilteredProducts(filtered);
        setCurrentPage(0); // 페이지를 첫 페이지로 리셋
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // 페이지 정보 생성
    const pageInfo = {
        number: currentPage,
        totalPages: Math.ceil(filteredProducts.length / pageSize),
        first: currentPage === 0,
        last: currentPage >= Math.ceil(filteredProducts.length / pageSize) - 1,
        totalElements: filteredProducts.length,
        size: pageSize,
        numberOfElements: filteredProducts.length,
        empty: filteredProducts.length === 0,
        pageable: {
            sort: {
                empty: false,
                sorted: true,
                unsorted: false
            },
            offset: currentPage * pageSize,
            pageNumber: currentPage,
            pageSize: pageSize,
            paged: true,
            unpaged: false
        },
        sort: {
            empty: false,
            sorted: true,
            unsorted: false
        }
    };

    return (
        <div style={{ 
            width: '1050px', 
            margin: '0 auto',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
        }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                <Navbar 
                    onSearch={handleSearch}
                    products={getValidProducts(products)}
                    onCategorySelect={handleCategorySelect}
                />
                <div style={{ flex: 1 }}>
                    <CategoryHeader 
                        title="검색 결과"
                        totalItems={filteredProducts.length}
                        onNutritionFilter={handleNutritionFilter}
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                    />
                    <ProductList 
                        products={filteredProducts}
                        pageInfo={pageInfo}
                        onPageChange={handlePageChange}
                        isLoading={false}
                        filters={{
                            isZeroCalorie: false,
                            isZeroSugar: false,
                            isLowCalorie: false,
                            isLowSugar: false
                        }}
                    />
                </div>
            </div>
        </div>
    );
} 