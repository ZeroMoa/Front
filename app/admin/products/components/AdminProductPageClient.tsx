'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import styles from '@/app/(user)/product/page.module.css'
import {
  CATEGORY_CONFIG,
  CATEGORY_LABELS,
  CATEGORY_SLUG_ORDER,
  DEFAULT_FILTER_STATE,
  PRODUCT_FILTER_KEYS,
  type CategoryPageConfig,
  type CategorySlug,
  type NewProductsPageConfig,
  type NutritionSlug,
  type ProductFilterKey,
  type ProductPageConfig,
  type SubCategoryConfig,
} from '@/app/(user)/product/config'
import AdminProductSidebar from './AdminProductSidebar'
import ProductGrid from '@/app/(user)/product/components/ProductGrid'
import ProductPagination from '@/app/(user)/product/components/ProductPagination'
import type { Product, ProductResponse } from '@/types/productTypes'
import { deleteAdminProduct } from '@/app/admin/store/api/adminProductApi'
import { ADMIN_PRODUCT_PAGE_SIZE_OPTIONS } from '@/constants/adminProductConstants'
import { PRODUCT_LIST_SCROLL_STORAGE_KEY } from '@/constants/productNavigationConstants'

type FilterState = typeof DEFAULT_FILTER_STATE
type PageMode = 'category' | 'nutrition' | 'new' | 'search'

const HERO_FILTER_MAP: Record<NutritionSlug, ProductFilterKey> = {
  'zero-calorie': 'isZeroCalorie',
  'zero-sugar': 'isZeroSugar',
  'low-calorie': 'isLowCalorie',
  'low-sugar': 'isLowSugar',
}

type HeroAccentClass =
  | 'heroCardZeroCalorie'
  | 'heroCardZeroSugar'
  | 'heroCardLowCalorie'
  | 'heroCardLowSugar'

interface HeroBannerItem {
  slug: NutritionSlug
  label: string
  accentClass: HeroAccentClass
}

const HERO_BANNER_ITEMS: HeroBannerItem[] = [
  { slug: 'zero-calorie', label: '제로 칼로리', accentClass: 'heroCardZeroCalorie' },
  { slug: 'zero-sugar', label: '제로 슈거', accentClass: 'heroCardZeroSugar' },
  { slug: 'low-calorie', label: '저칼로리', accentClass: 'heroCardLowCalorie' },
  { slug: 'low-sugar', label: '저당', accentClass: 'heroCardLowSugar' },
]

const NEW_HERO_ITEMS = [...HERO_BANNER_ITEMS]

interface AdminProductPageClientProps {
  mode: PageMode
  categorySlug?: CategorySlug
  collectionSlug?: NutritionSlug | 'all'
  config: ProductPageConfig
  data: ProductResponse
  selectedSubCategory: SubCategoryConfig
  page: number
  size: number
  sort: string
  filters: FilterState
  keyword: string
  isNew?: boolean
  lockedFilters?: ProductFilterKey[]
  showParentCategoryActive?: boolean
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
]

const ensurePositiveInteger = (value: number, fallback: number) =>
  Number.isFinite(value) && value >= 0 ? value : fallback

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'productName,asc', label: '제품명 오름차순' },
  { value: 'productName,desc', label: '제품명 내림차순' },
  { value: 'updatedDate,desc', label: '최신 업데이트순' },
  { value: 'createdDate,desc', label: '최신 등록순' },
  { value: 'likesCount,desc', label: '인기순' },
]

export default function AdminProductPageClient({
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
  showParentCategoryActive,
}: AdminProductPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [clientContent, setClientContent] = useState<Product[]>(data.content)
  const searchParamString = searchParams?.toString() ?? ''

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const stored = window.sessionStorage.getItem(PRODUCT_LIST_SCROLL_STORAGE_KEY)
    if (!stored) {
      return
    }

    try {
      const parsed = JSON.parse(stored) as { path?: string; scroll?: number | string }
      const normalizedPath = pathname + (searchParamString ? `?${searchParamString}` : '')
      if (!parsed.path || parsed.path !== normalizedPath) {
        return
      }

      const resolvedScroll =
        typeof parsed.scroll === 'number' ? parsed.scroll : Number.parseInt(String(parsed.scroll), 10)
      const scrollTop = Number.isFinite(resolvedScroll) ? resolvedScroll : 0

      window.requestAnimationFrame(() => {
        window.scrollTo({ top: scrollTop, behavior: 'auto' })
      })
      window.sessionStorage.removeItem(PRODUCT_LIST_SCROLL_STORAGE_KEY)
    } catch {
      window.sessionStorage.removeItem(PRODUCT_LIST_SCROLL_STORAGE_KEY)
    }
  }, [pathname, searchParamString])

  const SUPPORTED_PAGE_SIZES = ADMIN_PRODUCT_PAGE_SIZE_OPTIONS
  type SupportedPageSize = (typeof ADMIN_PRODUCT_PAGE_SIZE_OPTIONS)[number]
  const pageSizeOptions = (config.pageSizeOptions ?? SUPPORTED_PAGE_SIZES).filter((value) =>
    SUPPORTED_PAGE_SIZES.includes(value as SupportedPageSize)
  )
  const normalizedSize = pageSizeOptions.includes(size as SupportedPageSize)
    ? size
    : pageSizeOptions[0]

  const totalPages = data.totalPages ?? 0
  const totalElements = data.totalElements ?? data.content.length

  const currentFilters = useMemo(() => filters, [filters])
  const isNewActive = Boolean(isNew)

  const normalizedSort = useMemo(() => {
    const hasMatch = SORT_OPTIONS.some((option) => option.value === sort)
    return hasMatch ? sort : SORT_OPTIONS[0].value
  }, [sort])

  const activeHeroSlug = useMemo(() => {
    if ((mode === 'nutrition' || mode === 'search') && collectionSlug) {
      return collectionSlug
    }
    if (mode === 'nutrition' || mode === 'search') {
      if (currentFilters.isZeroCalorie) return 'zero-calorie'
      if (currentFilters.isZeroSugar) return 'zero-sugar'
      if (currentFilters.isLowCalorie) return 'low-calorie'
      if (currentFilters.isLowSugar) return 'low-sugar'
      return 'all'
    }
    if (mode === 'new') {
      if (currentFilters.isZeroCalorie) return 'zero-calorie'
      if (currentFilters.isZeroSugar) return 'zero-sugar'
      if (currentFilters.isLowCalorie) return 'low-calorie'
      if (currentFilters.isLowSugar) return 'low-sugar'
      return 'all'
    }
    return undefined
  }, [mode, collectionSlug, currentFilters])

  const selectedCategoryLabel = useMemo(() => {
    if ((mode !== 'nutrition' && mode !== 'new' && mode !== 'search') || !activeCategorySlug) {
      return null
    }
    return CATEGORY_LABELS[activeCategorySlug] ?? null
  }, [mode, activeCategorySlug])

  const summaryLabel = useMemo(() => {
    if (selectedCategoryLabel) {
      return `${selectedCategoryLabel} · ${selectedSubCategory.label}`
    }
    if (mode === 'search') {
      return `검색 결과 · ${selectedSubCategory.label}`
    }
    return selectedSubCategory.label
  }, [mode, selectedCategoryLabel, selectedSubCategory.label])

  const baseParamKey = mode === 'nutrition' || mode === 'search' ? 'collection' : 'type'
  const baseParamValue = mode === 'nutrition' || mode === 'search' ? collectionSlug : activeCategorySlug

  const resolvedSidebarCategorySlug = useMemo(() => {
    if (mode === 'category') {
      return undefined
    }
    if (activeCategorySlug) {
      return activeCategorySlug
    }
    if (!showParentCategoryActive) {
      return undefined
    }
    if (!selectedSubCategory || selectedSubCategory.categoryNo <= 0) {
      return undefined
    }
    const matchedSlug = CATEGORY_SLUG_ORDER.find((slug) =>
      CATEGORY_CONFIG[slug].subCategories.some((subCategory) => subCategory.categoryNo === selectedSubCategory.categoryNo)
    )
    return matchedSlug
  }, [mode, activeCategorySlug, showParentCategoryActive, selectedSubCategory])

  const commitUpdates = (updates: Record<string, string | number | boolean | undefined | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString())

    if (baseParamKey && baseParamValue) {
      nextParams.set(baseParamKey, String(baseParamValue))
    }

    PAGE_PARAM_KEYS.forEach((key) => {
      if (key !== baseParamKey && !Object.prototype.hasOwnProperty.call(updates, key)) {
        return
      }
      if ((mode === 'category' || mode === 'new') && key === 'collection') {
        nextParams.delete('collection')
      }
      if ((mode === 'nutrition' || mode === 'search') && key === 'type') {
        nextParams.delete('type')
      }
    })

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'page') {
        if (value === undefined || value === null || value === '') {
          nextParams.delete('page')
        } else {
          const numericValue = typeof value === 'number' ? value : Number.parseInt(String(value), 10)
          const safeValue = Number.isFinite(numericValue) ? Math.max(0, Math.floor(numericValue)) : 0
          nextParams.set('page', String(safeValue + 1))
        }
        return
      }

      if (value === undefined || value === null || value === '') {
        nextParams.delete(key)
      } else {
        nextParams.set(key, String(value))
      }
    })

    startTransition(() => {
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: true })
    })
  }

  const handlePageChange = (nextPage: number) => {
    commitUpdates({ page: ensurePositiveInteger(nextPage - 1, 0) })
  }

  const handlePageSizeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    const nextSize = Number(event.target.value)
    if (!SUPPORTED_PAGE_SIZES.includes(nextSize as SupportedPageSize)) {
      commitUpdates({ size: SUPPORTED_PAGE_SIZES[0], page: 0 })
      return
    }
    commitUpdates({ size: nextSize, page: 0 })
  }

  const handleSortChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    const nextSort = event.target.value
    commitUpdates({ sort: nextSort, page: 0 })
  }

  const handleSubCategoryChange = (subSlug: string) => {
    commitUpdates({ sub: subSlug, page: 0 })
  }

  const handleCategorySelect = (nextCategory: CategorySlug | 'all', nextSubSlug?: string) => {
    if (nextCategory === 'all') {
      commitUpdates({ category: null, sub: null, type: undefined, page: 0 })
      return
    }

    const targetSub = nextSubSlug ?? 'all'
    const nextParams = new URLSearchParams(searchParams.toString())
    const currentCategory = searchParams.get('category') ?? searchParams.get('type')
    const currentSub = searchParams.get('sub') ?? 'all'

    const isSameSelection = currentCategory === nextCategory && currentSub === targetSub
    if (isSameSelection) {
      commitUpdates({ category: null, sub: null, type: undefined, page: 0 })
      return
    }

    nextParams.set('category', nextCategory)
    nextParams.set('sub', targetSub)
    nextParams.delete('type')
    nextParams.set('page', '1')

    PRODUCT_FILTER_KEYS.forEach((key) => nextParams.delete(key))

    startTransition(() => {
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: true })
    })
  }

  const handleCollectionNavigate = (nextCollection: NutritionSlug | 'all') => {
    const nextParams = new URLSearchParams()

    // 어드민 요구사항: category, sub 파라미터는 유지하고 collection만 변경
    const currentCategory = searchParams.get('category')
    const currentSub = searchParams.get('sub')
    const currentIsNew = searchParams.get('isNew')

    if (currentCategory) {
      nextParams.set('category', currentCategory)
    }
    if (currentSub) {
      nextParams.set('sub', currentSub)
    }
    if (currentIsNew) {
      nextParams.set('isNew', currentIsNew)
    }

    if (nextCollection && nextCollection !== 'all') {
      nextParams.set('collection', nextCollection)
    } else {
      // collection=all 명시적 설정
      nextParams.set('collection', 'all')
    }

    nextParams.set('page', '1')

    // isZeroCalorie 등 나머지 필터는 제거됨 (nextParams를 새로 생성했으므로)

    startTransition(() => {
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: true })
    })
  }

  const handleSidebarInlineReset = () => {
    startTransition(() => {
      router.replace('/admin/products', { scroll: true })
    })
  }

  const handleHeroFilterToggle = (slug: NutritionSlug) => {
    if (mode === 'nutrition') {
      const targetCollection = slug
      if (collectionSlug === targetCollection) {
        return
      }
      // 어드민의 경우 Hero 카드(nutrition 모드)를 누르면 필터 토글이 아니라 
      // 컬렉션 이동(다른 페이지 로드와 유사)으로 처리하는 것이 요구사항에 부합함.
      // 하지만 nutrition 모드에서의 동작은 handleHeroButtonClick에서 처리.
      commitUpdates({ collection: targetCollection, page: 0 })
      return
    }

    const filterKey = HERO_FILTER_MAP[slug]
    if (!filterKey || lockedFilters?.includes(filterKey)) {
      return
    }

    const isActive = currentFilters[filterKey]
    if (isActive) {
      commitUpdates({ [filterKey]: null, page: 0 })
      return
    }

    const filterReset = PRODUCT_FILTER_KEYS.reduce<Record<string, string | null>>((acc, key) => {
      acc[key] = null
      return acc
    }, {})

    commitUpdates({ ...filterReset, [filterKey]: 'true', page: 0 })
  }

  const handleHeroButtonClick = (slug: NutritionSlug) => {
    const isCurrentlyActive = activeHeroSlug === slug
    if (isCurrentlyActive) {
      handleCollectionNavigate('all')
      return
    }
    // Admin 요구사항: Hero 카드 클릭 시 category/sub 유지하고 collection 변경
    handleCollectionNavigate(slug)
  }

  const handleNewHeroSelect = (slug: NutritionSlug) => {
    // New 페이지에서의 동작 - 여기도 Admin 전용 로직이 필요할 수 있으나
    // 사용자가 언급한 Hero 카드 문제는 주로 일반/검색 목록에서의 동작임.
    // New 페이지는 기존 로직 유지 (필터 토글)
    const baseUpdates: Record<string, string | null> = {
      isZeroCalorie: null,
      isZeroSugar: null,
      isLowCalorie: null,
      isLowSugar: null,
    }

    const filterKey = HERO_FILTER_MAP[slug]
    if (lockedFilters?.includes(filterKey)) {
      return
    }

    if (filterKey && currentFilters[filterKey]) {
      commitUpdates({ ...baseUpdates, isNew: 'true', page: 0 })
      return
    }

    commitUpdates({ ...baseUpdates, [filterKey]: 'true', isNew: 'true', page: 0 })
  }

  const handleKeywordSubmit = (rawKeyword: string) => {
    const trimmed = rawKeyword.trim()
    if (!trimmed) {
      commitUpdates({ keyword: null, page: 0 })
      return
    }

    const resetEntries = PRODUCT_FILTER_KEYS.reduce<Record<string, string | null>>((acc, filterKey) => {
      acc[filterKey] = lockedFilters?.includes(filterKey) ? 'true' : null
      return acc
    }, {})

    commitUpdates({ ...resetEntries, keyword: trimmed, page: 0, isNew: null })
  }

  const handleFilterToggle = (filterKey: ProductFilterKey) => {
    if (lockedFilters?.includes(filterKey)) {
      return
    }
    const nextValue = !currentFilters[filterKey]
    commitUpdates({ [filterKey]: nextValue ? 'true' : null, page: 0 })
  }

  const handleResetFilters = () => {
    const resetEntries = PRODUCT_FILTER_KEYS.reduce<Record<string, string | null>>((acc, filterKey) => {
      acc[filterKey] = lockedFilters?.includes(filterKey) ? 'true' : null
      return acc
    }, {})
    commitUpdates({ ...resetEntries, isNew: null, page: 0 })
  }

  const handleNewToggle = () => {
    if (mode === 'new') {
      return
    }
    const nextIsNew = isNewActive ? null : 'true'
    commitUpdates({ isNew: nextIsNew, page: 0 })
  }

  const ignoredNewResetKeys = new Set(['page', 'size', 'sort'])
  const hasNewPageModifiers = useMemo(() => {
    if (mode !== 'new') {
      return false
    }
    if (!searchParams) {
      return false
    }
    const entries = Array.from(searchParams.entries())
    if (entries.length === 0) {
      return false
    }
    return entries.some(([key, value]) => {
      if (!ignoredNewResetKeys.has(key)) {
        return true
      }
      if (key === 'page') {
        return value !== '1'
      }
      if (key === 'size') {
        return !SUPPORTED_PAGE_SIZES.includes(Number(value) as (typeof SUPPORTED_PAGE_SIZES)[number])
      }
      if (key === 'sort') {
        return value !== config.defaultSort
      }
      return false
    })
  }, [mode, searchParams, config.defaultSort])

  const handleNewPageReset = () => {
    if (mode !== 'new') {
      return
    }
    const basePath = pathname && pathname.startsWith('/product/new') ? '/product/new' : pathname ?? '/product/new'
    startTransition(() => {
      router.replace(basePath, { scroll: true })
    })
  }

  useEffect(() => {
    setClientContent(data.content)
  }, [data.content])

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm('정말로 삭제하시겠습니까?')
    if (!confirmed) {
      return
    }
    try {
      await deleteAdminProduct(product.productNo)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '제품 삭제 중 오류가 발생했습니다.'
      alert(message)
    }
  }

  const getProductHref = (product: Product) => `/admin/products/${product.productNo}`

  const pageSizeLabel = pageSizeOptions.includes(normalizedSize) ? normalizedSize : pageSizeOptions[0]
  const totalCountLabel = totalElements.toLocaleString()

  return (
    <div className={styles.layout}>
      <AdminProductSidebar
        mode={mode}
        keyword={keyword}
        filters={currentFilters}
        onKeywordSubmit={handleKeywordSubmit}
        onFilterToggle={handleFilterToggle}
        onResetFilters={handleResetFilters}
        onInlineReset={handleSidebarInlineReset}
        lockedFilters={lockedFilters}
        selectedCategorySlug={
          mode === 'nutrition' || mode === 'new' || mode === 'search' ? resolvedSidebarCategorySlug : undefined
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
              <select value={pageSizeLabel} onChange={handlePageSizeChange} className={styles.pageSizeSelect}>
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}개씩 보기
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <ProductGrid products={clientContent} variant="admin" onDeleteProduct={handleDelete} getProductHref={getProductHref} />

        {totalPages > 0 && (
          <ProductPagination currentPage={page + 1} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </section>
    </div>
  )

  function renderSubCategorySection() {
    if (!('subCategories' in config) || !Array.isArray(config.subCategories) || config.subCategories.length <= 1) {
      return null
    }
    if (mode === 'category') {
      return (
        <div className={styles.subCategoryHeader}>
          {renderSubCategoryButtons(true)}
        </div>
      )
    }
    if (mode === 'nutrition' || mode === 'search') {
      return (
        <div className={styles.subCategoryHeader}>
          <div className={styles.subCategoryTitleRow}>
            <span className={styles.subCategoryTitle}>카테고리</span>
            <button type="button" className={styles.subCategoryResetButton} onClick={() => handleCategorySelect('all')}>
              전체 보기
            </button>
          </div>
          {renderSubCategoryButtons(true)}
        </div>
      )
    }
    return null
  }

  function renderSubCategoryButtons(includeNewButton: boolean) {
    if (!('subCategories' in config) || !Array.isArray(config.subCategories)) {
      return null
    }
    const subCategories = config.subCategories
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
    )
  }

  function renderHeroInline() {
    // Admin에서는 Hero 카드 동작을 통일 (handleHeroButtonClick 사용)
    const renderButtons = (items: HeroBannerItem[]) => (
      <>
        {items.map((item) => {
          const isActive = activeHeroSlug === item.slug
          const accentClass = styles[item.accentClass]
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
          )
        })}
      </>
    )

    if (mode === 'nutrition' || mode === 'search' || (mode === 'new' && (config as NewProductsPageConfig).kind === 'new')) {
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
          {mode === 'new' ? renderButtons(NEW_HERO_ITEMS) : renderButtons(HERO_BANNER_ITEMS)}
        </div>
      )
    }

    return null
  }
}

              type="button"
              className={`${styles.heroInlineCard} ${accentClass} ${isActive ? styles.heroCardActive : ''}`}
              onClick={() => handleHeroButtonClick(item.slug)}
              aria-pressed={isActive}
            >
              <span className={styles.heroCardLabel}>{item.label}</span>
            </button>
          )
        })}
      </>
    )

    if (mode === 'nutrition' || mode === 'search' || (mode === 'new' && (config as NewProductsPageConfig).kind === 'new')) {
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
          {mode === 'new' ? renderButtons(NEW_HERO_ITEMS) : renderButtons(HERO_BANNER_ITEMS)}
        </div>
      )
    }

    return null
  }
}
