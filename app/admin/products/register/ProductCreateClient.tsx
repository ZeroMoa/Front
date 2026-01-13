'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import styles from './page.module.css'
import { createAdminProduct } from '@/app/admin/store/api/adminProductApi'
import { getCdnUrl } from '@/lib/cdn'
import { createSafeImageFile } from '@/lib/utils/imageUtils'
import type { AdminProductCategoryGroup } from '@/types/adminCategoryTypes'

type HealthFlagKey = 'isZeroCalorie' | 'isLowCalorie' | 'isZeroSugar' | 'isLowSugar'

const ZERO_CALORIE_THRESHOLD = 4
const LOW_CALORIE_THRESHOLD_G = 40
const LOW_CALORIE_THRESHOLD_ML = 20
const ZERO_SUGAR_THRESHOLD = 0.5
const LOW_SUGAR_THRESHOLD_G = 5
const LOW_SUGAR_THRESHOLD_ML = 2.5

const DEFAULT_HEALTH_FLAGS: Record<HealthFlagKey, boolean> = {
  isZeroCalorie: false,
  isLowCalorie: false,
  isZeroSugar: false,
  isLowSugar: false,
}

const DEFAULT_MANUAL_OVERRIDES: Record<HealthFlagKey, boolean> = {
  isZeroCalorie: false,
  isLowCalorie: false,
  isZeroSugar: false,
  isLowSugar: false,
}

const BASE_FOOD_TYPE_SUGGESTIONS = [
  '탄산음료',
  '커피음료',
  '혼합음료',
  '제과류',
  '아이스크림',
  '건강기능식품',
  '가공두유(멸균제품)',
  '곡류가공품',
  '기타 코코아 가공품',
  '균형영양조제식품',
  '과채음료',
] as const

const NUMERIC_KEYS = [
  'servingSize',
  'nutritionBasisValue',
  'energyKcal',
  'carbohydrateG',
  'proteinG',
  'fatG',
  'saturatedFattyAcidsG',
  'transFattyAcidsG',
  'cholesterolMg',
  'sodiumMg',
  'sugarG',
  'sugarAlcoholG',
  'alluloseG',
  'erythritolG',
  'caffeineMg',
  'taurineMg',
] as const

type NumericKey = (typeof NUMERIC_KEYS)[number]

const PRODUCT_FIELD_INDICATORS = new Set([
  'product_name',
  'productName',
  'manufacturer_name',
  'manufacturerName',
  'company_name',
  'companyName',
  'total_content',
  'totalContent',
  'serving_size_value',
  'serving_size',
  'servingUnit',
  'serving_size_unit',
  'nutrition_basis_text',
  'nutritionBasisText',
  'nutrition_basis_value',
  'nutritionBasisValue',
  'nutrition_basis_unit',
  'nutritionBasisUnit',
  'energy_kcal',
  'energyKcal',
  'carbohydrate_g',
  'carbohydrateG',
  'sugar_g',
  'sugarG',
  'fat_g',
  'fatG',
  'sodium_mg',
  'sodiumMg',
  'protein_g',
  'proteinG',
  'cholesterol_mg',
  'cholesterolMg',
  'allulose_g',
  'alluloseG',
  'erythritol_g',
  'erythritolG',
  'trans_fatty_acids_g',
  'transFattyAcidsG',
  'saturated_fatty_acids_g',
  'saturatedFattyAcidsG',
  'caffeine_mg',
  'caffeineMg',
  'taurine_mg',
  'taurineMg',
  'other_nutrition',
  'otherNutrition',
  'ingredients',
  'allergens',
  'cross_contamination_warning',
  'crossContaminationWarning',
])

interface ProductCreateClientProps {
  categoryTree: AdminProductCategoryGroup[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const findProductData = (value: unknown): Record<string, unknown> | null => {
  if (!value) {
    return null
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findProductData(item)
      if (nested) {
        return nested
      }
    }
    return null
  }
  if (!isRecord(value)) {
    return null
  }
  const record = value
  if (Object.keys(record).some((key) => PRODUCT_FIELD_INDICATORS.has(key))) {
    return record
  }
  if ('product_name' in record || 'productName' in record) {
    return record
  }
  if ('products' in record && Array.isArray(record.products)) {
    return findProductData(record.products[0])
  }
  if ('result' in record && isRecord(record.result)) {
    const resultRecord = record.result as Record<string, unknown>
    if ('response' in resultRecord && isRecord(resultRecord.response)) {
      const responseRecord = resultRecord.response as Record<string, unknown>
      if ('products' in responseRecord && Array.isArray(responseRecord.products)) {
        return findProductData(responseRecord.products[0])
      }
      return findProductData(responseRecord)
    }
    return findProductData(resultRecord)
  }
  if ('response' in record && isRecord(record.response)) {
    const responseRecord = record.response as Record<string, unknown>
    if ('products' in responseRecord && Array.isArray(responseRecord.products)) {
      return findProductData(responseRecord.products[0])
    }
  }
  for (const key of Object.keys(record)) {
    const nested = findProductData(record[key])
    if (nested) {
      return nested
    }
  }
  return null
}

const extractDataUrlFromHtml = (html: string): string | null => {
  const match = html.match(/<img[^>]+src=(['"])(data:image\/[^'"]+)\1/i)
  return match ? match[2] : null
}

const createFileFromDataUrl = (dataUrl: string): File | null => {
  const matches = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.*)$/)
  if (!matches) {
    return null
  }
  const mime = matches[1]
  const base64Data = matches[2]
  const binary = atob(base64Data)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i)
  }
  const extension = mime.split('/')[1] ?? 'png'
  return new File([array], `pasted-image.${extension}`, { type: mime })
}

const getImageFileFromClipboard = (event: ClipboardEvent): File | null => {
  const clipboardData = event.clipboardData
  if (!clipboardData) {
    return null
  }

  const file = Array.from(clipboardData.files).find((item) => item.type.startsWith('image/'))
  if (file) {
    return file
  }

  const htmlData = clipboardData.getData('text/html')
  if (htmlData) {
    const dataUrl = extractDataUrlFromHtml(htmlData)
    if (dataUrl) {
      return createFileFromDataUrl(dataUrl)
    }
  }

  const textData = clipboardData.getData('text/plain')
  if (textData && textData.startsWith('data:image')) {
    return createFileFromDataUrl(textData)
  }

  return null
}

const describeProductSearchFailure = (value: unknown): string => {
  if (!value) {
    return 'JSON이 비어 있거나 잘못된 형식입니다.'
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '배열이 비어 있어서 제품을 찾을 수 없습니다.'
    }
    return '루트가 배열입니다. products 배열을 포함하거나 객체를 전달해주셔야 합니다.'
  }
  if (isRecord(value)) {
    if ('products' in value) {
      const products = value.products
      if (!Array.isArray(products)) {
        return 'products 키가 존재하지만 배열이 아닙니다.'
      }
      if (products.length === 0) {
        return 'products 배열이 비어 있습니다.'
      }
      const first = products[0]
      if (!isRecord(first)) {
        return 'products 배열의 첫 항목이 객체 형식이 아닙니다.'
      }
      if (!Object.keys(first).some((key) => PRODUCT_FIELD_INDICATORS.has(key))) {
        return 'products 배열의 항목에 product_name 또는 영양성분 필드가 없습니다.'
      }
    }
    return 'product_name/productName 또는 영양성분 관련 키가 누락되었습니다.'
  }
  return '루트가 객체(JSON)가 아닙니다.'
}

const normalizeNumericValue = (value: unknown): number | null => {
  if (value === undefined || value === null) {
    return null
  }
  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value
  }
  const textValue = String(value)
  return parseNumber(textValue)
}

const convertToBasis100 = (value: number | null, basis: number | null): number | null => {
  if (value === null) {
    return null
  }
  if (!basis || basis === 0) {
    return value
  }
  return (value / basis) * 100
}

const normalizeCategoryNo = (value: unknown): number | null => {
  if (value === undefined || value === null) {
    return null
  }
  const candidate = typeof value === 'string' ? value.trim() : String(value)
  if (!candidate) {
    return null
  }
  const parsed = Number(candidate)
  return Number.isNaN(parsed) ? null : parsed
}

type CategorySelection = {
  parentId: string
  childId: string
}

const findCategorySelection = (
  categoryTree: AdminProductCategoryGroup[],
  categoryNoValue: unknown,
): CategorySelection | null => {
  const normalized = normalizeCategoryNo(categoryNoValue)
  if (normalized === null) {
    return null
  }
  const normalizedStr = String(normalized)
  for (const group of categoryTree) {
    const parentId = String(group.parent.id)
    if (parentId === normalizedStr) {
      return { parentId, childId: parentId }
    }
    const childMatch = group.children.find((child) => String(child.id) === normalizedStr)
    if (childMatch) {
      return { parentId, childId: normalizedStr }
    }
  }
  return null
}

const parseNumber = (value: string): number | null => {
  if (!value) {
    return null
  }
  const sanitized = value.replace(/,/g, '').trim()
  if (!sanitized) {
    return null
  }
  const parsed = Number(sanitized)
  return Number.isNaN(parsed) ? null : parsed
}

const calculateHealthFlags = (
  energy: number | null,
  sugar: number | null,
  basisUnit?: string | null,
): Record<HealthFlagKey, boolean> => {
  const safeEnergy = energy ?? 0
  const safeSugar = sugar ?? 0
  const unit = basisUnit?.trim().toLowerCase() ?? ''
  const isMl = unit.includes('ml')
  const lowCalorieThreshold = isMl ? LOW_CALORIE_THRESHOLD_ML : LOW_CALORIE_THRESHOLD_G
  const lowSugarThreshold = isMl ? LOW_SUGAR_THRESHOLD_ML : LOW_SUGAR_THRESHOLD_G

  return {
    isZeroCalorie: safeEnergy < ZERO_CALORIE_THRESHOLD && safeEnergy >= 0,
    isLowCalorie: safeEnergy < lowCalorieThreshold && safeEnergy >= 0,
    isZeroSugar: safeSugar < ZERO_SUGAR_THRESHOLD && safeSugar >= 0,
    isLowSugar: safeSugar < lowSugarThreshold && safeSugar >= 0,
  }
}

export default function ProductCreateClient({ categoryTree }: ProductCreateClientProps) {
  const router = useRouter()

  const [formValues, setFormValues] = useState<Record<string, string>>({
    productName: '',
    companyName: '',
    manufacturerName: '',
    distributorName: '',
    totalContent: '',
    servingSize: '',
    servingUnit: '',
    nutritionBasisText: '',
    nutritionBasisValue: '',
    nutritionBasisUnit: '',
    energyKcal: '',
    carbohydrateG: '',
    proteinG: '',
    fatG: '',
    saturatedFattyAcidsG: '',
    transFattyAcidsG: '',
    cholesterolMg: '',
    sodiumMg: '',
    sugarG: '',
    sugarAlcoholG: '',
    alluloseG: '',
    erythritolG: '',
    caffeineMg: '',
    taurineMg: '',
    otherNutrition: '',
    ingredients: '',
    allergens: '',
    crossContaminationWarning: '',
    foodType: '',
  })

  const [categoryParentId, setCategoryParentId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isRenewal, setIsRenewal] = useState(false)
  const [healthFlags, setHealthFlags] = useState<Record<HealthFlagKey, boolean>>({ ...DEFAULT_HEALTH_FLAGS })
  const [autoHealthFlags, setAutoHealthFlags] = useState<Record<HealthFlagKey, boolean>>({ ...DEFAULT_HEALTH_FLAGS })
  const [manualOverrides, setManualOverrides] = useState<Record<HealthFlagKey, boolean>>({ ...DEFAULT_MANUAL_OVERRIDES })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [foodTypeOptions, setFoodTypeOptions] = useState<string[]>(() => [...BASE_FOOD_TYPE_SUGGESTIONS])
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)

  // 커스텀 드롭다운 상태
  const [showParentDropdown, setShowParentDropdown] = useState(false)
  const [showChildDropdown, setShowChildDropdown] = useState(false)
  const parentDropdownRef = useRef<HTMLDivElement>(null)
  const childDropdownRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 닫기
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

  const clearPreview = useCallback(() => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const updateImageFile = useCallback(
    (file: File | null) => {
      clearPreview()
      const safeFile = file ? createSafeImageFile(file) : null
      setImageFile(safeFile)
      setImagePreview(safeFile ? URL.createObjectURL(safeFile) : null)
    },
    [clearPreview]
  )

  useEffect(() => {
    return () => {
      clearPreview()
    }
  }, [clearPreview])

  const resolvedImagePreview = useMemo(() => {
    if (!imagePreview) {
      return null
    }
    if (imagePreview.startsWith('blob:') || imagePreview.startsWith('data:')) {
      return imagePreview
    }
    return getCdnUrl(imagePreview)
  }, [imagePreview])

  const selectedParentGroup = useMemo(
    () => categoryTree.find((group) => String(group.parent.id) === categoryParentId),
    [categoryParentId, categoryTree]
  )

  const childCategories = selectedParentGroup?.children ?? []
  const canSelectChildCategory = childCategories.length > 0
  const childCategoryPlaceholder = !categoryParentId
    ? '상위 카테고리를 먼저 선택하세요'
    : canSelectChildCategory
    ? '세부 카테고리를 선택하세요'
    : '세부 카테고리가 없는 카테고리입니다'

  const selectedCategoryLabel = useMemo(() => {
    if (!categoryId) {
      return '선택되지 않음'
    }
    if (!selectedParentGroup) {
      const fallbackParent = categoryTree.find((group) => String(group.parent.id) === categoryId)
      return fallbackParent ? `${fallbackParent.parent.name} (ID: ${categoryId})` : `카테고리 ID: ${categoryId}`
    }
    const parentName = selectedParentGroup.parent.name
    if (String(selectedParentGroup.parent.id) === categoryId) {
      return `${parentName} 전체 (ID: ${categoryId})`
    }
    const child = childCategories.find((item) => String(item.id) === categoryId)
    return child ? `${parentName} > ${child.name} (ID: ${categoryId})` : `${parentName} (ID: ${categoryId})`
  }, [categoryId, selectedParentGroup, childCategories, categoryTree])

  useEffect(() => {
    const energy = parseNumber(formValues.energyKcal)
    const sugar = parseNumber(formValues.sugarG)
    const basisUnit = formValues.nutritionBasisUnit
    const auto = calculateHealthFlags(energy, sugar, basisUnit)
    setAutoHealthFlags(auto)
    setHealthFlags((previous) => {
      const next: Record<HealthFlagKey, boolean> = { ...previous }
      for (const key of Object.keys(auto) as HealthFlagKey[]) {
        if (!manualOverrides[key]) {
          next[key] = auto[key]
        }
      }
      return next
    })
  }, [formValues.energyKcal, formValues.sugarG, manualOverrides])

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleTextareaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleRenewalChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setIsRenewal(event.target.checked)
  }

  const handleHealthFlagChange = (key: HealthFlagKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target
    setManualOverrides((prev) => ({ ...prev, [key]: true }))
    setHealthFlags((prev) => ({ ...prev, [key]: checked }))
  }

  const handleHealthFlagsReset = () => {
    setManualOverrides({ ...DEFAULT_MANUAL_OVERRIDES })
    setHealthFlags((prev) => {
      const next: Record<HealthFlagKey, boolean> = { ...prev }
      for (const key of Object.keys(autoHealthFlags) as HealthFlagKey[]) {
        next[key] = autoHealthFlags[key]
      }
      return next
    })
  }

  const handleJsonInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setJsonInput(event.target.value)
    if (jsonError) {
      setJsonError(null)
    }
  }

  const handleApplyJson = useCallback(() => {
    const trimmed = jsonInput.trim()
    if (!trimmed) {
      setJsonError('OCR JSON을 붙여넣고 적용 버튼을 눌러주세요.')
      return
    }

    try {
      const parsed = JSON.parse(trimmed)
      const productData = findProductData(parsed)
      if (!productData) {
        const failureReason = describeProductSearchFailure(parsed)
        setJsonError(`제품 정보를 찾을 수 없습니다. ${failureReason}`)
        return
      }

      const readValue = (...keys: string[]): unknown | undefined => {
        for (const key of keys) {
          if (key in productData) {
            return productData[key]
          }
        }
        return undefined
      }

      const toStringValue = (value: unknown): string => {
        if (value === undefined || value === null) {
          return ''
        }
        return String(value)
      }

      const basisValue = normalizeNumericValue(readValue('nutrition_basis_value', 'nutritionBasisValue'))
      const parsedEnergy = normalizeNumericValue(readValue('energy_kcal', 'energyKcal'))
      const parsedSugar = normalizeNumericValue(readValue('sugar_g', 'sugarG'))
      const energyPerHundred = convertToBasis100(parsedEnergy, basisValue)
      const sugarPerHundred = convertToBasis100(parsedSugar, basisValue)

      const updatedValues: Partial<Record<string, string>> = {
        productName: toStringValue(readValue('product_name', 'productName')),
        companyName: toStringValue(readValue('company_name', 'companyName')),
        manufacturerName: toStringValue(readValue('manufacturer_name', 'manufacturerName')),
        distributorName: toStringValue(readValue('distributor_name', 'distributorName')),
        totalContent: toStringValue(readValue('total_content', 'totalContent')),
        servingSize: toStringValue(readValue('serving_size_value', 'serving_size')),
        servingUnit: toStringValue(readValue('serving_size_unit', 'serving_unit')),
        nutritionBasisText: toStringValue(readValue('nutrition_basis_text', 'nutritionBasisText')),
        nutritionBasisValue: toStringValue(readValue('nutrition_basis_value', 'nutritionBasisValue')),
        nutritionBasisUnit: toStringValue(readValue('nutrition_basis_unit', 'nutritionBasisUnit')),
        energyKcal: toStringValue(energyPerHundred ?? parsedEnergy ?? readValue('energy_kcal', 'energyKcal')),
        carbohydrateG: toStringValue(readValue('carbohydrate_g', 'carbohydrateG')),
        proteinG: toStringValue(readValue('protein_g', 'proteinG')),
        fatG: toStringValue(readValue('fat_g', 'fatG')),
        saturatedFattyAcidsG: toStringValue(readValue('saturated_fatty_acids_g', 'saturatedFattyAcidsG')),
        transFattyAcidsG: toStringValue(readValue('trans_fatty_acids_g', 'transFattyAcidsG')),
        cholesterolMg: toStringValue(readValue('cholesterol_mg', 'cholesterolMg')),
        sodiumMg: toStringValue(readValue('sodium_mg', 'sodiumMg')),
        sugarG: toStringValue(sugarPerHundred ?? parsedSugar ?? readValue('sugar_g', 'sugarG')),
        sugarAlcoholG: toStringValue(readValue('sugar_alcohol_g', 'sugarAlcoholG')),
        alluloseG: toStringValue(readValue('allulose_g', 'alluloseG')),
        erythritolG: toStringValue(readValue('erythritol_g', 'erythritolG')),
        caffeineMg: toStringValue(readValue('caffeine_mg', 'caffeineMg')),
        taurineMg: toStringValue(readValue('taurine_mg', 'taurineMg')),
        otherNutrition: toStringValue(readValue('other_nutrition', 'otherNutrition')),
        ingredients: toStringValue(readValue('ingredients')),
        allergens: toStringValue(readValue('allergens')),
        crossContaminationWarning: toStringValue(
          readValue('cross_contamination_warning', 'crossContaminationWarning'),
        ),
        foodType: toStringValue(readValue('food_type', 'foodType')),
      }

      setFormValues((prev) => ({ ...prev, ...updatedValues }))
      const categorySelection = findCategorySelection(
        categoryTree,
        readValue('category_no', 'categoryNo'),
      )
      if (categorySelection) {
        setCategoryParentId(categorySelection.parentId)
        setCategoryId(categorySelection.childId)
      }
      setJsonError(null)
      const parsedFoodType = updatedValues.foodType?.trim()
      if (parsedFoodType) {
        setFoodTypeOptions((prev) =>
          prev.some((option) => option === parsedFoodType) ? prev : [...prev, parsedFoodType],
        )
      }
      const energyValue = parseNumber(updatedValues.energyKcal ?? '')
      const sugarValue = parseNumber(updatedValues.sugarG ?? '')
      const basisUnitValue =
        updatedValues.nutritionBasisUnit ?? toStringValue(readValue('nutrition_basis_unit', 'nutritionBasisUnit'))
      const autoFlags = calculateHealthFlags(energyValue, sugarValue, basisUnitValue)
      const hasAnyAutoFlag =
        autoFlags.isZeroCalorie ||
        autoFlags.isLowCalorie ||
        autoFlags.isZeroSugar ||
        autoFlags.isLowSugar
      if (!hasAnyAutoFlag) {
        window.alert('자동 분류된 건강 기준이 없습니다. 직접 체크해 주세요.')
      }
    } catch (error) {
      setJsonError('JSON 구문이 올바르지 않습니다.')
    }
  }, [jsonInput, categoryTree])

  const handleFoodTypeSuggestion = (value: string) => {
    setFormValues((prev) => ({ ...prev, foodType: value }))
  }

  const appendTextField = (formData: FormData, key: string, value: string) => {
    if (value && value.trim()) {
      formData.append(key, value.trim())
    }
  }

  const appendNumberField = (formData: FormData, key: string, rawValue: string) => {
    const parsed = parseNumber(rawValue)
    if (parsed !== null) {
      formData.append(key, String(parsed))
    }
  }

  const formatFileSize = (size?: number) => {
    if (!size) {
      return ''
    }
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`
    }
    return `${(size / 1024).toFixed(1)} KB`
  }

  const handleRemoveImage = useCallback(() => {
    updateImageFile(null)
  }, [updateImageFile])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const [file] = acceptedFiles
      if (!file) {
        return
      }
      updateImageFile(file)
    },
    [updateImageFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const pastedFile = getImageFileFromClipboard(event)
      if (pastedFile) {
        event.preventDefault()
        updateImageFile(pastedFile)
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [updateImageFile])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    if (submittingRef.current) {
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)
    setSuccessMessage(null)

    if (!formValues.productName.trim()) {
      alert('제품명을 입력해주세요.')
      submittingRef.current = false
      setIsSubmitting(false)
      return
    }

    if (!categoryId) {
      alert('카테고리를 선택해주세요.')
      submittingRef.current = false
      setIsSubmitting(false)
      return
    }

    if (!imageFile) {
      alert('대표 이미지를 등록해주세요.')
      submittingRef.current = false
      setIsSubmitting(false)
      return
    }

    const payload = new FormData()

    appendTextField(payload, 'productName', formValues.productName)
    appendTextField(payload, 'companyName', formValues.companyName)
    appendTextField(payload, 'manufacturerName', formValues.manufacturerName)
    appendTextField(payload, 'distributorName', formValues.distributorName)
    appendTextField(payload, 'totalContent', formValues.totalContent)
    appendTextField(payload, 'servingUnit', formValues.servingUnit)
    appendTextField(payload, 'nutritionBasisText', formValues.nutritionBasisText)
    appendTextField(payload, 'nutritionBasisUnit', formValues.nutritionBasisUnit)
    appendTextField(payload, 'otherNutrition', formValues.otherNutrition)
    appendTextField(payload, 'ingredients', formValues.ingredients)
    appendTextField(payload, 'allergens', formValues.allergens)
    appendTextField(payload, 'crossContaminationWarning', formValues.crossContaminationWarning)
    appendTextField(payload, 'foodType', formValues.foodType)

    NUMERIC_KEYS.forEach((key) => {
      appendNumberField(payload, key, formValues[key])
    })

    payload.append('categoryNo', categoryId)
    payload.append('isRenewal', String(isRenewal))

    ;(Object.keys(healthFlags) as HealthFlagKey[]).forEach((key) => {
      payload.append(key, String(healthFlags[key]))
    })

    payload.append('attachments', imageFile)

    try {
      const product = await createAdminProduct(payload)
      setSuccessMessage('제품이 등록되었습니다.')
      router.push(`/admin/products/${product.productNo}`)
      // 성공 이후에는 재전송 방지를 위해 submittingRef와 isSubmitting을 해제하지 않음
      // (페이지 이동으로 자연스럽게 폼이 떠나게 됨)
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : '제품 등록에 실패했습니다.'
      alert(message)
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {successMessage && <div className={styles.successBanner}>{successMessage}</div>}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>OCR JSON 자동 입력</h2>
          <p className={styles.sectionDescription}>
            OCR 처리 결과 JSON을 붙여넣고 “JSON 적용” 버튼을 누르면 자동으로 입력 필드가 채워집니다.
            키 순서는 상관없습니다.
          </p>
        </div>
        <textarea
          value={jsonInput}
          onChange={handleJsonInputChange}
          className={styles.jsonTextarea}
          placeholder="예: { ... JSON ... }"
          rows={8}
        />
        <div className={styles.jsonActions}>
          <span className={styles.jsonHelper}>추출된 OCR 결과를 한 번에 저장하고 싶은 경우에 활용하세요.</span>
          <button type="button" className={styles.secondaryButton} onClick={handleApplyJson}>
            JSON 적용
          </button>
        </div>
        {jsonError && <p className={styles.errorText}>{jsonError}</p>}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderTop}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
            <span className={styles.requiredNotice}>
              <span className={styles.requiredMark}>*</span>
              은 필수 입력 항목입니다.
            </span>
          </div>
          <p className={styles.sectionDescription}>제품명, 대표 이미지, 제조/유통사를 입력해주세요.</p>
        </div>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              제품명 <span className={styles.requiredMark}>*</span>
            </span>
            <input
              required
              name="productName"
              value={formValues.productName}
              onChange={handleInputChange}
              className={styles.textInput}
              placeholder="제품명을 입력하세요"
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>회사명</span>
            <input
              name="companyName"
              value={formValues.companyName}
              onChange={handleInputChange}
              className={styles.textInput}
              placeholder="판매 회사명을 입력하세요"
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>제조사</span>
            <input
              name="manufacturerName"
              value={formValues.manufacturerName}
              onChange={handleInputChange}
              className={styles.textInput}
              placeholder="제조사를 입력하세요"
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>유통사</span>
            <input
              name="distributorName"
              value={formValues.distributorName}
              onChange={handleInputChange}
              className={styles.textInput}
              placeholder="유통사를 입력하세요"
              autoComplete="off"
            />
          </label>
        </div>

        <div className={styles.categoryRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              상위 카테고리 <span className={styles.requiredMark}>*</span>
            </span>
            <div 
              ref={parentDropdownRef}
              className={`${styles.boxSelect} ${showParentDropdown ? styles.on : ''}`}
            >
              <button 
                type="button" 
                className={styles.selectDisplayField}
                onClick={() => setShowParentDropdown(!showParentDropdown)}
              >
                {categoryTree.find(group => String(group.parent.id) === categoryParentId)?.parent.name || '카테고리를 선택하세요'}
              </button>
              <div className={styles.selectArrowContainer} onClick={() => setShowParentDropdown(!showParentDropdown)}>
                <span className={styles.selectArrowIcon}></span>
              </div>
              <div className={styles.boxLayer}>
                <ul className={styles.listOptions}>
                  <li className={styles.listItem}>
                    <button
                      type="button"
                      className={`${styles.buttonOption} ${!categoryParentId ? styles.buttonOptionSelected : ''}`}
                      onClick={() => {
                        setCategoryParentId('')
                        setCategoryId('')
                        setShowParentDropdown(false)
                      }}
                    >
                      카테고리를 선택하세요
                    </button>
                  </li>
                  {categoryTree.map((group) => (
                    <li key={group.parent.id} className={styles.listItem}>
                      <button
                        type="button"
                        className={`${styles.buttonOption} ${String(group.parent.id) === categoryParentId ? styles.buttonOptionSelected : ''}`}
                        onClick={() => {
                          const value = String(group.parent.id)
                          setCategoryParentId(value)
                          setCategoryId(value) // 기본적으로 상위 ID를 선택
                          setShowParentDropdown(false)
                        }}
                      >
                        {group.parent.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              세부 카테고리 <span className={styles.requiredMark}>*</span>
            </span>
            <div 
              ref={childDropdownRef}
              className={`${styles.boxSelect} ${showChildDropdown ? styles.on : ''} ${(!categoryParentId || !canSelectChildCategory) ? styles.disabled : ''}`}
            >
              <button 
                type="button" 
                className={styles.selectDisplayField}
                onClick={() => categoryParentId && canSelectChildCategory && setShowChildDropdown(!showChildDropdown)}
                disabled={!categoryParentId || !canSelectChildCategory}
              >
                {childCategories.find(child => String(child.id) === categoryId)?.name || (String(selectedParentGroup?.parent.id) === categoryId ? `${selectedParentGroup?.parent.name} 전체` : childCategoryPlaceholder)}
              </button>
              <div className={styles.selectArrowContainer} onClick={() => categoryParentId && canSelectChildCategory && setShowChildDropdown(!showChildDropdown)}>
                <span className={styles.selectArrowIcon}></span>
              </div>
              <div className={styles.boxLayer}>
                <ul className={styles.listOptions}>
                  <li className={styles.listItem}>
                    <button
                      type="button"
                      className={`${styles.buttonOption} ${selectedParentGroup && String(selectedParentGroup.parent.id) === categoryId ? styles.buttonOptionSelected : ''}`}
                      onClick={() => {
                        if (selectedParentGroup) {
                          setCategoryId(String(selectedParentGroup.parent.id))
                        }
                        setShowChildDropdown(false)
                      }}
                    >
                      {selectedParentGroup ? `${selectedParentGroup.parent.name} 전체` : childCategoryPlaceholder}
                    </button>
                  </li>
                  {childCategories.map((child) => (
                    <li key={child.id} className={styles.listItem}>
                      <button
                        type="button"
                        className={`${styles.buttonOption} ${String(child.id) === categoryId ? styles.buttonOptionSelected : ''}`}
                        onClick={() => {
                          setCategoryId(String(child.id))
                          setShowChildDropdown(false)
                        }}
                      >
                        {child.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {categoryParentId && !canSelectChildCategory && (
              <span className={styles.helperText}>선택한 상위 카테고리에 세부 카테고리는 없습니다.</span>
            )}
          </label>
        </div>
        <p className={styles.categorySummary}>선택된 카테고리: {selectedCategoryLabel}</p>

        <div className={styles.imageDropzone}>
          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
            aria-label="제품 이미지 업로드"
          >
            <input {...getInputProps()} />
            <span className={styles.dropzoneTitle}>이미지를 끌어다 놓거나 클릭하여 업로드</span>
            <span className={styles.dropzoneHint}>JPG/PNG · 최대 5MB 권장</span>
          </div>
          <div className={styles.dropzoneFooter}>
            <span className={styles.helperText}>이미지는 제품 목록과 상세 페이지에서 함께 노출됩니다.</span>
            {imageFile && (
              <button type="button" className={styles.removeButton} onClick={handleRemoveImage}>
                이미지 삭제
              </button>
            )}
          </div>
        <p className={styles.pasteHint}>이미지 복사 후 현재 창에서 붙여넣기(Ctrl/Cmd + V)를 해도 업로드할 수 있습니다.</p>
          {resolvedImagePreview && (
            <div className={styles.previewContainer}>
              <div className={styles.previewBox}>
                <img src={resolvedImagePreview} alt="제품 이미지 미리보기" className={styles.imagePreview} />
              </div>
              <div className={styles.previewMeta}>
                <span className={styles.previewName}>{imageFile?.name ?? '업로드된 이미지'}</span>
                <span className={styles.previewSize}>{formatFileSize(imageFile?.size)}</span>
              </div>
            </div>
          )}
        </div>
        <p className={styles.imageRequiredNotice}>
          <span className={styles.requiredMark}>*</span>
          대표 이미지는 반드시 등록해야 합니다.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>용량 및 영양 기준</h2>
          <p className={styles.sectionDescription}>영양성분표에 표시되는 기준량을 입력해주세요.</p>
        </div>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>총 내용량</span>
            <input
              name="totalContent"
              value={formValues.totalContent}
              onChange={handleInputChange}
              className={styles.textInput}
              placeholder="예: 350mL"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>1회 제공량</span>
            <input
              name="servingSize"
              value={formValues.servingSize}
              onChange={handleInputChange}
              className={styles.numberInput}
              type="number"
              step="0.1"
              min="0"
              placeholder="숫자를 입력"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>용량 단위</span>
            <input
              name="servingUnit"
              value={formValues.servingUnit}
              onChange={handleInputChange}
              className={styles.textInput}
              placeholder="예: mL, g, 캡슐"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>영양 기준 텍스트</span>
            <input
              name="nutritionBasisText"
              value={formValues.nutritionBasisText}
              onChange={handleInputChange}
              className={styles.textInput}
              placeholder="예: 1회 제공량(350mL)"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>영양 기준량</span>
            <input
              name="nutritionBasisValue"
              value={formValues.nutritionBasisValue}
              onChange={handleInputChange}
              className={styles.numberInput}
              type="number"
              step="0.1"
              min="0"
              placeholder="숫자를 입력"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>영양 기준 단위</span>
            <input
              name="nutritionBasisUnit"
              value={formValues.nutritionBasisUnit}
              onChange={handleInputChange}
              className={styles.textInput}
              placeholder="예: mL, g"
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>영양성분</h2>
          <p className={styles.sectionDescription}>g, mg 단위로 입력해주세요. 필요 없는 항목은 비워두세요.</p>
        </div>
        <div className={styles.fieldGrid}>
          {NUMERIC_KEYS.filter((key) => !['servingSize', 'nutritionBasisValue'].includes(key)).map((key) => {
            const labelMap: Record<NumericKey, string> = {
              servingSize: '1회 제공량',
              nutritionBasisValue: '영양 기준량',
              energyKcal: '에너지 (kcal)',
              carbohydrateG: '탄수화물 (g)',
              proteinG: '단백질 (g)',
              fatG: '지방 (g)',
              saturatedFattyAcidsG: '포화지방 (g)',
              transFattyAcidsG: '트랜스지방 (g)',
              cholesterolMg: '콜레스테롤 (mg)',
              sodiumMg: '나트륨 (mg)',
              sugarG: '당류 (g)',
              sugarAlcoholG: '당알코올 (g)',
              alluloseG: '알룰로스 (g)',
              erythritolG: '에리스리톨 (g)',
              caffeineMg: '카페인 (mg)',
              taurineMg: '타우린 (mg)',
            }
            const placeholderMap: Partial<Record<NumericKey, string>> = {
              energyKcal: '예: 0, 5',
              sugarG: '예: 0, 3',
              sodiumMg: '예: 15',
              caffeineMg: '예: 30',
            }

            if (key === 'servingSize' || key === 'nutritionBasisValue') {
              return null
            }

            return (
              <label key={key} className={styles.field}>
                <span className={styles.fieldLabel}>{labelMap[key]}</span>
                <input
                  name={key}
                  value={formValues[key]}
                  onChange={handleInputChange}
                  className={styles.numberInput}
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder={placeholderMap[key] ?? '숫자를 입력'}
                />
              </label>
            )
          })}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>성분 및 주의사항</h2>
          <p className={styles.sectionDescription}>원재료, 알레르기 유발 성분, 기타 주의 사항을 입력해주세요.</p>
        </div>
        <div className={styles.fieldGrid}>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span className={styles.fieldLabel}>원재료</span>
            <textarea
              name="ingredients"
              value={formValues.ingredients}
              onChange={handleTextareaChange}
              className={styles.textArea}
              rows={4}
              placeholder="예: 정제수, 이산화탄소, 구연산..."
            />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span className={styles.fieldLabel}>알레르기</span>
            <textarea
              name="allergens"
              value={formValues.allergens}
              onChange={handleTextareaChange}
              className={styles.textArea}
              rows={3}
              placeholder="예: 우유, 대두 함유"
            />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span className={styles.fieldLabel}>교차 오염 주의</span>
            <textarea
              name="crossContaminationWarning"
              value={formValues.crossContaminationWarning}
              onChange={handleTextareaChange}
              className={styles.textArea}
              rows={3}
              placeholder="예: 견과류를 사용한 제조시설에서 함께 제조됩니다."
            />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span className={styles.fieldLabel}>기타 영양성분</span>
            <textarea
              name="otherNutrition"
              value={formValues.otherNutrition}
              onChange={handleTextareaChange}
              className={styles.textArea}
              rows={3}
              placeholder="기타 주요 성분을 자유롭게 입력하세요."
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>특성 및 건강 분류</h2>
          <p className={styles.sectionDescription}>자동 판단 결과를 확인하고 필요하면 수정하세요.</p>
        </div>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>식품 유형</span>
            <input
              name="foodType"
              value={formValues.foodType}
              onChange={handleInputChange}
              className={styles.textInput}
              placeholder="예: 탄산음료, 발효유"
            />
            <div className={styles.suggestionRow}>
              {foodTypeOptions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className={styles.suggestionButton}
                  onClick={() => handleFoodTypeSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </label>
          <label className={styles.checkboxField}>
            <input type="checkbox" checked={isRenewal} onChange={handleRenewalChange} />
            <span>리뉴얼 제품</span>
          </label>
        </div>

        <div className={styles.healthGrid}>
          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={healthFlags.isZeroCalorie}
              onChange={handleHealthFlagChange('isZeroCalorie')}
            />
            <div>
              <span>제로 칼로리</span>
              <p className={styles.helperText}>자동 기준: ≤ {ZERO_CALORIE_THRESHOLD} kcal</p>
            </div>
          </label>
          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={healthFlags.isLowCalorie}
              onChange={handleHealthFlagChange('isLowCalorie')}
            />
            <div>
              <span>저칼로리</span>
              <p className={styles.helperText}>
                자동 기준: 100g당 ≤ {LOW_CALORIE_THRESHOLD_G} kcal / 100ml당 ≤ {LOW_CALORIE_THRESHOLD_ML} kcal
              </p>
            </div>
          </label>
          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={healthFlags.isZeroSugar}
              onChange={handleHealthFlagChange('isZeroSugar')}
            />
            <div>
              <span>제로 슈가</span>
              <p className={styles.helperText}>자동 기준: 당류 = {ZERO_SUGAR_THRESHOLD} g</p>
            </div>
          </label>
          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={healthFlags.isLowSugar}
              onChange={handleHealthFlagChange('isLowSugar')}
            />
            <div>
              <span>저당</span>
              <p className={styles.helperText}>
                자동 기준: 100g당 ≤ {LOW_SUGAR_THRESHOLD_G} g / 100ml당 ≤ {LOW_SUGAR_THRESHOLD_ML} g
              </p>
            </div>
          </label>
        </div>
        <button type="button" className={styles.secondaryButton} onClick={handleHealthFlagsReset}>
          자동 판단 다시 적용
        </button>
      </section>

      <div className={styles.submitBar}>
        <div className={styles.helperText}>
          등록 후 상세 페이지에서 영양 성분을 다시 수정할 수 있습니다.
        </div>
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '제품 등록'}
        </button>
      </div>
    </form>
  )
}

