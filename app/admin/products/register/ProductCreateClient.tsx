'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import styles from './page.module.css'
import { createAdminProduct } from '@/app/admin/store/api/adminProductApi'
import { getCdnUrl } from '@/lib/cdn'
import { createSafeImageFile } from '@/lib/utils/imageUtils'
import type { AdminProductCategoryGroup } from '@/types/adminCategoryTypes'

type HealthFlagKey = 'isZeroCalorie' | 'isLowCalorie' | 'isZeroSugar' | 'isLowSugar'

const ZERO_CALORIE_THRESHOLD = 4
const LOW_CALORIE_THRESHOLD = 40
const ZERO_SUGAR_THRESHOLD = 0
const LOW_SUGAR_THRESHOLD = 10

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

const FOOD_TYPE_SUGGESTIONS = ['탄산음료', '커피음료', '혼합음료', '제과류', '아이스크림', '건강기능식품'] as const

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

interface ProductCreateClientProps {
  categoryTree: AdminProductCategoryGroup[]
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

const calculateHealthFlags = (energy: number | null, sugar: number | null): Record<HealthFlagKey, boolean> => {
  const safeEnergy = energy ?? 0
  const safeSugar = sugar ?? 0

  return {
    isZeroCalorie: safeEnergy <= ZERO_CALORIE_THRESHOLD && safeEnergy >= 0,
    isLowCalorie: safeEnergy <= LOW_CALORIE_THRESHOLD && safeEnergy >= 0,
    isZeroSugar: safeSugar <= ZERO_SUGAR_THRESHOLD,
    isLowSugar: safeSugar <= LOW_SUGAR_THRESHOLD && safeSugar > ZERO_SUGAR_THRESHOLD,
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
    const auto = calculateHealthFlags(energy, sugar)
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

  const handleCategoryParentChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    const value = event.target.value
    setCategoryParentId(value)
    const group = categoryTree.find((item) => String(item.parent.id) === value)
    if (group) {
      setCategoryId(String(group.parent.id))
    } else {
      setCategoryId('')
    }
  }

  const handleCategoryChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setCategoryId(event.target.value)
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

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    setSuccessMessage(null)

    if (!formValues.productName.trim()) {
      alert('제품명을 입력해주세요.')
      return
    }

    if (!categoryId) {
      alert('카테고리를 선택해주세요.')
      return
    }

    if (!imageFile) {
      alert('대표 이미지를 등록해주세요.')
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
      setIsSubmitting(true)
      const product = await createAdminProduct(payload)
      setSuccessMessage('제품이 등록되었습니다.')
      router.push(`/admin/products/${product.productNo}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '제품 등록에 실패했습니다.'
      alert(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {successMessage && <div className={styles.successBanner}>{successMessage}</div>}

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
            <select
              value={categoryParentId}
              onChange={handleCategoryParentChange}
              className={styles.selectInput}
              required
            >
              <option value="">카테고리를 선택하세요</option>
              {categoryTree.map((group) => (
                <option key={group.parent.id} value={group.parent.id}>
                  {group.parent.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              세부 카테고리 <span className={styles.requiredMark}>*</span>
            </span>
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className={styles.selectInput}
              required
              disabled={!categoryParentId}
            >
              <option value="">{categoryParentId ? '세부 카테고리를 선택하세요' : '상위 카테고리를 먼저 선택하세요'}</option>
              {selectedParentGroup && (
                <option value={selectedParentGroup.parent.id}>{selectedParentGroup.parent.name} 전체</option>
              )}
              {childCategories.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
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
              {FOOD_TYPE_SUGGESTIONS.map((suggestion) => (
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
              <p className={styles.helperText}>자동 기준: ≤ {LOW_CALORIE_THRESHOLD} kcal</p>
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
              <p className={styles.helperText}>자동 기준: 당류 ≤ {LOW_SUGAR_THRESHOLD} g</p>
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

