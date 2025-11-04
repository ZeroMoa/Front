'use client';

import { useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from '../page.module.css';
import {
    CategoryPageConfig,
    CategorySlug,
    DEFAULT_FILTER_STATE,
    NutritionPageConfig,
    NutritionSlug,
    ProductFilterKey,
    ProductPageConfig,
    SubCategoryConfig,
    CATEGORY_LABELS,
    PRODUCT_FILTER_KEYS,
} from '../config';
import type { ProductResponse } from '@/types/product';
import ProductSidebar from './ProductSidebar';
import ProductGrid from './ProductGrid';
import ProductPagination from './ProductPagination';

type FilterState = typeof DEFAULT_FILTER_STATE;

type PageMode = 'category' | 'nutrition';

type HeroAccentClass = 'heroCardZeroCalorie' | 'heroCardZeroSugar' | 'heroCardLowCalorie' | 'heroCardLowSugar';

interface HeroBannerItem {
    slug: NutritionSlug;
    label: string;
    accentClass: HeroAccentClass;
}

const HERO_BANNER_ITEMS: HeroBannerItem[] = [
    {
        slug: 'zero-calorie',
        label: '제로 칼로리',
        accentClass: 'heroCardZeroCalorie',
    },
    {
        slug: 'zero-sugar',
        label: '제로 슈거',
        accentClass: 'heroCardZeroSugar',
    },
    {
        slug: 'low-calorie',
        label: '저칼로리',
        accentClass: 'heroCardLowCalorie',
    },
    {
        slug: 'low-sugar',
        label: '저당',
        accentClass: 'heroCardLowSugar',
    },
];

interface ProductPageClientProps {
    mode: PageMode;
    categorySlug?: CategorySlug;
    collectionSlug?: NutritionSlug;
    config: ProductPageConfig;
    data: ProductResponse;
    selectedSubCategory: SubCategoryConfig;
    page: number;
    size: number;
    sort: string;
    filters: FilterState;
    keyword: string;
    lockedFilters?: ProductFilterKey[];
}

const PAGE_PARAM_KEYS: Array<ProductFilterKey | 'page' | 'size' | 'sort' | 'sub' | 'keyword' | 'type' | 'collection' | 'category'> = [
    'type',
    'collection',
    'category',
    'page',
    'size',
    'sort',
    'sub',
    'keyword',
    'isZeroCalorie',
    'isZeroSugar',
    'isLowCalorie',
    'isLowSugar',
];

const ensurePositiveInteger = (value: number, fallback: number) =>
    Number.isFinite(value) && value >= 0 ? value : fallback;

export default function ProductPageClient({
    mode,
    categorySlug: activeCategorySlug,
    collectionSlug,
    config,
    data,
    selectedSubCategory,
    page,
    size,
    sort,
    filters,
    keyword,
    lockedFilters,
}: ProductPageClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const pageSizeOptions = config.pageSizeOptions ?? [30, 60, 90];
    const totalPages = data.totalPages ?? 0;
    const totalElements = data.totalElements ?? data.content.length;

    const selectedPageSize = pageSizeOptions.includes(size) ? size : pageSizeOptions[0];

    const currentFilters = useMemo(() => filters, [filters]);

    const activeHeroSlug = useMemo(() => {
        if (collectionSlug) {
            return collectionSlug;
        }
        if (currentFilters.isZeroCalorie) {
            return 'zero-calorie';
        }
        if (currentFilters.isZeroSugar) {
            return 'zero-sugar';
        }
        if (currentFilters.isLowCalorie) {
            return 'low-calorie';
        }
        if (currentFilters.isLowSugar) {
            return 'low-sugar';
        }
        return undefined;
    }, [collectionSlug, currentFilters]);

    const selectedCategoryLabel = useMemo(() => {
        if (mode !== 'nutrition' || !activeCategorySlug) {
            return null;
        }
        return CATEGORY_LABELS[activeCategorySlug] ?? null;
    }, [mode, activeCategorySlug]);

    const summaryLabel = selectedCategoryLabel
        ? `${selectedCategoryLabel} · ${selectedSubCategory.label}`
        : selectedSubCategory.label;

    const baseParamKey = mode === 'category' ? 'type' : 'collection';
    const baseParamValue = mode === 'category' ? activeCategorySlug : collectionSlug;

    const commitUpdates = (updates: Record<string, string | number | boolean | undefined | null>) => {
        const nextParams = new URLSearchParams(searchParams.toString());

        // 항상 선택된 카테고리 유지
        if (baseParamKey && baseParamValue) {
            nextParams.set(baseParamKey, String(baseParamValue));
        }

        PAGE_PARAM_KEYS.forEach((key) => {
            if (key !== baseParamKey && !updates.hasOwnProperty(key)) {
                return;
            }
            if (mode === 'category' && key === 'collection') {
                nextParams.delete('collection');
            }
            if (mode === 'nutrition' && key === 'type') {
                nextParams.delete('type');
            }
        });

        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '' || value === false) {
                nextParams.delete(key);
            } else {
                nextParams.set(key, String(value));
            }
        });

        startTransition(() => {
            router.replace(`${pathname}?${nextParams.toString()}`, { scroll: true });
        });
    };

    const handlePageChange = (nextPage: number) => {
        commitUpdates({ page: ensurePositiveInteger(nextPage, 0) });
    };

    const handlePageSizeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
        const nextSize = Number(event.target.value);
        commitUpdates({ size: nextSize, page: 0 });
    };

    const handleSubCategoryChange = (subSlug: string) => {
        commitUpdates({ sub: subSlug, page: 0 });
    };

    const handleCategorySelect = (nextCategory: CategorySlug | 'all', nextSubSlug?: string) => {
        if (nextCategory === 'all') {
            if (!searchParams.get('category') && !searchParams.get('sub')) {
                return;
            }
            commitUpdates({ category: null, sub: null, page: 0 });
            return;
        }

        const targetSub = nextSubSlug ?? 'all';

        if (activeCategorySlug === nextCategory) {
            const currentSub = searchParams.get('sub') ?? 'all';
            if (currentSub === targetSub) {
                return;
            }
        }

        commitUpdates({ category: nextCategory, sub: targetSub, page: 0 });
    };

    const handleCollectionNavigate = (nextCollection: NutritionSlug) => {
        if (collectionSlug === nextCollection && mode === 'nutrition') {
            return;
        }

        const nextParams = new URLSearchParams(searchParams.toString());

        nextParams.set('collection', nextCollection);
        nextParams.set('page', '0');

        nextParams.delete('type');
        nextParams.delete('category');
        nextParams.delete('sub');

        PRODUCT_FILTER_KEYS.forEach((key) => {
            nextParams.delete(key);
        });

        startTransition(() => {
            router.replace(`${pathname}?${nextParams.toString()}`, { scroll: true });
        });
    };

    const handleKeywordSubmit = (nextKeyword: string) => {
        commitUpdates({ keyword: nextKeyword || null, page: 0 });
    };

    const handleFilterToggle = (filterKey: ProductFilterKey) => {
        if (lockedFilters?.includes(filterKey)) {
            return;
        }
        const nextValue = !currentFilters[filterKey];
        commitUpdates({ [filterKey]: nextValue ? 'true' : null, page: 0 });
    };

    const handleResetFilters = () => {
        if (lockedFilters?.length) {
            const resetEntries = Object.entries(DEFAULT_FILTER_STATE).reduce<Record<string, string | null>>(
                (accumulator, [key]) => {
                    const filterKey = key as ProductFilterKey;
                    if (lockedFilters.includes(filterKey)) {
                        accumulator[key] = 'true';
                    } else {
                        accumulator[key] = null;
                    }
                    return accumulator;
                },
                {},
            );
            commitUpdates({ ...resetEntries, page: 0 });
            return;
        }
        const resetEntries = Object.entries(DEFAULT_FILTER_STATE).reduce<Record<string, null>>(
            (accumulator, [key]) => {
                accumulator[key] = null;
                return accumulator;
            },
            {},
        );
        commitUpdates({ ...resetEntries, page: 0 });
    };

    return (
        <div className={styles.layout}>
            <ProductSidebar
                mode={mode}
                keyword={keyword}
                filters={currentFilters}
                onKeywordSubmit={handleKeywordSubmit}
                onFilterToggle={handleFilterToggle}
                onResetFilters={handleResetFilters}
                lockedFilters={lockedFilters}
                selectedCategorySlug={mode === 'nutrition' ? activeCategorySlug : undefined}
                categoryConfig={mode === 'category' ? (config as CategoryPageConfig) : undefined}
                selectedSubCategory={selectedSubCategory}
                onCategorySelect={mode === 'nutrition' ? handleCategorySelect : undefined}
                onSubCategoryChange={mode === 'category' ? handleSubCategoryChange : undefined}
            />
            <section className={styles.content}>
                {mode === 'nutrition' && (
                    <div className={styles.heroSection}>
                        <div className={styles.heroGrid}>
                            {HERO_BANNER_ITEMS.map((item) => {
                                const isActive = activeHeroSlug === item.slug;
                                return (
                                    <button
                                        key={item.slug}
                                        type="button"
                                        className={`${styles.heroCard} ${styles[item.accentClass]} ${
                                            isActive ? styles.heroCardActive : ''
                                        }`}
                                        onClick={() => handleCollectionNavigate(item.slug)}
                                        aria-pressed={isActive}
                                    >
                                        <span className={styles.heroCardLabel}>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{config.title}</h1>
                        <p className={styles.description}>{config.description}</p>
                    </div>
                    <div className={styles.metaControls}>
                        <label className={styles.pageSizeLabel}>
                            페이지 크기
                            <select value={selectedPageSize} onChange={handlePageSizeChange} className={styles.pageSizeSelect}>
                                {pageSizeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}개씩 보기
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </header>
                {config.subCategories && config.subCategories.length > 1 && (
                    <div className={styles.subCategoryTabs}>
                        {config.subCategories.map((item) => (
                            <button
                                key={item.slug}
                                type="button"
                                className={`${styles.subCategoryButton} ${
                                    item.slug === selectedSubCategory.slug ? styles.subCategoryButtonActive : ''
                                }`}
                                onClick={() => handleSubCategoryChange(item.slug)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}

                {totalElements > 0 && (
                    <div className={styles.listSummary}>
                        <span>
                            {summaryLabel} · {totalElements}개
                        </span>
                    </div>
                )}

                <ProductGrid products={data.content} />

                <ProductPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </section>
        </div>
    );
}

