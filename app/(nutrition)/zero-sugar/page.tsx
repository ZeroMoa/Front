'use client'

import { useEffect, useCallback, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setIsLoading, setError, resetState } from '../../store/productSlice';
import CategoryHeader from '../components/CategoryHeader'
import ProductList from '../components/ProductList'
import Navbar, { CATEGORY_MAPPING } from '../components/Navbar';
import { Product, SearchBody } from '../../../types/product';

export default function ZeroSugarPage() {
    const dispatch = useAppDispatch();
    const { isLoading, error, filters } = useAppSelector(state => state.product);
    const [pageSize, setPageSize] = useState<number>(30);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('전체');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // 컴포넌트 언마운트 시 상태 초기화
    useEffect(() => {
        return () => {
            dispatch(resetState());
            setProducts([]);
            setFilteredProducts([]);
            setCurrentPage(0);
            setPageSize(30);
            setSelectedCategory('전체');
        };
    }, [dispatch]);

    // 제로 칼로리 제품 전체 조회
    const fetchProducts = useCallback(async () => {
        dispatch(setIsLoading(true));
        try {
            if (searchQuery) {
                const searchBody: SearchBody = {
                    query: searchQuery,
                    top_k: 1000,
                    nutrition_criteria: {
                        type: "zero_sugar"
                    }
                };

                const searchResponse = await fetch('http://localhost:9000/nutrition/search/product-name', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(searchBody)
                });

                if (!searchResponse.ok) throw new Error(`Search API HTTP error! status: ${searchResponse.status}`);
                const searchData = await searchResponse.json();
                
                // 검색 응답 데이터 확인
                console.log('Search API Response:', {
                    requestBody: searchBody,
                    responseData: searchData,
                    resultCount: searchData.product_results ? searchData.product_results.length : 0
                });

                const searchResults = searchData.product_results || [];
                setProducts(searchResults);
                setFilteredProducts(searchResults);
            } else {
                // 기존의 전체 데이터 조회 로직
                const response = await fetch(
                    `http://localhost:8000/product/zero-sugar?page=0&size=1000&sort=productName,asc`
                );
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setProducts(data.content);
                setFilteredProducts(data.content);
            }
        } catch (err: any) {
            console.error('Error:', err);
            dispatch(setError(err.message));
        } finally {
            dispatch(setIsLoading(false));
        }
    }, [dispatch, searchQuery]);

    // 검색어나 선택된 카테고리가 변경될 때마다 데이터 다시 로드
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, searchQuery]);

    // 카테고리 변경 시 필터링
    useEffect(() => {
        if (selectedCategory === '전체') {
            setFilteredProducts(products);
        } else {
            const categoryNo = CATEGORY_MAPPING[selectedCategory];
            const filtered = products.filter(product => 
                product.categoryNo === categoryNo || 
                product.parentCategoryNo === categoryNo
            );
            setFilteredProducts(filtered);
        }
        setCurrentPage(0);
    }, [selectedCategory, products]);

    // 검색어 설정 핸들러
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        dispatch(setIsLoading(true));
        
        try {
            const searchBody: SearchBody = {
                query,
                top_k: 1000,
                nutrition_criteria: {
                    type: "zero_calorie"
                }
            } as SearchBody;

            if (selectedCategory !== '전체') {
                (searchBody as any).category_no = CATEGORY_MAPPING[selectedCategory];
            }

            const response = await fetch('http://localhost:9000/nutrition/search/product-name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(searchBody)
            });

            if (!response.ok) throw new Error(`Search API HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            setProducts(data.product_results || []);
            setFilteredProducts(data.product_results || []);
            setCurrentPage(0);
        } catch (err: any) {
            console.error('Error:', err);
            dispatch(setError(err.message));
        } finally {
            dispatch(setIsLoading(false));
        }
    };

    // 페이지네이션된 제품 목록 가져오기
    const getFilteredProducts = useCallback(() => {
        const start = currentPage * pageSize;
        const end = start + pageSize;
        return filteredProducts.slice(start, end);
    }, [filteredProducts, currentPage, pageSize]);

    // 페이지 정보 계산
    const currentPageInfo = useMemo(() => ({
        number: currentPage,
        totalPages: Math.ceil(filteredProducts.length / pageSize),
        first: currentPage === 0,
        last: currentPage >= Math.ceil(filteredProducts.length / pageSize) - 1,
        totalElements: filteredProducts.length,
        size: pageSize,
        numberOfElements: getFilteredProducts().length,
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
    }), [filteredProducts, currentPage, pageSize, getFilteredProducts]);

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        const maxPage = Math.ceil(filteredProducts.length / pageSize) - 1;
        if (page >= 0 && page <= maxPage) {
            setCurrentPage(page);
            window.scrollTo(0, 0);  // 페이지 변경 시 상단으로 스크롤
        }
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(0);
        
        // 선택된 카테고리에 따라 제품 필터링
        if (category === '전체') {
            setFilteredProducts(products);
        } else {
            const categoryNo = CATEGORY_MAPPING[category];
            const filtered = products.filter(product => 
                product.categoryNo === categoryNo || 
                product.parentCategoryNo === categoryNo
            );
            setFilteredProducts(filtered);
        }
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto">
            <CategoryHeader 
                title="제로 슈거"
                totalItems={filteredProducts.length}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                category="zero-sugar"
            />
            <Navbar 
                onCategorySelect={handleCategorySelect}
                onSearch={handleSearch}
                products={products}
            />
            {isLoading ? (
                <div>로딩 중...</div>
            ) : (
                <ProductList 
                    products={getFilteredProducts()}
                    pageInfo={currentPageInfo}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                    filters={filters}
                />
            )}
        </div>
    );
}