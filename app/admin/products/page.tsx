import styles from '@/app/(user)/product/page.module.css'
import type { ProductResponse } from '@/types/productTypes'
import {
  CATEGORY_CONFIG,
  DEFAULT_FILTER_STATE,
  NUTRITION_CONFIG,
  ADMIN_PRODUCT_PAGE_SIZE_OPTIONS,
  getSubCategorySlug,
  isCategorySlug,
  isNutritionSlug,
  type ProductFilterKey,
  type NutritionPageConfig,
  type NutritionSlug,
} from '@/constants/adminProductConstants'
import { fetchCategoryProducts, fetchNutritionProducts, fetchProductSearch } from '@/app/(user)/store/api/userProductApi'
import AdminProductPageClient from './components/AdminProductPageClient'
import {
  ProductSearchParams,
  getActiveFilters,
  parseBooleanParam,
  parseFilters,
  parseNumberParam,
  parseSingleValue,
} from '@/lib/utils/productUtils'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductSearchParams>
}) {
  const params = await searchParams

  const collectionParam = parseSingleValue(params.collection)
  const activeCollection: NutritionSlug | 'all' =
    collectionParam && collectionParam !== 'all' && isNutritionSlug(collectionParam)
      ? collectionParam
      : 'all'

  const baseConfig: NutritionPageConfig =
    activeCollection === 'all'
      ? {
          ...NUTRITION_CONFIG['zero-calorie'],
          title: '제품 조회',
          description: '전체 제품을 조회하고 삭제할 수 있습니다.',
          defaultFilters: {},
          lockedFilters: [],
        }
      : NUTRITION_CONFIG[activeCollection]

  const pageParamRaw = parseSingleValue(params.page)
  const parsedPage = pageParamRaw ? Number.parseInt(pageParamRaw, 10) : 1
  const page = Number.isNaN(parsedPage) ? 0 : Math.max(parsedPage - 1, 0)
  const adminPageSizeFallback = ADMIN_PRODUCT_PAGE_SIZE_OPTIONS[0]
  const size = parseNumberParam(parseSingleValue(params.size), adminPageSizeFallback, 1)
  const sort = parseSingleValue(params.sort) ?? baseConfig.defaultSort
  const keyword = parseSingleValue(params.keyword) ?? ''
  const isNewParam = parseBooleanParam(parseSingleValue(params.isNew))

  const categoryParam = parseSingleValue(params.category)
  const categorySlug = categoryParam && isCategorySlug(categoryParam) ? categoryParam : undefined
  const categoryConfig = categorySlug ? CATEGORY_CONFIG[categorySlug] : undefined
  const subParam = parseSingleValue(params.sub)

  const filtersFromQuery = parseFilters(params)
  const filters: Record<ProductFilterKey, boolean> = {
    ...DEFAULT_FILTER_STATE,
    ...baseConfig.defaultFilters,
    ...filtersFromQuery,
  } as Record<ProductFilterKey, boolean>

  baseConfig.lockedFilters.forEach((filterKey) => {
    filters[filterKey] = true
  })

  const selectedSubCategory = categoryConfig
    ? getSubCategorySlug(categoryConfig, subParam)
    : baseConfig.subCategories?.[0] ?? { slug: 'all', label: '전체', categoryNo: 0 }

  const activeFilters = getActiveFilters(filters)

  const hasKeyword = Boolean(keyword)
  const shouldUseSearch = hasKeyword || Boolean(isNewParam)

  const searchCategoryNo =
    selectedSubCategory.categoryNo && selectedSubCategory.categoryNo > 0
      ? selectedSubCategory.categoryNo
      : undefined

  const searchRequestBase: Parameters<typeof fetchProductSearch>[0] = {
    page,
    size,
    sort,
    isNew: isNewParam,
    filters,
    categoryNo: searchCategoryNo,
  }

  let productResponse: ProductResponse
  try {
    productResponse = categoryConfig
      ? await fetchCategoryProducts(
          {
            categoryNo: selectedSubCategory.categoryNo,
            page,
            size,
            sort,
            isNew: isNewParam,
            filters: activeFilters,
          },
          { cache: 'no-store' },
          { includeProductsWithoutImage: true },
        )
      : activeCollection === 'all' || shouldUseSearch
      ? await fetchProductSearch(
          {
            ...searchRequestBase,
            query: keyword || undefined,
          },
          { cache: 'no-store' },
          { includeProductsWithoutImage: true, requireAuth: true },
        )
      : await fetchNutritionProducts(
          baseConfig.slug,
          {
            page,
            size,
            sort,
            keyword: keyword || undefined,
            isNew: isNewParam,
          },
          { cache: 'no-store' },
          { includeProductsWithoutImage: true },
        )
  } catch (error) {
    console.error('[AdminProductsPage] 제품 목록 요청 실패', error)
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.error}>
          <h2>서버와 연결할 수 없습니다.</h2>
          <p>잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    )
  }

  const pageMode = hasKeyword ? 'search' : 'nutrition'

  const adminConfig: NutritionPageConfig = {
    ...baseConfig,
    pageSizeOptions: ADMIN_PRODUCT_PAGE_SIZE_OPTIONS,
  }

  return (
    <div className={styles.pageWrapper}>
      <AdminProductPageClient
        mode={pageMode}
        categorySlug={categorySlug}
        collectionSlug={activeCollection}
        config={adminConfig}
        data={productResponse}
        selectedSubCategory={selectedSubCategory}
        page={page}
        size={size}
        sort={sort}
        filters={filters}
        keyword={keyword}
        isNew={Boolean(isNewParam)}
        lockedFilters={baseConfig.lockedFilters}
      />
    </div>
  )
}

