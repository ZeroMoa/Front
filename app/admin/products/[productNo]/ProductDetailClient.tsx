'use client'

import { useMemo, useState, useEffect, useTransition, useRef, useCallback } from 'react'
import type { ChangeEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './adminDetail.module.css'
import { getCdnUrl } from '@/lib/cdn'
import type { Product } from '@/types/productTypes'
import { updateAdminProduct, deleteAdminProduct } from '@/app/admin/store/api/adminProductApi'
import { createSafeImageFile, extractStoredPathFromUrl } from '@/lib/utils/imageUtils'
import { ADMIN_PRODUCT_CATEGORY_TREE } from '@/constants/adminProductCategories'
import type { AdminProductCategoryGroup } from '@/types/adminCategoryTypes'

const DEFAULT_IMAGE = getCdnUrl('/images/default-product.png')
const PRODUCT_IMAGES_DISABLED = true // 이미지 저작권 협의 완료 후 이 플래그를 false로 전환해주세요.

const SWEETENER_KEYWORDS = [
  '알룰로스',
  '에리스리톨',
  '말티톨',
  '솔비톨',
  '자일리톨',
  '아스파탐',
  '아세설팜칼륨',
  '수크랄로스',
  '사카린',
  '스테비올',
  '이소말트',
  '타가토스',
  '알룰로오스'
]

const CAFFEINE_KEYWORDS = ['카페인']
const DECAF_PREFIXES = ['디', '디 ']

const isDecafContext = (value: string, index: number) => {
  return DECAF_PREFIXES.some((prefix) => {
    if (index < prefix.length) {
      return false
    }

    return value.slice(index - prefix.length, index) === prefix
  })
}

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
        if (rule.type === 'caffeine' && isDecafContext(value, index)) {
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
      const parsed = new URL(corrected)
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
  productName: string
  companyName: string
  parentCategoryNo: string
  categoryNo: string
  totalContent: string
  allergens: string
  crossContaminationWarning: string
  ingredients: string
  nutrition: Record<NutritionKey, string>
}

const toNumericString = (value?: number | null) => {
  if (!hasNumberValue(value ?? null)) {
    return ''
  }
  return String(value)
}

const createInitialFormState = (product: Product): FormState => {
  const resolvedParentCategoryNo =
    (product as Product & { parentCategoryNo?: number }).parentCategoryNo ?? product.categoryNo ?? 0
  const resolvedCategoryNo = product.categoryNo ?? 0

  return {
    productName: product.productName ?? '',
    companyName: product.companyName ?? '',
    parentCategoryNo: resolvedParentCategoryNo ? String(resolvedParentCategoryNo) : '',
    categoryNo: resolvedCategoryNo ? String(resolvedCategoryNo) : '',
    totalContent: product.totalContent ?? '',
    allergens: product.allergens ?? '',
    crossContaminationWarning: product.crossContaminationWarning ?? '',
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
  }
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
  const [editingHighlight, setEditingHighlight] = useState<
    'totalContent' | 'allergens' | 'crossContaminationWarning' | null
  >(null)
  const [editingNutritionKey, setEditingNutritionKey] = useState<NutritionKey | null>(null)
  const [isEditingIngredients, setIsEditingIngredients] = useState(false)
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [, startTransition] = useTransition()
  
  // 커스텀 드롭다운 상태
  const [showParentDropdown, setShowParentDropdown] = useState(false)
  const [showChildDropdown, setShowChildDropdown] = useState(false)
  const parentDropdownRef = useRef<HTMLDivElement>(null)
  const childDropdownRef = useRef<HTMLDivElement>(null)

  const initialFormRef = useRef<FormState>(createInitialFormState(product))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previewUrlRef = useRef<string | null>(null)
  const productNameInputRef = useRef<HTMLInputElement | null>(null)
  const companyNameInputRef = useRef<HTMLInputElement | null>(null)

  const clearImagePreview = useCallback(() => {
    if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    previewUrlRef.current = null
    setImagePreview(null)
  }, [])

  const updateImageSelection = useCallback(
    (file: File | null) => {
      clearImagePreview()
      if (file) {
        const safeFile = createSafeImageFile(file)
        const objectUrl = URL.createObjectURL(safeFile)
        previewUrlRef.current = objectUrl
        setImageFile(safeFile)
        setImagePreview(objectUrl)
      } else {
        setImageFile(null)
      }
    },
    [clearImagePreview]
  )

  useEffect(() => {
    const initial = createInitialFormState(product)
    initialFormRef.current = initial
    setFormState(initial)
    setEditingHighlight(null)
    setEditingNutritionKey(null)
    setIsEditingIngredients(false)
    setIsEditingBasicInfo(false)
    setImageFile(null)
    clearImagePreview()
  }, [product, clearImagePreview])

  useEffect(() => {
    return () => {
      clearImagePreview()
    }
  }, [clearImagePreview])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (parentDropdownRef.current && !parentDropdownRef.current.contains(event.target as Node)) {
        setShowParentDropdown(false)
      }
      if (childDropdownRef.current && !childDropdownRef.current.contains(event.target as Node)) {
        setShowChildDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const originalImageUrl = resolveImageUrl((product as any).imageUrl ?? (product as any).imageurl)
  const imageSrc = imagePreview ?? originalImageUrl
  const existingStoredPath = useMemo(
    () => extractStoredPathFromUrl((product as any).imageUrl ?? (product as any).imageurl),
    [product],
  )
  const existingAttachmentNo = useMemo(() => (product.attachmentNo ?? null), [product])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    updateImageSelection(file)
    event.target.value = ''
  }

  const handleResetSelectedImage = () => {
    updateImageSelection(null)
  }
  const parentOptions = useMemo(
    () =>
      ADMIN_PRODUCT_CATEGORY_TREE.map((group) => ({
        value: String(group.parent.id),
        label: group.parent.name,
      })),
    []
  )

  const selectedParentGroup = useMemo<AdminProductCategoryGroup | undefined>(() => {
    const parentId =
      Number(formState.parentCategoryNo) ||
      (product as Product & { parentCategoryNo?: number }).parentCategoryNo ||
      product.categoryNo ||
      0
    if (!parentId) {
      return undefined
    }
    const directMatch = ADMIN_PRODUCT_CATEGORY_TREE.find((group) => group.parent.id === parentId)
    if (directMatch) {
      return directMatch
    }
    const childMatch = ADMIN_PRODUCT_CATEGORY_TREE.find((group) =>
      group.children.some((child) => child.id === parentId)
    )
    return childMatch
  }, [formState.parentCategoryNo, product])

  const childOptions = useMemo(() => {
    if (!selectedParentGroup) {
      return []
    }
    return [
      {
        value: String(selectedParentGroup.parent.id),
        label: `${selectedParentGroup.parent.name} 전체`,
      },
      ...selectedParentGroup.children.map((child) => ({
        value: String(child.id),
        label: child.name,
      })),
    ]
  }, [selectedParentGroup])

  const categoryLabel = useMemo(() => {
    const parentName = selectedParentGroup?.parent.name ?? '카테고리 미지정'
    const categoryId = Number(
      formState.categoryNo ||
        selectedParentGroup?.parent.id ||
        (product as Product & { parentCategoryNo?: number }).parentCategoryNo ||
        product.categoryNo ||
        0
    )

    if (!selectedParentGroup) {
      return parentName
    }
    if (categoryId === selectedParentGroup.parent.id) {
      return `${parentName} | 전체`
    }
    const child = selectedParentGroup.children.find((item) => item.id === categoryId)
    return child ? `${parentName} | ${child.name}` : `${parentName} | 전체`
  }, [formState.categoryNo, product, selectedParentGroup])

  const servingSizeLabel =
    hasNumberValue(product.servingSize) && product.servingSize > 0
      ? `${product.servingSize}${(product.servingUnit ?? '').trim()}`
      : undefined

  const initialSnapshot = initialFormRef.current

  const highlightItems = useMemo(() => {
    const items: Array<
      | {
          label: string
          value: string
          editable: true
          field: 'totalContent' | 'allergens' | 'crossContaminationWarning'
          isModified: boolean
        }
      | { label: string; value: string; editable: false; isModified: boolean }
    > = [
      {
        label: '총 내용량',
        value: formState.totalContent.trim() || '정보 없음',
        editable: true as const,
        field: 'totalContent' as const,
        isModified: formState.totalContent !== initialSnapshot.totalContent,
      },
      {
        label: '알레르기',
        value: formState.allergens.trim() || '정보 없음',
        editable: true as const,
        field: 'allergens' as const,
        isModified: formState.allergens !== initialSnapshot.allergens,
      },
      {
        label: '교차 오염',
        value: formState.crossContaminationWarning.trim() || '정보 없음',
        editable: true as const,
        field: 'crossContaminationWarning' as const,
        isModified: formState.crossContaminationWarning !== initialSnapshot.crossContaminationWarning,
      },
    ]

    if (servingSizeLabel) {
      items.push({
        label: '1회 제공량',
        value: servingSizeLabel,
        editable: false as const,
        isModified: false,
      })
    }

    return items
  }, [formState, initialSnapshot, servingSizeLabel])

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

  const handleBasicInfoToggle = () => {
    setIsEditingBasicInfo((prev) => !prev)
  }

  const handleBasicInputChange =
    (field: 'productName' | 'companyName') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  const handleHighlightChange = (
    field: 'totalContent' | 'allergens' | 'crossContaminationWarning',
    value: string
  ) => {
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

  const isProductNameModified = formState.productName !== initialSnapshot.productName
  const isCompanyNameModified = formState.companyName !== initialSnapshot.companyName
  const isCategoryModified =
    formState.parentCategoryNo !== initialSnapshot.parentCategoryNo ||
    formState.categoryNo !== initialSnapshot.categoryNo

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const payload = new FormData()
      payload.append('productName', formState.productName.trim())
      payload.append('companyName', formState.companyName.trim())

      const parentCategoryFallback =
        formState.parentCategoryNo ||
        String(
          (product as Product & { parentCategoryNo?: number }).parentCategoryNo ??
            formState.categoryNo ??
            product.categoryNo ??
            ''
        )
      const categoryFallback = formState.categoryNo || String(product.categoryNo ?? '')

      if (parentCategoryFallback) {
        payload.append('parentCategoryNo', parentCategoryFallback)
      }
      if (categoryFallback) {
        payload.append('categoryNo', categoryFallback)
      }

      payload.append('totalContent', formState.totalContent.trim())
      payload.append('allergens', formState.allergens.trim())
      payload.append('crossContaminationWarning', formState.crossContaminationWarning.trim())
      payload.append('ingredients', formState.ingredients.trim())

      NUTRITION_FIELDS.forEach(({ key }) => {
        const value = formState.nutrition[key] ?? ''
        const parsed = toNullableNumber(value)
        payload.append(key, parsed !== null ? String(parsed) : '')
      })

      if (imageFile) {
        payload.append('newAttachments', imageFile)
        if (existingAttachmentNo !== null) {
          payload.append('deleteAttachmentNos', String(existingAttachmentNo))
        }
        if (existingStoredPath) {
          payload.append('existingStoredPath', existingStoredPath)
        }
      } else if (existingStoredPath) {
        payload.append('existingStoredPath', existingStoredPath)
      }

      const updated = await updateAdminProduct(product.productNo, payload)

      setFormState(createInitialFormState(updated))
      setEditingHighlight(null)
      setEditingNutritionKey(null)
      setIsEditingIngredients(false)
      setIsEditingBasicInfo(false)
      updateImageSelection(null)
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

  const handleBackClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/admin/products')
  }, [router])

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
      <div className={styles.backButtonRow}>
        <button
          type="button"
          className={styles.backButton}
          aria-label="목록 페이지로 이동"
          onClick={handleBackClick}
        >
          <span className={styles.backIcon} aria-hidden="true" />
          <span className={styles.backText}>목록으로</span>
        </button>
      </div>
      <main className={styles.productContainer}>
        <div className={styles.imageSection}>
          <div className={styles.imageFavoriteOverlay}>
            <span className={styles.imageFavoriteCount}>좋아요 {likesCount.toLocaleString()}</span>
          </div>
          {PRODUCT_IMAGES_DISABLED ? (
            <div className={styles.imagePlaceholder}>
              <p>제품 이미지는 저작권 정리가 완료되면 다시 보여드릴 예정입니다.</p>
            </div>
          ) : (
            <>
              <button type="button" className={styles.imageUploadButton} onClick={handleImageClick}>
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
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.imageUploadInput}
                onChange={handleImageInputChange}
              />
              <div className={styles.imageActions}>
                <p className={styles.imageChangeHint}>
                  이미지를 클릭하면 교체할 수 있습니다.
                </p>
                {imageFile ? <span className={styles.imageFileName}>파일명 : {imageFile.name}</span> : null}

                {imageFile ? (
                  <button type="button" className={styles.imageResetButton} onClick={handleResetSelectedImage}>
                    선택 취소
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>

        <section className={styles.infoSection}>
          <div className={styles.infoCard} ref={infoCardRef}>
            <div className={styles.productHeader}>
              <div className={styles.productMeta}>
                <div className={styles.metaTopRow}>
                  {isEditingBasicInfo ? (
                    <div className={styles.categoryEditor}>
                      <label className={styles.categoryField}>
                        <span className={styles.categoryFieldLabel}>상위 카테고리</span>
                        <div 
                          ref={parentDropdownRef}
                          className={`${styles.boxSelect} ${showParentDropdown ? styles.on : ''}`}
                        >
                          <button 
                            type="button" 
                            className={styles.selectDisplayField}
                            onClick={() => setShowParentDropdown(!showParentDropdown)}
                          >
                            {parentOptions.find(opt => opt.value === formState.parentCategoryNo)?.label || '상위를 선택하세요'}
                          </button>
                          <div className={styles.selectArrowContainer} onClick={() => setShowParentDropdown(!showParentDropdown)}>
                            <span className={styles.selectArrowIcon}></span>
                          </div>
                          <div className={styles.boxLayer}>
                            <ul className={styles.listOptions}>
                              <li className={styles.listItem}>
                                <button
                                  type="button"
                                  className={`${styles.buttonOption} ${!formState.parentCategoryNo ? styles.buttonOptionSelected : ''}`}
                                  onClick={() => {
                                    setFormState((prev) => ({ ...prev, parentCategoryNo: '', categoryNo: '' }))
                                    setShowParentDropdown(false)
                                  }}
                                >
                                  상위를 선택하세요
                                </button>
                              </li>
                              {parentOptions.map((option) => (
                                <li key={option.value} className={styles.listItem}>
                                  <button
                                    type="button"
                                    className={`${styles.buttonOption} ${option.value === formState.parentCategoryNo ? styles.buttonOptionSelected : ''}`}
                                    onClick={() => {
                                      const group = ADMIN_PRODUCT_CATEGORY_TREE.find((item) => String(item.parent.id) === option.value)
                                      const nextCategoryNo = group ? String(group.parent.id) : option.value
                                      setFormState((prev) => ({
                                        ...prev,
                                        parentCategoryNo: option.value,
                                        categoryNo: nextCategoryNo,
                                      }))
                                      setShowParentDropdown(false)
                                    }}
                                  >
                                    {option.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </label>
                      <label className={styles.categoryField}>
                        <span className={styles.categoryFieldLabel}>세부 카테고리</span>
                        <div 
                          ref={childDropdownRef}
                          className={`${styles.boxSelect} ${showChildDropdown ? styles.on : ''} ${!formState.parentCategoryNo ? styles.disabled : ''}`}
                        >
                          <button 
                            type="button" 
                            className={styles.selectDisplayField}
                            onClick={() => formState.parentCategoryNo && setShowChildDropdown(!showChildDropdown)}
                            disabled={!formState.parentCategoryNo}
                          >
                            {childOptions.find(opt => opt.value === formState.categoryNo)?.label || (formState.parentCategoryNo ? '세부카테고리를 선택하세요' : '상위를 먼저 선택하세요')}
                          </button>
                          <div className={styles.selectArrowContainer} onClick={() => formState.parentCategoryNo && setShowChildDropdown(!showChildDropdown)}>
                            <span className={styles.selectArrowIcon}></span>
                          </div>
                          <div className={styles.boxLayer}>
                            <ul className={styles.listOptions}>
                              <li className={styles.listItem}>
                                <button
                                  type="button"
                                  className={`${styles.buttonOption} ${!formState.categoryNo ? styles.buttonOptionSelected : ''}`}
                                  onClick={() => {
                                    setFormState((prev) => ({ ...prev, categoryNo: '' }))
                                    setShowChildDropdown(false)
                                  }}
                                >
                                  {formState.parentCategoryNo ? '세부카테고리를 선택하세요' : '상위를 먼저 선택하세요'}
                                </button>
                              </li>
                              {childOptions.map((option) => (
                                <li key={option.value} className={styles.listItem}>
                                  <button
                                    type="button"
                                    className={`${styles.buttonOption} ${option.value === formState.categoryNo ? styles.buttonOptionSelected : ''}`}
                                    onClick={() => {
                                      setFormState((prev) => ({ ...prev, categoryNo: option.value }))
                                      setShowChildDropdown(false)
                                    }}
                                  >
                                    {option.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <span
                      className={`${styles.category} ${isCategoryModified ? styles.modifiedText : ''}`.trim()}
                    >
                      {categoryLabel}
                    </span>
                  )}
                  <div className={styles.metaActionGroup}>
                    <button
                      type="button"
                      className={styles.metaEditButton}
                      onClick={handleBasicInfoToggle}
                    >
                      {isEditingBasicInfo ? '닫기' : '필수 기본 정보 수정'}
                    </button>
                  </div>
                </div>
                <div className={styles.productTitleGroup}>
                  <div className={styles.productTitleRow}>
                    {isEditingBasicInfo ? (
                      <input
                        ref={productNameInputRef}
                        className={`${styles.productNameInput} ${
                          isProductNameModified ? styles.modifiedText : ''
                        }`.trim()}
                        value={formState.productName}
                        onChange={handleBasicInputChange('productName')}
                        placeholder="제품명을 입력하세요"
                      />
                    ) : (
                      <h1
                        className={`${styles.productName} ${
                          isProductNameModified ? styles.modifiedText : ''
                        }`.trim()}
                      >
                        {formState.productName || '제품명 미입력'}
                      </h1>
                    )}
                  </div>
                  {(isEditingBasicInfo || formState.companyName.trim()) && (
                    <>
                      <span className={styles.productHeaderDivider} aria-hidden="true" />
                      <div className={styles.companyRow}>
                        {isEditingBasicInfo ? (
                          <input
                            ref={companyNameInputRef}
                            className={`${styles.companyNameInput} ${
                              isCompanyNameModified ? styles.modifiedText : ''
                            }`.trim()}
                            value={formState.companyName}
                            onChange={handleBasicInputChange('companyName')}
                            placeholder="회사명을 입력하세요"
                          />
                        ) : (
                          <p
                            className={`${styles.companyNameDetail} ${
                              isCompanyNameModified ? styles.modifiedText : ''
                            }`.trim()}
                          >
                            {formState.companyName?.trim() || '회사명 정보 없음'}
                          </p>
                        )}
                      </div>
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
                            autoFocus
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
