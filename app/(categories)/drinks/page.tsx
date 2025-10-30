// (categories)/drinks/page.tsx
'use client'
import { useEffect, useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setPageInfo, setIsLoading, setError, resetState } from '../../store/productSlice';
import CategoryHeader from '../../(categories)/components/CategoryHeader'
import ProductList from '../components/ProductList'
import { Product, ProductResponse } from '../../../types/product'

const DRINKS_CONFIG = {
    category: '음료',
    subCategories: ['전체', '탄산', '주스', '유제품', '차', '커피', '에너지 드링크','기타'],
    categoryNo: 1, // 음료 카테고리 번호
};

const SUB_CATEGORY_MAPPING = {
    '전체': 1,    // 음료 전체
    '탄산': 5,    // 실제 DB의 카테고리 번호
    '주스': 6,
    '유제품': 7,
    '차': 8,
    '커피': 9,
    '에너지 드링크': 10,
    '주류': 11,
    '기타': 12
};
 
export default function DrinksPage() {

    // dispatch 뭔지 모름
    const dispatch = useAppDispatch();

    // useAppSelector 뭔지 모름
    const { pageInfo, isLoading, error, filters, searchQuery } = useAppSelector(state => state.product);

    // useState 쓰는데 <number> 왜 들어가는지 모름
    const [pageSize, setPageSize] = useState<number>(30);

    const [currentPage, setCurrentPage] = useState<number>(0);

    const [products, setProducts] = useState<Product[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<string>('전체');


    // 컴포넌트 언마운트 시 상태 초기화 - 뭔말인지 모름
    useEffect(() => {
        return () => {
            dispatch(resetState());
            setProducts([]);
            setCurrentPage(0);
            setPageSize(30);
            setSelectedCategory('전체');
        };
    }, [dispatch]);

    // 제품 데이터 가져오기 (서버 페이징/필터링 사용)
    const fetchProducts = useCallback(async () => {
        dispatch(setIsLoading(true));
        try {
            const categoryNo = SUB_CATEGORY_MAPPING[selectedCategory];

            const params = new URLSearchParams();
            params.set('page', String(currentPage));
            params.set('size', String(pageSize));
            params.set('sort', 'productName,asc');

            // 서버로 필터 전달 (true인 경우에만)
            if (filters.isZeroCalorie) params.set('isZeroCalorie', 'true');
            if (filters.isZeroSugar) params.set('isZeroSugar', 'true');
            if (filters.isLowCalorie) params.set('isLowCalorie', 'true');
            if (filters.isLowSugar) params.set('isLowSugar', 'true');

            const response = await fetch(
                `http://localhost:8000/product/category/${categoryNo}?${params.toString()}`
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data: ProductResponse = await response.json();

            // 서버 응답을 그대로 사용
            setProducts(data.content);
            const { content, ...pageMeta } = data as any;
            dispatch(setPageInfo(pageMeta));
        } catch (err: any) {
            console.error('Error fetching products:', err);
            dispatch(setError(err.message));
        } finally {
            dispatch(setIsLoading(false));
        }
    }, [dispatch, selectedCategory, currentPage, pageSize, filters]);

    // 카테고리 변경 핸들러
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(0);
    };

    // 클라이언트 필터링/슬라이싱 제거 (서버에서 처리)

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

    // pageSize 변경 핸들러
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(0);
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto">
            <CategoryHeader 
                title={DRINKS_CONFIG.category}
                categories={DRINKS_CONFIG.subCategories}
                totalItems={pageInfo?.totalElements ?? 0}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
            />
            {isLoading ? (
                <div>로딩 중...</div>
            ) : (
                <ProductList 
                    products={products}
                    pageInfo={pageInfo}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                    filters={filters}
                />
            )}
        </div>
    );
}