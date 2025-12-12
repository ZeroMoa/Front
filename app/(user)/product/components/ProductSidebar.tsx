'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '../page.module.css';
import {
    PRODUCT_FILTER_KEYS,
    ProductFilterKey,
    CategoryPageConfig,
    CategorySlug,
    SubCategoryConfig,
    CATEGORY_CONFIG,
    CATEGORY_LABELS,
    CATEGORY_SLUG_ORDER,
} from '../config';
import Image from 'next/image';
import { getCdnUrl } from '@/lib/cdn';

const SEARCH_PLACEHOLDER = '상품명을 입력하세요';

interface ProductSidebarProps {
    mode: 'category' | 'nutrition' | 'new' | 'search';
    keyword: string;
    filters: Record<ProductFilterKey, boolean>;
    onKeywordSubmit: (keyword: string) => void;
    onFilterToggle: (filterKey: ProductFilterKey) => void;
    onResetFilters: () => void;
    lockedFilters?: ProductFilterKey[];
    selectedCategorySlug?: CategorySlug;
    onCategorySelect?: (category: CategorySlug | 'all', subSlug?: string) => void;
    categoryConfig?: CategoryPageConfig;
    selectedSubCategory?: SubCategoryConfig;
    onSubCategoryChange?: (slug: string) => void;
    highlightParentCategory?: boolean;
}

export default function ProductSidebar({
    mode,
    keyword,
    filters,
    onKeywordSubmit,
    onFilterToggle,
    onResetFilters,
    lockedFilters,
    selectedCategorySlug,
    onCategorySelect,
    categoryConfig,
    selectedSubCategory,
    onSubCategoryChange,
    highlightParentCategory = false,
}: ProductSidebarProps) {
    const [inputValue, setInputValue] = useState(keyword);

    useEffect(() => {
        setInputValue(keyword);
    }, [keyword]);

    const categoryNavItems = useMemo(
        () =>
            CATEGORY_SLUG_ORDER.map((slug) => ({
                slug,
                label: CATEGORY_LABELS[slug],
                subCategories: CATEGORY_CONFIG[slug].subCategories.filter((item) => item.slug !== 'all'),
            })),
        [],
    );

    const resolvedActiveCategorySlug = useMemo(() => {
        if (selectedCategorySlug) {
            return selectedCategorySlug;
        }
        if (!highlightParentCategory || !selectedSubCategory) {
            return undefined;
        }
        if (!selectedSubCategory.categoryNo || selectedSubCategory.categoryNo <= 0) {
            return undefined;
        }
        const matchedSlug = CATEGORY_SLUG_ORDER.find((slug) =>
            CATEGORY_CONFIG[slug].subCategories.some(
                (subCategory) => subCategory.categoryNo === selectedSubCategory.categoryNo,
            ),
        );
        return matchedSlug;
    }, [selectedCategorySlug, highlightParentCategory, selectedSubCategory]);

    const [expandedCategories, setExpandedCategories] = useState<CategorySlug[]>(
        resolvedActiveCategorySlug ? [resolvedActiveCategorySlug] : [],
    );

    useEffect(() => {
        if (resolvedActiveCategorySlug) {
            setExpandedCategories((prev) =>
                prev.includes(resolvedActiveCategorySlug) ? prev : [...prev, resolvedActiveCategorySlug],
            );
        }
    }, [resolvedActiveCategorySlug]);

    const handleCategoryToggle = (slug: CategorySlug) => {
        setExpandedCategories((prev) =>
            prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug],
        );
    };

    const handleAllCategoryClick = () => {
        onCategorySelect?.('all');
    };

    const handleCategoryButtonClick = (slug: CategorySlug) => {
        setExpandedCategories((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
        onCategorySelect?.(slug);
    };

    const handleSubCategoryButtonClick = (parentSlug: CategorySlug, subSlug: string) => {
        setExpandedCategories((prev) => (prev.includes(parentSlug) ? prev : [...prev, parentSlug]));
        onCategorySelect?.(parentSlug, subSlug);
    };

    const isCategoryActive = (slug: CategorySlug) => resolvedActiveCategorySlug === slug;

    const isSubCategoryActive = (parentSlug: CategorySlug, subSlug: string) =>
        resolvedActiveCategorySlug === parentSlug && selectedSubCategory?.slug === subSlug;

    const activeFilterCount = useMemo(
        () =>
            PRODUCT_FILTER_KEYS.filter((key) => {
                if (lockedFilters?.includes(key)) {
                    return false;
                }
                return filters[key];
            }).length,
        [filters, lockedFilters],
    );

    const handleSubmit = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) {
            alert('검색어를 입력해주세요.');
            setInputValue('');
            return;
        }
        onKeywordSubmit(trimmed);
    };

    const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarTitle}>검색</h3>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={SEARCH_PLACEHOLDER}
                        className={styles.searchInput}
                    />
                    <button type="button" className={styles.searchButton} onClick={handleSubmit}>
                        <Image
                            src={getCdnUrl('/images/search.png')}
                            alt="검색"
                            width={18}
                            height={18}
                            className={styles.searchButtonIcon}
                        />
                    </button>
                </div>
            </div>

            {(mode === 'nutrition' || mode === 'new' || mode === 'search') && onCategorySelect && (
                <div className={styles.sidebarSection}>
                    <div className={styles.categoryTreeSection}>
                        <h3 className={styles.sidebarTitle}>카테고리</h3>
                        <ul className={styles.categoryTreeList}>
                            <li>
                                <button
                                    type="button"
                                    className={`${styles.categoryAllButton} ${
                                        !resolvedActiveCategorySlug
                                            ? `${styles.categoryButtonActive} ${styles.heroCardActive}`
                                            : ''
                                    }`.trim()}
                                    onClick={handleAllCategoryClick}
                                >
                                    전체
                                </button>
                            </li>
                            {categoryNavItems.map((item) => {
                                const expanded = expandedCategories.includes(item.slug);
                                return (
                                    <li key={item.slug}>
                                        <div className={styles.categoryRow}>
                                            <button
                                                type="button"
                                                className={`${styles.categoryButton} ${
                                                    isCategoryActive(item.slug)
                                                        ? `${styles.categoryButtonActive} ${styles.heroCardActive}`
                                                        : ''
                                                }`.trim()}
                                                onClick={() => handleCategoryButtonClick(item.slug)}
                                            >
                                                {item.label}
                                            </button>
                                            {item.subCategories.length > 0 && (
                                                <button
                                                    type="button"
                                                    className={`${styles.categoryToggle} ${
                                                        expanded ? styles.categoryToggleOpen : ''
                                                    }`}
                                                    onClick={() => handleCategoryToggle(item.slug)}
                                                    aria-label={`${item.label} 하위 카테고리 ${expanded ? '접기' : '펼치기'}`}
                                                >
                                                    {expanded ? '▼' : '▶'}
                                                </button>
                                            )}
                                        </div>
                                        {expanded && item.subCategories.length > 0 && (
                                            <ul className={styles.subCategoryTree}>
                                                {item.subCategories.map((sub) => (
                                                    <li key={sub.slug}>
                                                        <button
                                                            type="button"
                                                            className={`${styles.sidebarSubCategoryButton} ${
                                                                isSubCategoryActive(item.slug, sub.slug)
                                                                    ? styles.sidebarSubCategoryButtonActive
                                                                    : ''
                                                            }`}
                                                            onClick={() => handleSubCategoryButtonClick(item.slug, sub.slug)}
                                                        >
                                                            {sub.label}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}

            {mode === 'category' && (
                <div className={styles.sidebarSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sidebarTitle}>칼로리 · 당류 필터</h3>
                        {activeFilterCount > 0 && (
                            <button type="button" className={styles.resetButton} onClick={onResetFilters}>
                                초기화 ({activeFilterCount})
                            </button>
                        )}
                    </div>
                    <ul className={styles.filterList}>
                        <li>
                            {renderFilterCheckbox({
                                label: '제로 칼로리',
                                filterKey: 'isZeroCalorie',
                                checked: filters.isZeroCalorie,
                                locked: lockedFilters?.includes('isZeroCalorie'),
                                onToggle: onFilterToggle,
                            })}
                        </li>
                        <li>
                            {renderFilterCheckbox({
                                label: '제로 슈거',
                                filterKey: 'isZeroSugar',
                                checked: filters.isZeroSugar,
                                locked: lockedFilters?.includes('isZeroSugar'),
                                onToggle: onFilterToggle,
                            })}
                        </li>
                        <li>
                            {renderFilterCheckbox({
                                label: '저칼로리',
                                filterKey: 'isLowCalorie',
                                checked: filters.isLowCalorie,
                                locked: lockedFilters?.includes('isLowCalorie'),
                                onToggle: onFilterToggle,
                            })}
                        </li>
                        <li>
                            {renderFilterCheckbox({
                                label: '저당',
                                filterKey: 'isLowSugar',
                                checked: filters.isLowSugar,
                                locked: lockedFilters?.includes('isLowSugar'),
                                onToggle: onFilterToggle,
                            })}
                        </li>
                    </ul>
                </div>
            )}
        </aside>
    );
}

interface FilterCheckboxProps {
    label: string;
    filterKey: ProductFilterKey;
    checked: boolean;
    locked?: boolean;
    onToggle: (filterKey: ProductFilterKey) => void;
}

const renderFilterCheckbox = ({ label, filterKey, checked, locked, onToggle }: FilterCheckboxProps) => (
    <label className={`${styles.filterItem} ${locked ? styles.filterItemLocked : ''}`}>
        <input
            type="checkbox"
            checked={checked}
            disabled={locked}
            onChange={() => onToggle(filterKey)}
        />
        <span>{label}</span>
        {locked && <span className={styles.lockBadge}>고정</span>}
    </label>
);

