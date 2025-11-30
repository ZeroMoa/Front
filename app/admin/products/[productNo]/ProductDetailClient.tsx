'use client'

import { useMemo, useState, useEffect, useTransition, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './adminDetail.module.css'
import { getCdnUrl } from '@/lib/cdn'
import type { Product } from '@/types/productTypes'
import { updateAdminProduct, deleteAdminProduct, type AdminProductUpdatePayload } from '@/app/admin/store/api/adminProductApi'

const DEFAULT_IMAGE = getCdnUrl('/images/default-product.png')

const SWEETENER_KEYWORDS = [
  '알룰로스',
  '에리스리톨',
  '말티톨',
  '솔비톨',
  '자일리톨',
  '아스파탐',
  '아세설팜',
  '수크랄로스',
  '사카린',
  '스테비올',
  '이소말트',
  '타가토스',
]

const CAFFEINE_KEYWORDS = ['카페인']

type IngredientHighlightType = 'sweetener' | 'caffeine'

const INGREDIENT_HIGHLIGHT_RULES: Array<{ keywords: readonly string[]; type: IngredientHighlightType }> = [
  { keywords: SWEETENER_KEYWORDS, type: 'sweetener' },
  { keywords: CAFFEINE_KEYWORDS, type: 'caffeine' },
]

type IngredientSegment = {
  text: string
  highlight?: IngredientHighlightType
}

const segmentIngredientText = (value: string): IngredientSegment[] => {
  if (!value) {
    return []
  }

  const segments: IngredientSegment[] = []
  let cursor = 0

  while (cursor < value.length) {
    let bestMatch: { start: number; end: number; highlight: IngredientHighlightType } | null = null

    for (const rule of INGREDIENT_HIGHLIGHT_RULES) {
      for (const keyword of rule.keywords) {
        if (!keyword) {
          continue
        }
        const index = value.indexOf(keyword, cursor)
        if (index === -1) {
          continue
        }
        if (
          bestMatch === null ||
          index < bestMatch.start ||
          (index === bestMatch.start && keyword.length > bestMatch.end - bestMatch.start)
        ) {
          bestMatch = {
            start: index,
            end: index + keyword.length,
            highlight: rule.type,
          }
        }
      }
    }

    if (!bestMatch) {
      segments.push({ text: value.slice(cursor) })
      break
    }

    if (bestMatch.start > cursor) {
      segments.push({ text: value.slice(cursor, bestMatch.start) })
    }

    segments.push({
      text: value.slice(bestMatch.start, bestMatch.end),
      highlight: bestMatch.highlight,
    })

    cursor = bestMatch.end
  }

  return segments
}

const fixUnencodedPercents = (value: string) => value.replace(/%(?![0-9A-Fa-f]{2})/g, '%25')

const splitIngredients = (value: string): string[] => {
  if (!value) {
    return []
  }
  const raw = value.trim()
  if (!raw) {
    return []
  }

  const result: string[] = []
  let buffer = ''
  let depth = 0
  let isBalanced = true

  for (const char of raw) {
    if (char === '(') {
      depth += 1
      buffer += char
      continue
    }
    if (char === ')') {
      depth -= 1
      if (depth < 0) {
        isBalanced = false
      }
      buffer += char
      continue
    }
    if (char === ',' && depth === 0) {
      if (buffer.trim()) {
        result.push(buffer.trim())
      }
      buffer = ''
      continue
    }
    buffer += char
  }

  if (buffer.trim()) {
    result.push(buffer.trim())
  }

  if (!isBalanced || depth !== 0) {
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return result
}

const resolveImageUrl = (url?: string | null) => {
  if (!url) {
    return DEFAULT_IMAGE
  }
  const trimmed = url.trim()
  if (!trimmed) {
    return DEFAULT_IMAGE
  }
  if (/^https?:\/\//i.test(trimmed)) {
    const corrected = fixUnencodedPercents(trimmed)
    try {
      const encodeSegment = (segment: string) => {
        if (!segment) {
          return segment
        }
        try {
          const decoded = decodeURIComponent(segment)
          const trimmedSegment = decoded.trim()
          return encodeURIComponent(trimmedSegment)
        } catch {
          const trimmedSegment = segment.trim()
          return trimmedSegment ? encodeURIComponent(trimmedSegment) : ''
        }
      }

      const encodedPath = parsed.pathname
        .split('/')
        .map((segment) => encodeSegment(segment))
        .join('/')
      return `${parsed.origin}${encodedPath}${parsed.search}${parsed.hash}`
    } catch {
      return encodeURI(corrected)
    }
  }
  const sanitized = fixUnencodedPercents(trimmed)
  return getCdnUrl(sanitized.startsWith('/') ? sanitized : `/${sanitized}`)
}

const hasNumberValue = (value?: number | null) => typeof value === 'number' && !Number.isNaN(value) && value !== 0

const formatPercentageValue = (amount: number, base: number) => {
  if (!Number.isFinite(amount) || !Number.isFinite(base) || base === 0) {
    return ''
  }
  return `${Math.round((amount / base) * 100)}%`
}

type NutritionKey =
  | 'energyKcal'
  | 'carbohydrateG'
  | 'sugarG'
  | 'proteinG'
  | 'fatG'
  | 'saturatedFattyAcidsG'
  | 'transFattyAcidsG'
  | 'cholesterolMg'
  | 'sodiumMg'
  | 'caffeineMg'
  | 'taurineMg'
  | 'sugarAlcoholG'
  | 'alluloseG'
  | 'erythritolG'

const NUTRITION_FIELDS: Array<{ key: NutritionKey; label: string; unit: string; percentBase?: number }> = [
  { key: 'energyKcal', label: '열량', unit: 'kcal' },
  { key: 'carbohydrateG', label: '탄수화물', unit: 'g', percentBase: 324 },
  { key: 'sugarG', label: '당류', unit: 'g', percentBase: 100 },
  { key: 'proteinG', label: '단백질', unit: 'g', percentBase: 55 },
  { key: 'fatG', label: '지방', unit: 'g', percentBase: 54 },
  { key: 'saturatedFattyAcidsG', label: '포화지방', unit: 'g', percentBase: 15 },
  { key: 'transFattyAcidsG', label: '트랜스지방', unit: 'g' },
  { key: 'cholesterolMg', label: '콜레스테롤', unit: 'mg', percentBase: 300 },
  { key: 'sodiumMg', label: '나트륨', unit: 'mg', percentBase: 2000 },
  { key: 'caffeineMg', label: '카페인', unit: 'mg', percentBase: 400 },
  { key: 'taurineMg', label: '타우린', unit: 'mg' },
  { key: 'sugarAlcoholG', label: '당알코올', unit: 'g' },
  { key: 'alluloseG', label: '알룰로스', unit: 'g' },
  { key: 'erythritolG', label: '에리스리톨', unit: 'g' },
]

type FormState = {
  totalContent: string
  allergens: string
  ingredients: string
  nutrition: Record<NutritionKey, string>
}

const toNumericString = (value?: number | null) => {
  if (!hasNumberValue(value ?? null)) {
    return ''
  }
  return String(value)
}

const createInitialFormState = (product: Product): FormState => ({
  totalContent: product.totalContent ?? '',
  allergens: product.allergens ?? '',
  ingredients: product.ingredients ?? '',
  nutrition: {
    energyKcal: toNumericString(product.energyKcal),
    carbohydrateG: toNumericString(product.carbohydrateG),
    sugarG: toNumericString(product.sugarG),
    proteinG: toNumericString(product.proteinG),
    fatG: toNumericString(product.fatG),
    saturatedFattyAcidsG: toNumericString(product.saturatedFattyAcidsG),
    transFattyAcidsG: toNumericString(product.transFattyAcidsG),
    cholesterolMg: toNumericString(product.cholesterolMg),
    sodiumMg: toNumericString(product.sodiumMg),
    caffeineMg: toNumericString(product.caffeineMg),
    taurineMg: toNumericString(product.taurineMg),
    sugarAlcoholG: toNumericString(product.sugarAlcoholG),
    alluloseG: toNumericString(product.alluloseG),
    erythritolG: toNumericString(product.erythritolG),
  },
})

const getCategoryNames = (parentCategoryNo: number, categoryNo: number) => {
  const parentCategories: Record<number, string> = {
    1: '음료',
    2: '과자',
    3: '아이스크림',
    4: '카페',
  }

  const subCategories: Record<number, string> = {
    4: '탄산',
    5: '주스',
    6: '유제품',
    7: '차',
    8: '커피',
    9: '에너지 드링크',
    10: '주류',
    11: '기타',
    12: '과자',
    13: '사탕',
    14: '젤리',
    15: '초콜릿',
    16: '시리얼',
    17: '기타',
  }

  const parentName = parentCategories[parentCategoryNo] || '기타'
  const subName = subCategories[categoryNo] || '기타'

  return `${parentName} | ${subName}`
}

const toNullableNumber = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  const parsed = Number(trimmed)
  return Number.isNaN(parsed) ? null : parsed
}

type ProductDetailClientProps = {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>(() => createInitialFormState(product))
  const [editingHighlight, setEditingHighlight] = useState<'totalContent' | 'allergens' | null>(null)
  const [editingNutritionKey, setEditingNutritionKey] = useState<NutritionKey | null>(null)
  const [isEditingIngredients, setIsEditingIngredients] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [, startTransition] = useTransition()
  const initialFormRef = useRef<FormState>(createInitialFormState(product))

  useEffect(() => {
    const initial = createInitialFormState(product)
    initialFormRef.current = initial
    setFormState(initial)
    setEditingHighlight(null)
    setEditingNutritionKey(null)
    setIsEditingIngredients(false)
  }, [product])

  const imageSrc = resolveImageUrl((product as any).imageUrl ?? (product as any).imageurl)
  const categoryLabel = useMemo(
    () => getCategoryNames((product as Product & { parentCategoryNo?: number }).parentCategoryNo ?? product.categoryNo, product.categoryNo),
    [product.categoryNo, (product as Product & { parentCategoryNo?: number }).parentCategoryNo]
  )

  const servingSizeLabel =
    hasNumberValue(product.servingSize) && product.servingSize > 0
      ? `${product.servingSize}${(product.servingUnit ?? '').trim()}`
      : undefined

  const highlightItems = [
    formState.totalContent
      ? {
          label: '총 내용량',
          value: formState.totalContent,
          editable: true as const,
          field: 'totalContent' as const,
          isModified: formState.totalContent !== initialFormRef.current.totalContent,
        }
      : null,
    servingSizeLabel
      ? { label: '1회 제공량', value: servingSizeLabel, editable: false as const, isModified: false }
      : null,
    formState.allergens
      ? {
          label: '알레르기',
          value: formState.allergens,
          editable: true as const,
          field: 'allergens' as const,
          isModified: formState.allergens !== initialFormRef.current.allergens,
        }
      : null,
  ].filter(Boolean) as Array<
    | { label: string; value: string; editable: true; field: 'totalContent' | 'allergens'; isModified: boolean }
    | { label: string; value: string; editable: false; isModified: boolean }
  >

  const nutritionRows = useMemo(() => {
    return NUTRITION_FIELDS.map((field) => {
      const rawValue = formState.nutrition[field.key] ?? ''
      const numericValue = Number(rawValue)
      const hasValue = rawValue.trim().length > 0 && !Number.isNaN(numericValue) && numericValue > 0
      const isEditing = editingNutritionKey === field.key
      if (!hasValue && !isEditing) {
        return null
      }
      const percentLabel =
        field.percentBase && hasValue ? formatPercentageValue(Number(rawValue), field.percentBase) : ''
    const initialValue = initialFormRef.current.nutrition[field.key] ?? ''
    const isModified = rawValue !== initialValue

    return {
        ...field,
        rawValue,
        percentLabel,
        isEditing,
        hasValue,
      isModified,
      }
    }).filter(Boolean) as Array<
      (typeof NUTRITION_FIELDS)[number] & {
        rawValue: string
        percentLabel: string
        isEditing: boolean
        hasValue: boolean
        isModified: boolean
      }
    >
  }, [formState.nutrition, editingNutritionKey])

  const ingredientTokens = useMemo(() => splitIngredients(formState.ingredients), [formState.ingredients])

  const handleHighlightChange = (field: 'totalContent' | 'allergens', value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNutritionChange = (key: NutritionKey, value: string) => {
    setFormState((prev) => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const payload: AdminProductUpdatePayload = {
        totalContent: formState.totalContent.trim(),
        allergens: formState.allergens.trim(),
        ingredients: formState.ingredients.trim(),
      }

      NUTRITION_FIELDS.forEach(({ key }) => {
        const value = formState.nutrition[key] ?? ''
        const parsed = toNullableNumber(value)
        ;(payload as Record<NutritionKey, number | null>)[key] = parsed
      })

      const updated = await updateAdminProduct(product.productNo, payload)

      setFormState(createInitialFormState(updated))
      setEditingHighlight(null)
      setEditingNutritionKey(null)
      setIsEditingIngredients(false)
      startTransition(() => {
        router.refresh()
      })
      alert('제품 정보가 수정되었습니다.')
    } catch (error) {
      const message = error instanceof Error ? error.message : '제품 정보 수정 중 오류가 발생했습니다.'
      alert(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('정말로 이 제품을 삭제하시겠습니까?')
    if (!confirmed) {
      return
    }
    try {
      await deleteAdminProduct(product.productNo)
      alert('제품이 삭제되었습니다.')
      router.replace('/admin/products')
    } catch (error) {
      const message = error instanceof Error ? error.message : '제품 삭제 중 오류가 발생했습니다.'
      alert(message)
    }
  }

  const infoCardRef = useRef<HTMLDivElement | null>(null)
  const likesCount = product.likesCount ?? 0

  useEffect(() => {
    if (!editingHighlight && !editingNutritionKey) {
      return undefined
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (infoCardRef.current?.contains(event.target as Node)) {
        return
      }
      setEditingHighlight(null)
      setEditingNutritionKey(null)
    }

    document.addEventListener('mousedown', handleDocumentClick)
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
    }
  }, [editingHighlight, editingNutritionKey])

  return (
    <div className={styles.wrapper}>
      <main className={styles.productContainer}>
        <div className={styles.imageSection}>
          <div className={styles.imageFavoriteOverlay}>
            <span className={styles.imageFavoriteCount}>좋아요 {likesCount.toLocaleString()}</span>
          </div>
          <Image
            src={imageSrc}
            alt={product.productName || '제품 이미지'}
            width={300}
            height={300}
              className={styles.detailProductImage}
            unoptimized
            onError={(event) => {
              const target = event.target as HTMLImageElement
              target.src = DEFAULT_IMAGE
            }}
          />
        </div>

        <section className={styles.infoSection}>
          <div className={styles.infoCard} ref={infoCardRef}>
            <div className={styles.productHeader}>
              <div className={styles.productMeta}>
                <div className={styles.metaTopRow}>
                  <span className={styles.category}>{categoryLabel}</span>
                </div>
                <div className={styles.productTitleGroup}>
                  <div className={styles.productTitleRow}>
                    <h1 className={styles.productName}>{product.productName}</h1>
                  </div>
                  {product.companyName?.trim() && (
                    <>
                      <span className={styles.productHeaderDivider} aria-hidden="true" />
                      <p className={styles.companyNameDetail}>{product.companyName.trim()}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {highlightItems.length > 0 && (
              <div className={styles.servingHighlights}>
                {highlightItems.map((item) => {
                  if (item.editable) {
                    const isEditing = editingHighlight === item.field
                    return (
                      <div
                        key={item.label}
                        className={`${styles.servingHighlight} ${styles.editableHighlight}`}
                        onClick={() => setEditingHighlight(item.field)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setEditingHighlight(item.field)
                          }
                        }}
                      >
                        <span className={styles.servingHighlightLabel}>{item.label}</span>
                        {isEditing ? (
                          <input
                            className={styles.editableInput}
                            value={formState[item.field]}
                            onChange={(event) => handleHighlightChange(item.field, event.target.value)}
                            onBlur={() => setEditingHighlight(null)}
                          />
                        ) : (
                          <span
                            className={`${styles.servingHighlightValue} ${
                              item.isModified ? styles.modifiedText : ''
                            }`.trim()}
                          >
                            {formState[item.field]}
                          </span>
                        )}
                      </div>
                    )
                  }
                  return (
                    <div key={item.label} className={styles.servingHighlight}>
                      <span className={styles.servingHighlightLabel}>{item.label}</span>
                      <span
                        className={`${styles.servingHighlightValue} ${
                          item.isModified ? styles.modifiedText : ''
                        }`.trim()}
                      >
                        {item.value}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {highlightItems.length > 0 && nutritionRows.length > 0 && (
              <div className={styles.sectionDivider} aria-hidden="true" />
            )}

            {nutritionRows.length > 0 && (
              <div className={styles.nutritionTable}>
                <h3 className={styles.sectionTitle}>
                  {product.nutritionBasisText
                    ? `영양정보 (${product.nutritionBasisText} 기준)`
                    : product.nutritionBasisValue
                    ? `영양정보 (${product.nutritionBasisValue}${product.nutritionBasisUnit ?? ''} 기준)`
                    : '영양정보'}
                </h3>
                <div className={styles.nutritionTableWrapper}>
                  <table className={styles.nutritionTableGrid}>
                    <thead>
                      <tr className={styles.nutritionHeaderRow}>
                        <th>영양 성분</th>
                        <th>함량</th>
                        <th>1일 기준치 %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nutritionRows.map((row, index) => (
                        <tr
                          key={row.key}
                          className={`${styles.nutritionRow} ${index % 2 === 0 ? styles.nutritionRowEven : ''}`.trim()}
                        >
                          <th scope="row">{row.label}</th>
                          <td
                  className={styles.nutritionEditableCell}
                            onClick={() => setEditingNutritionKey(row.key)}
                          >
                            {row.isEditing ? (
                              <input
                                className={styles.editableInput}
                                value={row.rawValue}
                                onChange={(event) => handleNutritionChange(row.key, event.target.value)}
                                onBlur={() => setEditingNutritionKey(null)}
                              />
                            ) : (
                              <span className={row.isModified ? styles.modifiedText : ''}>
                                {`${row.rawValue}${row.unit}`}
                              </span>
                            )}
                          </td>
                          <td>{row.percentLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {nutritionRows.length > 0 && product.ingredients && product.ingredients.trim() && (
              <div className={styles.sectionDivider} aria-hidden="true" />
            )}
          </div>

            

            {formState.ingredients && (
            <div className={styles.ingredients}>
              <h3 className={styles.sectionTitle}>원재료</h3>
              {isEditingIngredients ? (
                <textarea
                  className={styles.editableTextArea}
                  value={formState.ingredients}
                autoFocus
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      ingredients: event.target.value,
                    }))
                  }
                  onBlur={() => setIsEditingIngredients(false)}
                />
              ) : (
                <p
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsEditingIngredients(true)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setIsEditingIngredients(true)
                    }
                  }}
                >
                  {ingredientTokens.map((ingredient, index) => {
                    if (!ingredient) {
                      return null
                    }

                    const segments = segmentIngredientText(ingredient)
                    const resolvedSegments = segments.length > 0 ? segments : [{ text: ingredient }]

                    return (
                      <span key={`${ingredient}-${index}`} className={styles.ingredient}>
                        {resolvedSegments.map((segment, segmentIndex) => {
                          if (!segment.text) {
                            return null
                          }
                          if (segment.highlight) {
                            const highlightClass =
                              segment.highlight === 'sweetener'
                                ? styles.ingredientKeywordSweetener
                                : styles.ingredientKeywordCaffeine
                            return (
                              <span
                                key={`${ingredient}-${index}-segment-${segmentIndex}`}
                                className={`${styles.ingredientKeyword} ${highlightClass}`}
                              >
                                {segment.text}
                              </span>
                            )
                          }
                          return (
                            <span
                              key={`${ingredient}-${index}-segment-${segmentIndex}`}
                              className={styles.ingredientText}
                            >
                              {segment.text}
                            </span>
                          )
                        })}
                      </span>
                    )
                  })}
                </p>
              )}
            </div>
          )}
        </section>
      </main>
      <div className={styles.saveButtonBar}>
        <button type="button" className={styles.deleteButton} onClick={handleDelete} disabled={isSaving}>
          삭제
        </button>
        <button type="button" className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
          {isSaving ? '저장 중...' : '수정 완료'}
        </button>
      </div>
    </div>
  )
}
