// (nutrition)/components/Navbar.tsx
'use client'

import { useAppDispatch, useAppSelector } from '../../store/store';
import { setSelectedCategories, setSearchQuery, setIsLoading, setProducts, setPageInfo, setError } from '../../store/productSlice';
import styles from './Navbar.module.css'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types/product';

// 카테고리 매핑 객체 추가
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

interface NavbarProps {
    onCategorySelect: (category: string) => void;
    onSearch: (query: string) => void;
    products?: Product[];  // optional로 변경
}

export default function Navbar({ 
    onCategorySelect, 
    onSearch, 
    products = [] 
}: NavbarProps) {
    const dispatch = useAppDispatch();
    const selectedCategories = useAppSelector(state => state.product.selectedCategories);
    const [searchInput, setSearchInput] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    
    // availableCategories를 직접 useMemo로 계산
    const availableCategories = useMemo(() => {
        const categories = new Set<string>();
        
        products.forEach(product => {
            // 부모 카테고리 찾기
            const parentCategory = Object.entries(CATEGORY_MAPPING).find(([_, value]) => 
                value === product.parentCategoryNo
            )?.[0];
            
            // 하위 카테고리 찾기
            const subCategory = Object.entries(CATEGORY_MAPPING).find(([_, value]) => 
                value === product.categoryNo
            )?.[0];
            
            if (parentCategory) categories.add(parentCategory);
            if (subCategory) categories.add(subCategory);
        });
        
        return categories;
    }, [products]);  // products가 변경될 때만 재계산

    const handleCategoryClick = (category: string, isArrowClick: boolean = false) => {
        if (isArrowClick) {
            setExpandedCategories(prev => 
                prev.includes(category) 
                    ? prev.filter(c => c !== category)
                    : [...prev, category]
            );
            return;
        }
        
        onCategorySelect(category);
    };

    const handleSubCategoryClick = (subCategory: string) => {
        onCategorySelect(subCategory);
    };

    const handleSearch = () => {
        onSearch(searchInput);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>검색</h3>
                <div className={styles.searchBox}>
                    <input 
                        type="text" 
                        placeholder="상품명을 입력하세요" 
                        className={styles.searchInput}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button 
                        className={styles.searchButton}
                        onClick={handleSearch}
                    >
                        <Image 
                            src="/images/search.png" 
                            alt="검색" 
                            width={16} 
                            height={16} 
                        />
                    </button>
                </div>
                <hr className={styles.divider} />
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>카테고리</h3>
                <ul className={styles.categoryList}>
                    <li>
                        <div 
                            className={styles.categoryItem}
                            onClick={() => handleCategoryClick('전체')}
                        >
                            전체
                        </div>
                    </li>
                    {/* 음료 카테고리 - 사용 가능한 경우에만 표시 */}
                    {availableCategories.has('음료') && (
                        <li>
                            <div className={styles.categoryContainer}>
                                <div 
                                    className={styles.categoryItem}
                                    onClick={() => handleCategoryClick('음료')}
                                >
                                    음료
                                </div>
                                <span 
                                    className={styles.arrow}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCategoryClick('음료', true);
                                    }}
                                >
                                    {expandedCategories.includes('음료') ? '▼' : '▶'}
                                </span>
                            </div>
                            {expandedCategories.includes('음료') && (
                                <ul className={styles.subCategoryList}>
                                    {['탄산', '주스', '유제품', '차', '커피', '에너지 드링크']
                                        .filter(sub => availableCategories.has(sub))
                                        .map(sub => (
                                            <li 
                                                key={sub}
                                                onClick={() => handleSubCategoryClick(sub)}
                                                className={styles.categoryItem}
                                            >
                                                {sub}
                                            </li>
                                        ))
                                    }
                                </ul>
                            )}
                        </li>
                    )}
                    {/* 제과 카테고리 */}
                    {availableCategories.has('제과') && (
                        <li>
                            <div className={styles.categoryContainer}>
                                <div 
                                    className={styles.categoryItem}
                                    onClick={() => handleCategoryClick('제과')}
                                >
                                    제과
                                </div>
                                <span 
                                    className={styles.arrow}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCategoryClick('제과', true);
                                    }}
                                >
                                    {expandedCategories.includes('제과') ? '▼' : '▶'}
                                </span>
                            </div>
                            {expandedCategories.includes('제과') && (
                                <ul className={styles.subCategoryList}>
                                    {['과자', '사탕', '젤리', '초콜릿', '시리얼']
                                        .filter(sub => availableCategories.has(sub))
                                        .map(sub => (
                                            <li 
                                                key={sub}
                                                onClick={() => handleSubCategoryClick(sub)}
                                                className={styles.categoryItem}
                                            >
                                                {sub}
                                            </li>
                                        ))
                                    }
                                </ul>
                            )}
                        </li>
                    )}
                    {/* 아이스크림 카테고리 */}
                    {availableCategories.has('아이스크림') && (
                        <li>
                            <div className={styles.categoryContainer}>
                                <div 
                                    className={styles.categoryItem}
                                    onClick={() => handleCategoryClick('아이스크림')}
                                >
                                    아이스크림
                                </div>
                                <span 
                                    className={styles.arrow}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCategoryClick('아이스크림', true);
                                    }}
                                >
                                </span>
                            </div>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}