// (categories)/drinks/page.tsx
'use client'
import { useEffect, useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setPageInfo, setIsLoading, setError, resetState } from '../../store/productSlice';
import CategoryHeader from '../../(categories)/components/CategoryHeader'
import ProductList from '../components/ProductList'
import { SearchBody, Product, ProductResponse } from '../../../types/product'

const SNACK_CONFIG = {
    category: '과자',
    subCategories: ['전체', '과자', '사탕', '젤리', '초콜릿', '시리얼'],
    categoryNo: 2, // 과자 카테고리 번호
};

const SUB_CATEGORY_MAPPING = {
    '전체': 2,    // 과자 전체
    '과자': 12,    // 실제 DB의 카테고리 번호
    '사탕': 13,
    '젤리': 14,
    '초콜릿': 15,
    '시리얼': 16,
};

export default function SnacksPage() {
    const dispatch = useAppDispatch();
    const { pageInfo, isLoading, error, filters, searchQuery } = useAppSelector(state => state.product);
    const [pageSize, setPageSize] = useState<number>(30);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('전체');

    // 컴포넌트 언마운트 시 상태 초기화
    useEffect(() => {
        return () => {
            dispatch(resetState());
            setProducts([]);
            setCurrentPage(0);
            setPageSize(30);
            setSelectedCategory('전체');
        };
    }, [dispatch]);

    // 제품 데이터 가져오기
    const fetchProducts = useCallback(async () => {
        dispatch(setIsLoading(true));
        try {
            if (searchQuery) {
                // 선택된 카테고리에 따라 검색 매개변수 설정
                const searchBody: SearchBody = {
                    query: searchQuery,
                    top_k: 1000,
                };

                // 전체 카테고리인 경우 parent_category_no 설정
                if (selectedCategory === '전체') {
                    searchBody.parent_category_no = SNACK_CONFIG.categoryNo;
                } else {
                    // 특정 서브 카테고리인 경우 category_no 설정
                    searchBody.category_no = SUB_CATEGORY_MAPPING[selectedCategory];
                }

                const searchResponse = await fetch('http://localhost:9000/categories/search/product-name', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(searchBody)
                });

                if (!searchResponse.ok) throw new Error(`Search API HTTP error! status: ${searchResponse.status}`);
                const searchData = await searchResponse.json();
                setProducts(searchData.product_results || []);
            } else {
                // 기존의 카테고리 기반 조회 로직
                const categoryNo = SUB_CATEGORY_MAPPING[selectedCategory];
                const response = await fetch(
                    `http://localhost:8000/product/category/${categoryNo}?page=0&size=1000&sort=productName,asc`
                );
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data: ProductResponse = await response.json();
                setProducts(data.content);
            }
        } catch (err: any) {
            console.error('Error fetching products:', err);
            dispatch(setError(err.message));
        } finally {
            dispatch(setIsLoading(false));
        }
    }, [dispatch, searchQuery, selectedCategory]);

    // 카테고리 변경 핸들러
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(0);
    };

    const getFilteredProducts = useCallback(() => {
        const filteredProducts = products.filter(product => {
            const per100ml = product.servingUnit === 'ml' ? 100 / product.servingSize : 1;
            const per100g = product.servingUnit === 'g' ? 100 / product.servingSize : 1;
            const caloriesPer100 = product.energyKcal * (product.servingUnit === 'ml' ? per100ml : per100g);
            const sugarPer100 = product.sugarG * (product.servingUnit === 'ml' ? per100ml : per100g);

            if (!Object.values(filters).some(value => value)) return true;

            return (
                (filters.isZeroCalorie && (caloriesPer100 === 0 || caloriesPer100 < 4)) ||
                (filters.isZeroSugar && (sugarPer100 === 0 || sugarPer100 < 0.5)) ||
                (filters.isLowCalorie && (
                    (product.servingUnit === 'ml' && caloriesPer100 < 20) ||
                    (product.servingUnit === 'g' && caloriesPer100 < 40)
                )) ||
                (filters.isLowSugar && (
                    (product.servingUnit === 'ml' && sugarPer100 < 2.5) ||
                    (product.servingUnit === 'g' && sugarPer100 < 5)
                ))
            );
        });

        const start = currentPage * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [products, filters, pageSize, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // 필터나 검색어, 페이지 크기가 변경될 때 첫 페이지로 이동
    useEffect(() => {
        setCurrentPage(0);
    }, [filters, searchQuery, pageSize]);

    // 컴포넌트 마운트 시 초기 데이터 로드 및 검색어 변경 시 데이터 다시 로드
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, selectedCategory]);

    if (error) return <div>Error: {error}</div>;

    // 필터링된 전체 제품 수 계산
    const filteredTotal = products.filter(product => {
        const per100ml = product.servingUnit === 'ml' ? 100 / product.servingSize : 1;
        const per100g = product.servingUnit === 'g' ? 100 / product.servingSize : 1;
        const caloriesPer100 = product.energyKcal * (product.servingUnit === 'ml' ? per100ml : per100g);
        const sugarPer100 = product.sugarG * (product.servingUnit === 'ml' ? per100ml : per100g);

        if (!Object.values(filters).some(value => value)) return true;

        return (
            (filters.isZeroCalorie && (caloriesPer100 === 0 || caloriesPer100 < 4)) ||
            (filters.isZeroSugar && (sugarPer100 === 0 || sugarPer100 < 0.5)) ||
            (filters.isLowCalorie && (
                (product.servingUnit === 'ml' && caloriesPer100 < 20) ||
                (product.servingUnit === 'g' && caloriesPer100 < 40)
            )) ||
            (filters.isLowSugar && (
                (product.servingUnit === 'ml' && sugarPer100 < 2.5) ||
                (product.servingUnit === 'g' && sugarPer100 < 5)
            ))
        );
    }).length;

    // 필터링된 결과에 따른 페이지 정보 계산
    const updatedPageInfo = {
        ...pageInfo,
        totalElements: filteredTotal,
        totalPages: Math.ceil(filteredTotal / pageSize),
        number: currentPage
    };

    return (
        <div className="container mx-auto">
            <CategoryHeader 
                title={SNACK_CONFIG.category}
                categories={SNACK_CONFIG.subCategories}
                totalItems={filteredTotal}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
            />
            {isLoading ? (
                <div>로딩 중...</div>
            ) : (
                <ProductList 
                    products={getFilteredProducts()}
                    pageInfo={updatedPageInfo}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                    filters={filters}
                />
            )}
        </div>
    );
}