import styles from '../page.module.css';
import {
    CATEGORY_CONFIG,
    DEFAULT_FILTER_STATE,
    NEW_PRODUCTS_PAGE_CONFIG,
    PRODUCT_FILTER_KEYS,
    ProductFilterKey,
    getSubCategorySlug,
    isCategorySlug,
} from '../config';
import type { CategorySlug } from '../config';
import { fetchCategoryProducts, fetchProductSearch } from '../../store/api/userProductApi';
import ProductPageClient from '../components/ProductPageClient';

interface NewProductsSearchParams {
    type?: string | string[];
    category?: string | string[];
    sub?: string | string[];
    page?: string | string[];
    size?: string | string[];
    sort?: string | string[];
    keyword?: string | string[];
    isNew?: string | string[];
    isZeroCalorie?: string | string[];
    isZeroSugar?: string | string[];
    isLowCalorie?: string | string[];
    isLowSugar?: string | string[];
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

const parseFilters = (searchParams: NewProductsSearchParams) => {
    return PRODUCT_FILTER_KEYS.reduce<Record<ProductFilterKey, boolean>>((accumulator, key) => {
        const raw = parseSingleValue(searchParams[key]);
        accumulator[key] = raw === 'true';
        return accumulator;
    }, { ...DEFAULT_FILTER_STATE });
};

export default async function NewProductsPage({ searchParams }: { searchParams: Promise<NewProductsSearchParams> }) {
    const params = await searchParams;

    const typeParam = parseSingleValue(params.type);
    const categoryParam = parseSingleValue(params.category);

    const categorySlug: CategorySlug | undefined =
        (typeParam && isCategorySlug(typeParam) && typeParam) ||
        (categoryParam && isCategorySlug(categoryParam) && categoryParam) ||
        undefined;

    const categoryConfig = categorySlug ? CATEGORY_CONFIG[categorySlug] : undefined;
    const subParam = parseSingleValue(params.sub);

    const page = parseNumberParam(parseSingleValue(params.page), 0, 0);
    const size = parseNumberParam(parseSingleValue(params.size), NEW_PRODUCTS_PAGE_CONFIG.pageSizeOptions[0] ?? 30, 1);
    const sort = parseSingleValue(params.sort) ?? NEW_PRODUCTS_PAGE_CONFIG.defaultSort;
    const keyword = parseSingleValue(params.keyword) ?? '';

    const filters = parseFilters(params);

    const isNewParam = parseSingleValue(params.isNew);
    const isNew = isNewParam === 'false' ? false : true;

    const selectedSubCategory = categoryConfig
        ? getSubCategorySlug(categoryConfig, subParam)
        : { slug: 'all', label: '전체', categoryNo: 0 };

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

    const productResponse = categoryConfig
        ? hasKeyword
            ? await fetchProductSearch(
                  {
                      query: keyword,
                      categoryNo: searchCategoryNo,
                      page,
                      size,
                      sort,
                      isNew,
                      filters,
                  },
                  { cache: 'no-store' },
              )
            : await fetchCategoryProducts(
                  {
                      categoryNo: selectedSubCategory.categoryNo,
                      page,
                      size,
                      sort,
                      isNew,
                      filters: activeFilters,
                  },
                  { cache: 'no-store' },
              )
        : await fetchProductSearch(
              {
                  query: keyword || undefined,
                  page,
                  size,
                  sort,
                  isNew,
                  filters,
              },
              { cache: 'no-store' },
          );

    return (
        <div className={styles.pageWrapper}>
            <ProductPageClient
                mode="new"
                categorySlug={categorySlug}
                config={NEW_PRODUCTS_PAGE_CONFIG}
                data={productResponse}
                selectedSubCategory={selectedSubCategory}
                page={page}
                size={size}
                sort={sort}
                filters={filters}
                keyword={keyword}
                isNew={isNew}
            />
        </div>
    );
}

