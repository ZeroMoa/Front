import styles from '@/app/(user)/product/page.module.css'
import {
  CATEGORY_CONFIG,
  DEFAULT_FILTER_STATE,
  NUTRITION_CONFIG,
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
  const size = parseNumberParam(parseSingleValue(params.size), baseConfig.pageSizeOptions[0] ?? 30, 1)
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

  const searchCategoryNo =
    selectedSubCategory.categoryNo && selectedSubCategory.categoryNo > 0
      ? selectedSubCategory.categoryNo
      : undefined

  const productResponse = hasKeyword
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
        { includeProductsWithoutImage: true }
      )
    : categoryConfig
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
        { includeProductsWithoutImage: true }
      )
    : activeCollection === 'all'
    ? await fetchProductSearch(
        {
          page,
          size,
          sort,
          keyword: keyword || undefined,
          isNew: isNewParam,
          filters,
        },
        { cache: 'no-store' },
        { includeProductsWithoutImage: true }
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
        { includeProductsWithoutImage: true }
      )

  const pageMode = hasKeyword ? 'search' : 'nutrition'

  return (
    <div className={styles.pageWrapper}>
      <AdminProductPageClient
        mode={pageMode}
        categorySlug={categorySlug}
        collectionSlug={activeCollection}
        config={baseConfig}
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

