import styles from '../page.module.css';
import {
    CATEGORY_CONFIG,
    DEFAULT_FILTER_STATE,
    NUTRITION_CONFIG,
    PRODUCT_FILTER_KEYS,
    ProductFilterKey,
    SEARCH_PAGE_CONFIG,
    getSubCategorySlug,
    isCategorySlug,
    isNutritionSlug,
} from '../config';
import type { CategorySlug, NutritionSlug, SubCategoryConfig } from '../config';
import { fetchProductSearch } from '@/app/(user)/store/api/userProductApi';
import ProductPageClient from '../components/ProductPageClient';

type RawSearchParams = Record<string, string | string[] | undefined>;

const parseSingleValue = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
};

const parseNumberParam = (value: string | undefined, fallback: number, min = 0) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < min) {
        return fallback;
    }
    return Math.floor(parsed);
};

const parsePageParam = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 1) {
        return fallback;
    }
    return Math.max(0, Math.floor(parsed) - 1);
};

const parseBooleanParam = (value: string | undefined) => {
    if (value === undefined) {
        return undefined;
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return undefined;
};

const parseFilters = (params: RawSearchParams) =>
    PRODUCT_FILTER_KEYS.reduce<Record<ProductFilterKey, boolean>>((accumulator, key) => {
        const raw = parseSingleValue(params[key]);
        accumulator[key] = raw === 'true';
        return accumulator;
    }, { ...DEFAULT_FILTER_STATE });

const FALLBACK_SUBCATEGORY: SubCategoryConfig = { slug: 'all', label: '전체', categoryNo: 0 };

const isNetworkErrorMessage = (message?: string | null) => {
    if (!message) {
        return false;
    }
    const lowered = message.toLowerCase();
    return lowered.includes('fetch failed') || lowered.includes('failed to fetch');
};

export default async function ProductSearchPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
    const params = await searchParams;

    const rawKeyword = parseSingleValue(params.q) ?? '';
    const keyword = rawKeyword.trim();

    if (!keyword) {
        return (
            <div className={styles.pageWrapper}>
                <section className={styles.content}>
                    <div className={styles.emptyState}>검색어를 입력하면 결과를 보여드릴게요.</div>
                </section>
            </div>
        );
    }

    const page = parsePageParam(parseSingleValue(params.page), 0);
    const size = parseNumberParam(
        parseSingleValue(params.size),
        SEARCH_PAGE_CONFIG.pageSizeOptions[0] ?? 30,
        1,
    );
    const sort = parseSingleValue(params.sort) ?? SEARCH_PAGE_CONFIG.defaultSort;
    const isNewParam = parseBooleanParam(parseSingleValue(params.isNew));

    const collectionParam = parseSingleValue(params.collection);
    let collectionSlug: NutritionSlug | undefined;
    let lockedFilters: ProductFilterKey[] = [];

    const filtersFromQuery = parseFilters(params);
    const filters: Record<ProductFilterKey, boolean> = {
        ...DEFAULT_FILTER_STATE,
        ...filtersFromQuery,
    } as Record<ProductFilterKey, boolean>;

    if (collectionParam && isNutritionSlug(collectionParam)) {
        collectionSlug = collectionParam;
        const nutritionConfig = NUTRITION_CONFIG[collectionParam];
        lockedFilters = nutritionConfig.lockedFilters ?? [];
        Object.entries(nutritionConfig.defaultFilters).forEach(([filterKey, isActive]) => {
            if (isActive) {
                filters[filterKey as ProductFilterKey] = true;
            }
        });
        nutritionConfig.lockedFilters.forEach((filterKey) => {
            filters[filterKey] = true;
        });
    }

    const categoryParam = parseSingleValue(params.category);
    const subParam = parseSingleValue(params.sub);

    let selectedCategorySlug: CategorySlug | undefined;
    let selectedSubCategory: SubCategoryConfig = FALLBACK_SUBCATEGORY;

    if (categoryParam && isCategorySlug(categoryParam)) {
        selectedCategorySlug = categoryParam;
        const categoryConfig = CATEGORY_CONFIG[selectedCategorySlug];
        selectedSubCategory = getSubCategorySlug(categoryConfig, subParam);
    }

    const searchCategoryNo = selectedSubCategory.categoryNo && selectedSubCategory.categoryNo > 0
        ? selectedSubCategory.categoryNo
        : undefined;

    let productResponse;
    let fetchError: string | null = null;

    try {
        productResponse = await fetchProductSearch(
            {
                query: keyword,
                categoryNo: searchCategoryNo,
                page,
                size,
                sort,
                isNew: isNewParam,
                filters,
            },
            { cache: 'no-store' },
        );
    } catch (error) {
        const fallbackMessage = '제품 검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
        fetchError =
            error instanceof Error && error.message && !isNetworkErrorMessage(error.message)
                ? error.message
                : fallbackMessage;
    }

    if (fetchError || !productResponse) {
        return (
            <div className={styles.pageWrapper}>
                <section className={styles.content}>
                    <div className={styles.emptyState}>{fetchError ?? '제품 검색 결과를 불러오지 못했습니다.'}</div>
                </section>
            </div>
        );
    }

    const totalElements = productResponse.totalElements ?? productResponse.content.length;

    const config = {
        ...SEARCH_PAGE_CONFIG,
        title: `'${keyword}'로 검색한 결과입니다.`,
        description:
            totalElements > 0
                ? `총 ${totalElements.toLocaleString()}개 제품을 찾았습니다.`
                : '조건을 조정하여 더 많은 제품을 찾아보세요.',
    } as const;

    return (
        <div className={styles.pageWrapper}>
            <ProductPageClient
                mode="search"
                categorySlug={selectedCategorySlug}
                collectionSlug={collectionSlug}
                config={config}
                data={productResponse}
                selectedSubCategory={selectedSubCategory}
                page={page}
                size={size}
                sort={sort}
                filters={filters}
                keyword={keyword}
                isNew={Boolean(isNewParam)}
                lockedFilters={lockedFilters}
            />
        </div>
    );
}

