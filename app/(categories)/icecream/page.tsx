// (categories)/drinks/page.tsx
'use client'
import { useEffect, useCallback, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setPageInfo, setIsLoading, setError, resetState } from '../../store/productSlice';
import CategoryHeader from '../../(categories)/components/CategoryHeader'
import ProductList from '../components/ProductList'
import { SearchBody, Product, ProductResponse } from '../../types/product'

export default function IceCreamPage() {
    const dispatch = useAppDispatch();
    const { pageInfo, isLoading, error, filters, searchQuery } = useAppSelector(state => state.product);
    const [pageSize, setPageSize] = useState<number>(30);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    // 컴포넌트 언마운트 시 상태 초기화
    useEffect(() => {
        return () => {
            dispatch(resetState());
            setProducts([]);
            setFilteredProducts([]);
            setCurrentPage(0);
            setPageSize(30);
        };
    }, [dispatch]);

    // 제품 데이터 가져오기
    const fetchProducts = useCallback(async () => {
        dispatch(setIsLoading(true));
        try {
            if (searchQuery) {
                const searchBody: SearchBody = {
                    query: searchQuery,
                    top_k: 1000,
                    category_no: 3  // 아이스크림 카테고리 번호
                };

                const searchResponse = await fetch('http://localhost:9000/categories/search/product-name', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(searchBody)
                });

                if (!searchResponse.ok) throw new Error(`Search API HTTP error! status: ${searchResponse.status}`);
                const searchData = await searchResponse.json();
                setProducts(searchData.product_results || []);
                setFilteredProducts(searchData.product_results || []);
            } else {
                // 기본 아이스크림 카테고리 조회
                const response = await fetch(
                    `http://localhost:8000/product/category/3?page=0&size=1000&sort=productName,asc`
                );
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data: ProductResponse = await response.json();
                setProducts(data.content);
                setFilteredProducts(data.content);
            }
        } catch (err: any) {
            console.error('Error fetching products:', err);
            dispatch(setError(err.message));
        } finally {
            dispatch(setIsLoading(false));
        }
    }, [dispatch, searchQuery]);

    // 필터링된 제품 가져오기
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
        number: currentPage,
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

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        const maxPage = Math.ceil(filteredProducts.length / pageSize) - 1;
        if (page >= 0 && page <= maxPage) {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }
    };

    // 컴포넌트 마운트 시 초기 데이터 로드
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto">
            <CategoryHeader 
                title="아이스크림"
                totalItems={filteredTotal}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
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