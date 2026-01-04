'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
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
import { PRODUCT_LIST_SCROLL_STORAGE_KEY } from '@/constants/productNavigationConstants';

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
    const searchParamString = searchParams?.toString() ?? '';
    
    // 커스텀 드롭다운 상태
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);
    const pageSizeRef = useRef<HTMLDivElement>(null);

    // 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
            if (pageSizeRef.current && !pageSizeRef.current.contains(event.target as Node)) {
                setShowPageSizeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // User 전용 로직: 항상 nutrition/new/search 모드에서 리셋 버튼 노출
    const shouldShowInlineResetButton = mode === 'nutrition' || mode === 'new' || mode === 'search';

    const SUPPORTED_PAGE_SIZES = [30, 60, 90] as const;
    const pageSizeOptions = (config.pageSizeOptions ?? SUPPORTED_PAGE_SIZES).filter((value) =>
        SUPPORTED_PAGE_SIZES.includes(value as (typeof SUPPORTED_PAGE_SIZES)[number]),
    );
    const normalizedSize = SUPPORTED_PAGE_SIZES.includes(size as (typeof SUPPORTED_PAGE_SIZES)[number])
        ? size
        : SUPPORTED_PAGE_SIZES[0];
    const totalPages = data.totalPages ?? 0;
    const totalElements = data.totalElements ?? data.content.length;
    const totalCountLabel = totalElements.toLocaleString();

    const selectedPageSize = pageSizeOptions.includes(normalizedSize) ? normalizedSize : pageSizeOptions[0];

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
        if ((mode === 'nutrition' || mode === 'search') && nextCollection !== 'all' && collectionSlug === nextCollection) {
            return;
        }

        const nextParams = new URLSearchParams(searchParams.toString());

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
        if (mode === 'nutrition') {
            const targetCollection = slug;
            if (collectionSlug === targetCollection) {
                return;
            }
            commitUpdates({ collection: targetCollection, page: 0 });
            return;
        }

        const filterKey = HERO_FILTER_MAP[slug];
        if (!filterKey) {
            return;
        }
        if (lockedFilters?.includes(filterKey)) {
            return;
        }

        const isActive = currentFilters[filterKey];
        if (isActive) {
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
            if (collectionSlug === slug) {
                return;
            }
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
            commitUpdates({ ...resetEntries, isNew: null, page: 0 });
            return;
        }
        const resetEntries = Object.entries(DEFAULT_FILTER_STATE).reduce<Record<string, null>>(
            (accumulator, [key]) => {
                accumulator[key] = null;
                return accumulator;
            },
            {},
        );
        commitUpdates({ ...resetEntries, isNew: null, page: 0 });
    };

    const handleSidebarInlineReset = () => {
        const nextParams = new URLSearchParams();
        if (mode === 'search') {
            const searchQuery = searchParams.get('q');
            if (searchQuery) {
                nextParams.set('q', searchQuery);
            }
        } else if (collectionSlug && collectionSlug !== 'all') {
            nextParams.set('collection', collectionSlug);
        }

        let basePath = pathname || '/product';
        if (basePath.includes('?')) {
            basePath = basePath.split('?')[0];
        }

        const target = nextParams.toString() ? `${basePath}?${nextParams.toString()}` : basePath;

        startTransition(() => {
            router.replace(target, { scroll: true });
        });
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
            const newParams: Record<string, string | number | null> = {
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

    const ignoredNewResetKeys = new Set(['page', 'size', 'sort']);
    const hasNewPageModifiers = useMemo(() => {
        if (mode !== 'new') {
            return false;
        }
        if (!searchParams) {
            return false;
        }
        const entries = Array.from(searchParams.entries());
        if (entries.length === 0) {
            return false;
        }
        return entries.some(([key, value]) => {
            if (!ignoredNewResetKeys.has(key)) {
                return true;
            }
            if (key === 'page') {
                return value !== '1';
            }
            if (key === 'size') {
                return !SUPPORTED_PAGE_SIZES.includes(Number(value) as (typeof SUPPORTED_PAGE_SIZES)[number]);
            }
            if (key === 'sort') {
                return value !== config.defaultSort;
            }
            return false;
        });
    }, [mode, searchParams, config.defaultSort]);

    const handleNewPageReset = () => {
        if (mode !== 'new') {
            return;
        }
        const basePath = pathname && pathname.startsWith('/product/new') ? '/product/new' : pathname ?? '/product/new';
        startTransition(() => {
            router.replace(basePath, { scroll: true });
        });
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
        const stored = window.sessionStorage.getItem(PRODUCT_LIST_SCROLL_STORAGE_KEY);
        if (!stored) {
            return;
        }

        try {
            const parsed = JSON.parse(stored) as { path?: string; scroll?: number | string };
            const normalizedPath = pathname + (searchParamString ? `?${searchParamString}` : '');
            if (!parsed.path || parsed.path !== normalizedPath) {
                return;
            }

            const resolvedScroll =
                typeof parsed.scroll === 'number' ? parsed.scroll : Number.parseInt(String(parsed.scroll), 10);
            const scrollTop = Number.isFinite(resolvedScroll) ? resolvedScroll : 0;

            window.requestAnimationFrame(() => {
                window.scrollTo({ top: scrollTop, behavior: 'auto' });
            });
            window.sessionStorage.removeItem(PRODUCT_LIST_SCROLL_STORAGE_KEY);
        } catch {
            window.sessionStorage.removeItem(PRODUCT_LIST_SCROLL_STORAGE_KEY);
        }
    }, [pathname, searchParamString]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const applyStoredUpdates = () => {
            try {
                const storedMap = window.sessionStorage.getItem('favorite:map');
                if (!storedMap) return;

                const map = JSON.parse(storedMap) as Record<number, { isFavorite: boolean; likesCount: number }>;
                
                setClientContent((prev) => {
                    let changed = false;
                    const next = prev.map((product) => {
                        const update = map[product.productNo];
                        if (update && (product.isFavorite !== update.isFavorite || product.likesCount !== update.likesCount)) {
                            changed = true;
                            return { ...product, isFavorite: update.isFavorite, likesCount: update.likesCount };
                        }
                        return product;
                    });
                    return changed ? next : prev;
                });
            } catch (error) {
                console.warn('[ProductPageClient] 좋아요 상태 복구 실패', error);
            }
        };

        const handleFavoriteUpdated = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (detail?.resetAllFavorites) {
                setClientContent((prev) =>
                    prev.map((product) => ({
                        ...product,
                        isFavorite: false,
                    })),
                );
                return;
            }
            if (detail && typeof detail.productNo === 'number') {
                setClientContent((prev) => {
                    return prev.map((product) => {
                        if (product.productNo === detail.productNo) {
                            return {
                                ...product,
                                isFavorite: detail.isFavorite,
                                likesCount: detail.likesCount,
                            };
                        }
                        return product;
                    });
                });
            }
        };

        window.addEventListener('favorite-updated', handleFavoriteUpdated);
        
        applyStoredUpdates();

        return () => {
            window.removeEventListener('favorite-updated', handleFavoriteUpdated);
        };
    }, [data.content]);

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

    const renderHeroInline = () => {
        const renderButtons = (items: HeroBannerItem[]) => (
          <>
            {items.map((item) => {
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
          </>
        );

        if (mode === 'nutrition') {
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
                    {renderButtons(HERO_BANNER_ITEMS)}
                </div>
            );
        }

        if (mode === 'search') {
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
                    {renderButtons(HERO_BANNER_ITEMS)}
                </div>
            );
        }

        if (mode === 'new' && (config as NewProductsPageConfig).kind === 'new') {
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
                    {renderButtons(NEW_HERO_ITEMS)}
                </div>
            );
        }

        return null;
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
                showInlineResetButton={shouldShowInlineResetButton}
                onInlineReset={handleSidebarInlineReset}
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
                    {mode === 'new' && hasNewPageModifiers && (
                        <button type="button" className={styles.newPageResetButton} onClick={handleNewPageReset}>
                            신제품 초기화
                        </button>
                    )}
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
                        <div className={styles.sortLabel}>
                            <span className={styles.labelText}>정렬</span>
                            <div 
                                ref={sortRef}
                                className={`${styles.boxSelect} ${showSortDropdown ? styles.on : ''}`}
                            >
                                <button 
                                    type="button" 
                                    className={styles.selectDisplayField}
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                >
                                    {SORT_OPTIONS.find(opt => opt.value === normalizedSort)?.label || '정렬'}
                                </button>
                                <div className={styles.selectArrowContainer} onClick={() => setShowSortDropdown(!showSortDropdown)}>
                                    <span className={styles.selectArrowIcon}></span>
                                </div>
                                <div className={styles.boxLayer}>
                                    <ul className={styles.listOptions}>
                                        {SORT_OPTIONS.map((option) => (
                                            <li key={option.value} className={styles.listItem}>
                                                <button
                                                    type="button"
                                                    className={`${styles.buttonOption} ${option.value === normalizedSort ? styles.buttonOptionSelected : ''}`}
                                                    onClick={() => {
                                                        commitUpdates({ sort: option.value, page: 0 });
                                                        setShowSortDropdown(false);
                                                    }}
                                                >
                                                    {option.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={styles.pageSizeLabel}>
                            <span className={styles.labelText}>페이지 크기</span>
                            <div 
                                ref={pageSizeRef}
                                className={`${styles.boxSelect} ${showPageSizeDropdown ? styles.on : ''} ${styles.pageSizeBox}`}
                            >
                                <button 
                                    type="button" 
                                    className={styles.selectDisplayField}
                                    onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}
                                >
                                    {selectedPageSize}개씩 보기
                                </button>
                                <div className={styles.selectArrowContainer} onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}>
                                    <span className={styles.selectArrowIcon}></span>
                                </div>
                                <div className={styles.boxLayer}>
                                    <ul className={styles.listOptions}>
                                        {pageSizeOptions.map((option) => (
                                            <li key={option} className={styles.listItem}>
                                                <button
                                                    type="button"
                                                    className={`${styles.buttonOption} ${option === selectedPageSize ? styles.buttonOptionSelected : ''}`}
                                                    onClick={() => {
                                                        const nextSize = Number(option);
                                                        if (!SUPPORTED_PAGE_SIZES.includes(nextSize as (typeof SUPPORTED_PAGE_SIZES)[number])) {
                                                            commitUpdates({ size: SUPPORTED_PAGE_SIZES[0], page: 0 });
                                                        } else {
                                                            commitUpdates({ size: nextSize, page: 0 });
                                                        }
                                                        setShowPageSizeDropdown(false);
                                                    }}
                                                >
                                                    {option}개씩 보기
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
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