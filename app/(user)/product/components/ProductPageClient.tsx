'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from '../page.module.css';
import {
    CategoryPageConfig,
    CategorySlug,
    DEFAULT_FILTER_STATE,
    NewProductsPageConfig,
    NutritionPageConfig,
    NutritionSlug,
    ProductFilterKey,
    ProductPageConfig,
    SubCategoryConfig,
    CATEGORY_LABELS,
    CATEGORY_CONFIG,
    CATEGORY_SLUG_ORDER,
    PRODUCT_FILTER_KEYS,
} from '../config';
import type { ProductResponse } from '@/types/productTypes';
import ProductSidebar from './ProductSidebar';
import ProductGrid from './ProductGrid';
import ProductPagination from './ProductPagination';
import type { Product } from '@/types/productTypes';

const HERO_FILTER_MAP: Record<NutritionSlug, ProductFilterKey> = {
    'zero-calorie': 'isZeroCalorie',
    'zero-sugar': 'isZeroSugar',
    'low-calorie': 'isLowCalorie',
    'low-sugar': 'isLowSugar',
};

type FilterState = typeof DEFAULT_FILTER_STATE;

type PageMode = 'category' | 'nutrition' | 'new' | 'search';

type HeroAccentClass =
    | 'heroCardZeroCalorie'
    | 'heroCardZeroSugar'
    | 'heroCardLowCalorie'
    | 'heroCardLowSugar'
    | 'heroCardNeutral';

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

const NEW_HERO_ITEMS: Array<{ slug: NutritionSlug; label: string; accentClass: HeroAccentClass }> = [
    ...HERO_BANNER_ITEMS,
];

interface ProductPageClientProps {
    mode: PageMode;
    categorySlug?: CategorySlug;
    collectionSlug?: NutritionSlug | 'all';
    config: ProductPageConfig;
    data: ProductResponse;
    selectedSubCategory: SubCategoryConfig;
    page: number;
    size: number;
    sort: string;
    filters: FilterState;
    keyword: string;
    isNew?: boolean;
    lockedFilters?: ProductFilterKey[];
    productCardVariant?: 'default' | 'admin';
    onDeleteProduct?: (product: Product) => Promise<void>;
    getProductHref?: (product: Product) => string;
    showParentCategoryActive?: boolean;
}

const PAGE_PARAM_KEYS: Array<
    ProductFilterKey | 'page' | 'size' | 'sort' | 'sub' | 'keyword' | 'type' | 'collection' | 'category' | 'isNew' | 'q'
> = [
    'type',
    'collection',
    'category',
    'page',
    'size',
    'sort',
    'sub',
    'keyword',
    'isNew',
    'isZeroCalorie',
    'isZeroSugar',
    'isLowCalorie',
    'isLowSugar',
];

const ensurePositiveInteger = (value: number, fallback: number) =>
    Number.isFinite(value) && value >= 0 ? value : fallback;

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'productName,asc', label: '제품명 오름차순' },
    { value: 'productName,desc', label: '제품명 내림차순' },
    { value: 'updatedDate,desc', label: '최신 업데이트순' },
    { value: 'createdDate,desc', label: '최신 등록순' },
    { value: 'likesCount,desc', label: '인기순' },
];

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
    isNew,
    lockedFilters,
    productCardVariant = 'default',
    onDeleteProduct,
    getProductHref,
    showParentCategoryActive,
}: ProductPageClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();
    const [clientContent, setClientContent] = useState<Product[]>(data.content);

    const pageSizeOptions = config.pageSizeOptions ?? [30, 60, 90];
    const totalPages = data.totalPages ?? 0;
    const totalElements = data.totalElements ?? data.content.length;
    const totalCountLabel = totalElements.toLocaleString();

    const selectedPageSize = pageSizeOptions.includes(size) ? size : pageSizeOptions[0];

    const currentFilters = useMemo(() => filters, [filters]);
    const isNewActive = Boolean(isNew);
    const normalizedSort = useMemo(() => {
        const hasMatch = SORT_OPTIONS.some((option) => option.value === sort);
        return hasMatch ? sort : SORT_OPTIONS[0].value;
    }, [sort]);

    const activeHeroSlug = useMemo(() => {
        if ((mode === 'nutrition' || mode === 'search') && collectionSlug) {
            return collectionSlug;
        }
        if (mode === 'nutrition' || mode === 'search') {
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
            return 'all';
        }
        if (mode === 'new') {
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
            return 'all';
        }
        return undefined;
    }, [mode, collectionSlug, currentFilters]);

    const selectedCategoryLabel = useMemo(() => {
        if ((mode !== 'nutrition' && mode !== 'new' && mode !== 'search') || !activeCategorySlug) {
            return null;
        }
        return CATEGORY_LABELS[activeCategorySlug] ?? null;
    }, [mode, activeCategorySlug]);

    const summaryLabel = useMemo(() => {
        if (selectedCategoryLabel) {
            return `${selectedCategoryLabel} · ${selectedSubCategory.label}`;
        }
        if (mode === 'search') {
            return `검색 결과 · ${selectedSubCategory.label}`;
        }
        return selectedSubCategory.label;
    }, [mode, selectedCategoryLabel, selectedSubCategory.label]);

    const baseParamKey = mode === 'nutrition' || mode === 'search' ? 'collection' : 'type';
    const baseParamValue =
        mode === 'nutrition' || mode === 'search' ? collectionSlug : activeCategorySlug;

    const resolvedSidebarCategorySlug = useMemo(() => {
        if (mode === 'category') {
            return undefined;
        }
        if (activeCategorySlug) {
            return activeCategorySlug;
        }
        if (!showParentCategoryActive) {
            return undefined;
        }
        if (!selectedSubCategory || selectedSubCategory.categoryNo <= 0) {
            return undefined;
        }
        const matchedSlug = CATEGORY_SLUG_ORDER.find((slug) =>
            CATEGORY_CONFIG[slug].subCategories.some(
                (subCategory) => subCategory.categoryNo === selectedSubCategory.categoryNo,
            ),
        );
        return matchedSlug;
    }, [mode, activeCategorySlug, showParentCategoryActive, selectedSubCategory]);

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
            if ((mode === 'category' || mode === 'new') && key === 'collection') {
                nextParams.delete('collection');
            }
            if ((mode === 'nutrition' || mode === 'search') && key === 'type') {
                nextParams.delete('type');
            }
        });

        Object.entries(updates).forEach(([key, value]) => {
            if (key === 'page') {
                if (value === undefined || value === null || value === '') {
                    nextParams.delete('page');
                } else {
                    const numericValue =
                        typeof value === 'number' ? value : Number.parseInt(String(value), 10);
                    const safeValue = Number.isFinite(numericValue) ? Math.max(0, Math.floor(numericValue)) : 0;
                    nextParams.set('page', String(safeValue + 1));
                }
                return;
            }

            if (value === undefined || value === null || value === '') {
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
        commitUpdates({ page: ensurePositiveInteger(nextPage - 1, 0) });
    };

    const handlePageSizeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
        const nextSize = Number(event.target.value);
        commitUpdates({ size: nextSize, page: 0 });
    };

    const handleSortChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
        const nextSort = event.target.value;
        commitUpdates({ sort: nextSort, page: 0 });
    };

    const handleSubCategoryChange = (subSlug: string) => {
        commitUpdates({ sub: subSlug, page: 0 });
    };

    const handleCategorySelect = (nextCategory: CategorySlug | 'all', nextSubSlug?: string) => {
        if (nextCategory === 'all') {
            commitUpdates({
                category: null,
                sub: null,
                type: undefined,
                page: 0,
            });
            return;
        }

        const targetSub = nextSubSlug ?? 'all';
        const nextParams = new URLSearchParams(searchParams.toString());
        const currentCategory = searchParams.get('category') ?? searchParams.get('type');
        const currentSub = searchParams.get('sub') ?? 'all';

        const isSameSelection = currentCategory === nextCategory && currentSub === targetSub;
        if (isSameSelection) {
            commitUpdates({ category: null, sub: null, type: undefined, page: 0 });
            return;
        }

        nextParams.set('category', nextCategory);
        nextParams.set('sub', targetSub);
        nextParams.delete('type');
        nextParams.set('page', '1');

        PRODUCT_FILTER_KEYS.forEach((key) => {
            nextParams.delete(key);
        });

        startTransition(() => {
            router.replace(`${pathname}?${nextParams.toString()}`, { scroll: true });
        });
    };

    const handleCollectionNavigate = (nextCollection: NutritionSlug | 'all') => {
        const nextParams = new URLSearchParams(searchParams.toString());

        const allowToggleToAll = mode === 'search' || mode === 'nutrition';
        if (allowToggleToAll && collectionSlug === nextCollection) {
            nextCollection = 'all';
        }

        if (nextCollection === 'all') {
            nextParams.set('collection', 'all');
        } else {
            nextParams.set('collection', nextCollection);
        }
        nextParams.set('page', '1');

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

    const handleHeroFilterToggle = (slug: NutritionSlug) => {
        const filterKey = HERO_FILTER_MAP[slug];
        if (!filterKey) {
            return;
        }
        if (lockedFilters?.includes(filterKey)) {
            return;
        }

        const isActive = currentFilters[filterKey];
        if (isActive) {
            commitUpdates({ [filterKey]: null, isNew: null, page: 0 });
            return;
        }

        const filterReset = PRODUCT_FILTER_KEYS.reduce<Record<string, string | null>>((accumulator, key) => {
            accumulator[key] = null;
            return accumulator;
        }, {});

        commitUpdates({
            ...filterReset,
            [filterKey]: 'true',
            isNew: null,
            page: 0,
        });
    };

    const handleHeroButtonClick = (slug: NutritionSlug) => {
        if (mode === 'nutrition') {
            handleCollectionNavigate(slug);
            return;
        }
        handleHeroFilterToggle(slug);
    };

    const handleNewHeroSelect = (slug: NutritionSlug) => {
        const baseUpdates: Record<string, string | null> = {
            isZeroCalorie: null,
            isZeroSugar: null,
            isLowCalorie: null,
            isLowSugar: null,
        };

        const filterKey = HERO_FILTER_MAP[slug];
        const isActive = currentFilters[filterKey];
        if (lockedFilters?.includes(filterKey)) {
            return;
        }

        if (isActive) {
            commitUpdates({ ...baseUpdates, isNew: 'true', page: 0 });
            return;
        }

        commitUpdates({ ...baseUpdates, [filterKey]: 'true', isNew: 'true', page: 0 });
    };

    const handleKeywordSubmit = (rawKeyword: string) => {
        const trimmed = rawKeyword.trim();
        if (!trimmed) {
            commitUpdates({ keyword: null, page: 0 });
            return;
        }

        const resetEntries = PRODUCT_FILTER_KEYS.reduce<Record<string, string | null>>((accumulator, filterKey) => {
            if (lockedFilters?.includes(filterKey)) {
                accumulator[filterKey] = 'true';
            } else {
                accumulator[filterKey] = null;
            }
            return accumulator;
        }, {});

        commitUpdates({ ...resetEntries, keyword: trimmed, page: 0, isNew: null });
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

    const handleNewToggle = () => {
        if (mode === 'new') {
            return;
        }
        if (isNewActive) {
            commitUpdates({ isNew: null, page: 0 });
        } else {
            const filterReset = Object.fromEntries(
                PRODUCT_FILTER_KEYS.map((key) => [key, null as string | null]),
            );
            const newParams: Record<string, string | null> = {
                ...filterReset,
                isNew: 'true',
                page: 0,
            };
            if (mode === 'category') {
                newParams.sub = 'all';
            }
            commitUpdates(newParams);
        }
    };

    const renderHeroInline = () => {
        if (mode === 'nutrition' || mode === 'search') {
            return (
                <div className={styles.heroInline}>
                    <button
                        type="button"
                        className={`${styles.heroInlineCard} ${styles.heroInlineNewButton} ${isNewActive ? styles.heroCardActive : ''}`}
                        onClick={handleNewToggle}
                        aria-pressed={isNewActive}
                    >
                        신제품
                    </button>
                    <span className={styles.heroDivider} aria-hidden="true" />
                    {HERO_BANNER_ITEMS.map((item) => {
                        const isActive = activeHeroSlug === item.slug;
                        const accentClass = styles[item.accentClass];
                        return (
                            <button
                                key={item.slug}
                                type="button"
                                className={`${styles.heroInlineCard} ${accentClass} ${isActive ? styles.heroCardActive : ''}`}
                                onClick={() => handleHeroButtonClick(item.slug)}
                                aria-pressed={isActive}
                            >
                                <span className={styles.heroCardLabel}>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            );
        }

        if (mode === 'new' && config.kind === 'new') {
            const heroItems = NEW_HERO_ITEMS;
            return (
                <div className={styles.heroInline}>
                    <button
                        type="button"
                        className={`${styles.heroInlineCard} ${styles.heroInlineNewButton} ${
                            isNewActive ? styles.heroCardActive : ''
                        }`}
                        onClick={handleNewToggle}
                        aria-pressed={isNewActive}
                    >
                        신제품
                    </button>
                    <span className={styles.heroDivider} aria-hidden="true" />
                    {heroItems.map((item) => {
                        const isActive = activeHeroSlug === item.slug;
                        const accentClass = styles[item.accentClass];
                        return (
                            <button
                                key={item.slug}
                                type="button"
                                className={`${styles.heroInlineCard} ${accentClass} ${
                                    isActive ? styles.heroCardActive : ''
                                }`}
                                onClick={() => handleNewHeroSelect(item.slug)}
                                aria-pressed={isActive}
                            >
                                <span className={styles.heroCardLabel}>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            );
        }

        return null;
    };

    const hasSubCategories =
        'subCategories' in config && Array.isArray(config.subCategories) && config.subCategories.length > 1;

    const renderSubCategoryButtons = (includeNewButton: boolean) => {
        if (!hasSubCategories) {
            return null;
        }

        const subCategories = config.subCategories;

        return (
            <div className={styles.subCategoryTabs}>
                {includeNewButton && (
                    <>
                        <button
                            type="button"
                            className={`${styles.subCategoryButton} ${styles.subCategoryNewButton} ${
                                isNewActive ? styles.subCategoryButtonActive : ''
                            }`}
                            onClick={handleNewToggle}
                            aria-pressed={isNewActive}
                        >
                            신제품
                        </button>
                        <span className={styles.subCategoryDivider} aria-hidden="true" />
                    </>
                )}
                {subCategories.map((item) => (
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
        );
    };

    const renderSubCategorySection = () => {
        if (!hasSubCategories) {
            return null;
        }

        if (mode === 'category') {
            return (
                <div className={styles.subCategoryHeader}>
                    {renderSubCategoryButtons(true)}
                </div>
            );
        }

        return renderSubCategoryButtons(false);
    };

    useEffect(() => {
        setClientContent(data.content);
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log('[ProductPageClient] rendering products', data.content.map((item) => item.productNo));
        }
    }, [data.content]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const applyUpdate = (detail: unknown) => {
            if (
                !detail ||
                typeof detail !== 'object' ||
                !('productNo' in detail) ||
                typeof (detail as { productNo: unknown }).productNo !== 'number'
            ) {
                return;
            }

            const { productNo, isFavorite, likesCount } = detail as {
                productNo: number;
                isFavorite: boolean;
                likesCount: number;
            };

            setClientContent((prev) => {
                let updated = false;
                const next = prev.map((product) => {
                    if (product.productNo !== productNo) {
                        return product;
                    }
                    updated = true;
                    const resolvedLikesCount =
                        typeof likesCount === 'number' && !Number.isNaN(likesCount)
                            ? likesCount
                            : product.likesCount ?? 0;
                    return {
                        ...product,
                        isFavorite: Boolean(isFavorite),
                        likesCount: resolvedLikesCount,
                    };
                });
                return updated ? next : prev;
            });
        };

        const handleFavoriteUpdated = (event: Event) => {
            const customEvent = event as CustomEvent;
            applyUpdate(customEvent.detail);
        };

        window.addEventListener('favorite-updated', handleFavoriteUpdated);

        const lastUpdate = window.sessionStorage.getItem('favorite:lastUpdate');
        if (lastUpdate) {
            try {
                applyUpdate(JSON.parse(lastUpdate));
            } catch (error) {
                console.warn('[ProductPageClient] 좋아요 동기화 파싱 실패', error);
            }
        }

        return () => {
            window.removeEventListener('favorite-updated', handleFavoriteUpdated);
        };
    }, []);

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
                selectedCategorySlug={
                    mode === 'nutrition' || mode === 'new' || mode === 'search'
                        ? resolvedSidebarCategorySlug
                        : undefined
                }
                categoryConfig={mode === 'category' ? (config as CategoryPageConfig) : undefined}
                selectedSubCategory={selectedSubCategory}
                onCategorySelect={mode === 'nutrition' || mode === 'new' || mode === 'search' ? handleCategorySelect : undefined}
                onSubCategoryChange={mode === 'category' ? handleSubCategoryChange : undefined}
                highlightParentCategory={showParentCategoryActive}
            />
            <section className={styles.content}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{config.title}</h1>
                        <p className={styles.description}>{config.description}</p>
                    </div>
                    <div className={styles.headerMeta}>
                        <span className={styles.headerMetaLabel}>총 제품</span>
                        <span className={styles.totalCount}>{totalCountLabel}개</span>
                    </div>
                </header>
                {renderSubCategorySection()}

                {mode !== 'category' && (
                    <div className={styles.listSummary}>
                        <span>{summaryLabel}</span>
                        {renderHeroInline()}
                    </div>
                )}
                <div className={styles.listActions}>
                    <div className={styles.listActionsControls}>
                        {mode === 'category' && activeCategorySlug === 'icecream' && (
                            <>
                                <button
                                    type="button"
                                    className={`${styles.heroInlineCard} ${styles.heroInlineNewButton} ${
                                        isNewActive ? styles.heroCardActive : ''
                                    }`}
                                    onClick={handleNewToggle}
                                    aria-pressed={isNewActive}
                                >
                                    신제품
                                </button>
                                <span className={styles.heroDivider} aria-hidden="true" />
                            </>
                        )}
                        <label className={styles.sortLabel}>
                            정렬
                            <select value={normalizedSort} onChange={handleSortChange} className={styles.sortSelect}>
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
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
                </div>

                <ProductGrid
                    products={clientContent}
                    emptyMessage={mode === 'search' ? '검색 결과가 없습니다.' : undefined}
                    variant={productCardVariant}
                    onDeleteProduct={onDeleteProduct}
                    getProductHref={getProductHref}
                />

                <ProductPagination currentPage={page + 1} totalPages={totalPages} onPageChange={handlePageChange} />
            </section>
        </div>
    );
}

