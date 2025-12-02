import { redirect } from 'next/navigation';
import styles from './page.module.css';
import {
    CATEGORY_CONFIG,
    DEFAULT_CATEGORY_SLUG,
    DEFAULT_FILTER_STATE,
    NUTRITION_CONFIG,
    PRODUCT_FILTER_KEYS,
    ProductFilterKey,
    getSubCategorySlug,
    isCategorySlug,
    isNutritionSlug,
} from './config';
import type { CategorySlug, NutritionSlug } from './config';
import {
    fetchCategoryProducts,
    fetchNutritionProducts,
    fetchProductSearch,
    type FetchProductApiOptions,
} from '../store/api/userProductApi';
const PRODUCT_FETCH_OPTIONS: FetchProductApiOptions = {
    includeProductsWithoutImage: true,
};
import ProductPageClient from './components/ProductPageClient';

interface ProductSearchParams {
    type?: string | string[];
    collection?: string | string[];
    category?: string | string[];
    sub?: string | string[];
    page?: string | string[];
    size?: string | string[];
    sort?: string | string[];
    keyword?: string | string[];
    isZeroCalorie?: string | string[];
    isZeroSugar?: string | string[];
    isLowCalorie?: string | string[];
    isLowSugar?: string | string[];
    isNew?: string | string[];
}

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
    return parsed;
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

const parseFilters = (searchParams: ProductSearchParams) => {
    return PRODUCT_FILTER_KEYS.reduce<Record<ProductFilterKey, boolean>>((accumulator, key) => {
        const raw = parseSingleValue(searchParams[key]);
        accumulator[key] = raw === 'true';
        return accumulator;
    }, { ...DEFAULT_FILTER_STATE });
};

const isNetworkErrorMessage = (message?: string | null) => {
    if (!message) {
        return false;
    }
    const lowered = message.toLowerCase();
    return lowered.includes('fetch failed') || lowered.includes('failed to fetch');
};

export default async function ProductPage({ searchParams }: { searchParams: Promise<ProductSearchParams> }) {
    const params = await searchParams;

    const collectionParam = parseSingleValue(params.collection);
    if (collectionParam && isNutritionSlug(collectionParam)) {
        return renderNutritionPage(collectionParam, params);
    }

    const typeParam = parseSingleValue(params.type);
    const categorySlug: CategorySlug = typeParam && isCategorySlug(typeParam)
        ? typeParam
        : DEFAULT_CATEGORY_SLUG;

    if (!typeParam || !isCategorySlug(typeParam)) {
        redirect(`/product?type=${DEFAULT_CATEGORY_SLUG}`);
    }

    const categoryConfig = CATEGORY_CONFIG[categorySlug];
    const subParam = parseSingleValue(params.sub);
    const selectedSubCategory = getSubCategorySlug(categoryConfig, subParam);

    const page = parsePageParam(parseSingleValue(params.page), 0);
    const size = parseNumberParam(
        parseSingleValue(params.size),
        categoryConfig.pageSizeOptions[0] ?? 30,
        1,
    );
    const sort = parseSingleValue(params.sort) ?? categoryConfig.defaultSort;
    const keyword = parseSingleValue(params.keyword) ?? '';
    const filters = parseFilters(params);
    const isNewParam = parseBooleanParam(parseSingleValue(params.isNew));

    const activeFilters = Object.entries(filters).reduce<NonNullable<Parameters<typeof fetchCategoryProducts>[0]['filters']>>(
        (accumulator, [key, value]) => {
            if (value) {
                accumulator[key as ProductFilterKey] = true;
            }
            return accumulator;
        },
        {},
    );

    const hasKeyword = Boolean(keyword);

    const searchCategoryNo = selectedSubCategory.categoryNo && selectedSubCategory.categoryNo > 0
        ? selectedSubCategory.categoryNo
        : undefined;

    let productResponse;
    try {
        productResponse = hasKeyword
        ? await fetchProductSearch(
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
              PRODUCT_FETCH_OPTIONS,
          )
        : await fetchCategoryProducts(
              {
                  categoryNo: selectedSubCategory.categoryNo,
                  page,
                  size,
                  sort,
                  isNew: isNewParam,
                  filters: activeFilters,
              },
              { cache: 'no-store' },
              PRODUCT_FETCH_OPTIONS,
          );
    } catch (error) {
        const fallbackMessage = '제품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
        const message =
            error instanceof Error && error.message && !isNetworkErrorMessage(error.message)
                ? error.message
                : fallbackMessage;
        return (
            <div className={styles.pageWrapper}>
                <section className={styles.content}>
                    <div className={styles.emptyState}>{message}</div>
                </section>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <ProductPageClient
                mode="category"
                categorySlug={categorySlug}
                config={categoryConfig}
                data={productResponse}
                selectedSubCategory={selectedSubCategory}
                page={page}
                size={size}
                sort={sort}
                filters={filters}
                keyword={keyword}
                isNew={Boolean(isNewParam)}
            />
        </div>
    );
}

async function renderNutritionPage(nutritionSlug: NutritionSlug, params: ProductSearchParams) {
     const config = NUTRITION_CONFIG[nutritionSlug];
 
    const page = parsePageParam(parseSingleValue(params.page), 0);
     const size = parseNumberParam(parseSingleValue(params.size), config.pageSizeOptions[0] ?? 30, 1);
     const sort = parseSingleValue(params.sort) ?? config.defaultSort;
     const keyword = parseSingleValue(params.keyword) ?? '';
    const isNewParam = parseBooleanParam(parseSingleValue(params.isNew));

    const categoryParam = parseSingleValue(params.category);
    const categorySlug = categoryParam && isCategorySlug(categoryParam) ? categoryParam : undefined;
    const categoryConfig = categorySlug ? CATEGORY_CONFIG[categorySlug] : undefined;
    const subParam = parseSingleValue(params.sub);

    const filtersFromQuery = parseFilters(params);
    const filters: Record<ProductFilterKey, boolean> = {
        ...DEFAULT_FILTER_STATE,
        ...config.defaultFilters,
        ...filtersFromQuery,
    } as Record<ProductFilterKey, boolean>;

    config.lockedFilters.forEach((filterKey) => {
        filters[filterKey] = true;
    });

    const selectedSubCategory = categoryConfig
        ? getSubCategorySlug(categoryConfig, subParam)
        : config.subCategories?.[0] ?? { slug: 'all', label: '전체', categoryNo: 0 };

    const activeFilters = Object.entries(filters).reduce<NonNullable<Parameters<typeof fetchCategoryProducts>[0]['filters']>>(
        (accumulator, [filterKey, isActive]) => {
            if (isActive) {
                accumulator[filterKey as ProductFilterKey] = true;
            }
            return accumulator;
        },
        {},
    );

    const hasKeyword = Boolean(keyword);

    const searchCategoryNo = selectedSubCategory.categoryNo && selectedSubCategory.categoryNo > 0
        ? selectedSubCategory.categoryNo
        : undefined;

    let productResponse;
    const shouldUseSearch = hasKeyword || Boolean(isNewParam);
    try {
        if (categoryConfig) {
            productResponse = await fetchCategoryProducts(
                {
                    categoryNo: selectedSubCategory.categoryNo,
                    page,
                    size,
                    sort,
                    isNew: isNewParam,
                    filters: activeFilters,
                },
                { cache: 'no-store' },
                PRODUCT_FETCH_OPTIONS,
            );
        } else if (shouldUseSearch) {
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
                PRODUCT_FETCH_OPTIONS,
            );
        } else {
            productResponse = await fetchNutritionProducts(
                config.endpoint,
                {
                    page,
                    size,
                    sort,
                    keyword: keyword || undefined,
                    isNew: isNewParam,
                },
                { cache: 'no-store' },
                PRODUCT_FETCH_OPTIONS,
            );
        }
    } catch (error) {
        const fallbackMessage = '제품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
        const message =
            error instanceof Error && error.message && !isNetworkErrorMessage(error.message)
                ? error.message
                : fallbackMessage;
        return (
            <div className={styles.pageWrapper}>
                <section className={styles.content}>
                    <div className={styles.emptyState}>{message}</div>
                </section>
            </div>
        );
    }
 
    return (
        <div className={styles.pageWrapper}>
            <ProductPageClient
                mode="nutrition"
                categorySlug={categorySlug}
                collectionSlug={nutritionSlug}
                config={config}
                data={productResponse}
                selectedSubCategory={selectedSubCategory}
                page={page}
                size={size}
                sort={sort}
                filters={filters}
                keyword={keyword}
                isNew={Boolean(isNewParam)}
                lockedFilters={config.lockedFilters}
            />
        </div>
    );
}

