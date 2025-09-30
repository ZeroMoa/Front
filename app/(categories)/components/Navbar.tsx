'use client'

import { useAppDispatch, useAppSelector } from '../../store/store';
import { setFilter, setSearchQuery } from '../../store/productSlice';
import Image from 'next/image'
import styles from './Navbar.module.css'
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const dispatch = useAppDispatch();
    const filters = useAppSelector(state => state.product.filters);
    const [searchInput, setSearchInput] = useState('');
    const pathname = usePathname();

    useEffect(() => {
        setSearchInput('');
        dispatch(setSearchQuery(''));
    }, [pathname, dispatch]);

    const handleFilterChange = (filterName: string) => {
        dispatch(setFilter({ filterName: filterName as any, value: !filters[filterName as keyof typeof filters] }));
    };

    const handleSearch = () => {
        dispatch(setSearchQuery(searchInput));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>필터</h3>
                <hr className={styles.divider} />
            </div>

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
                <h3 className={styles.sectionTitle}>칼로리와 당류</h3>
                <ul className={styles.filterList}>
                    <li>
                        <label className={styles.filterItem}>
                            <input 
                                type="checkbox"
                                checked={filters.isZeroCalorie}
                                onChange={() => handleFilterChange('isZeroCalorie')}
                            />
                            <span>제로 칼로리</span>
                        </label>
                    </li>
                    <li>
                        <label className={styles.filterItem}>
                            <input 
                                type="checkbox"
                                checked={filters.isZeroSugar}
                                onChange={() => handleFilterChange('isZeroSugar')}
                            />
                            <span>제로 슈가</span>
                        </label>
                    </li>
                    <li>
                        <label className={styles.filterItem}>
                            <input 
                                type="checkbox"
                                checked={filters.isLowCalorie}
                                onChange={() => handleFilterChange('isLowCalorie')}
                            />
                            <span>저칼로리</span>
                        </label>
                    </li>
                    <li>
                        <label className={styles.filterItem}>
                            <input 
                                type="checkbox"
                                checked={filters.isLowSugar}
                                onChange={() => handleFilterChange('isLowSugar')}
                            />
                            <span>저당</span>
                        </label>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
