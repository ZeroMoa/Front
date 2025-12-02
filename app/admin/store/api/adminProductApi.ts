'use client'

import { fetchWithAuth } from '@/lib/common/api/fetchWithAuth'
import { normalizeProduct, type Product } from '@/types/productTypes'

const ADMIN_PRODUCT_PATH = '/admin/products'

export async function fetchAdminProductDetail(productNo: number): Promise<Product> {
  const response = await fetchWithAuth(`${ADMIN_PRODUCT_PATH}/${productNo}`)
  const data = await response.json()
  return normalizeProduct(data)
}

export type AdminProductUpdatePayload = Partial<{
  totalContent: string
  servingSize: number | null
  servingUnit: string
  nutritionBasisText: string
  nutritionBasisValue: number | null
  nutritionBasisUnit: string
  energyKcal: number | null
  carbohydrateG: number | null
  proteinG: number | null
  fatG: number | null
  saturatedFattyAcidsG: number | null
  transFattyAcidsG: number | null
  cholesterolMg: number | null
  sodiumMg: number | null
  sugarG: number | null
  sugarAlcoholG: number | null
  alluloseG: number | null
  erythritolG: number | null
  caffeineMg: number | null
  taurineMg: number | null
  ingredients: string
  allergens: string
}>

export async function updateAdminProduct(productNo: number, payload: FormData): Promise<Product> {
  const response = await fetchWithAuth(`${ADMIN_PRODUCT_PATH}/${productNo}`, {
    method: 'PATCH',
    body: payload,
  })
  const data = await response.json()
  return normalizeProduct(data)
}

export async function deleteAdminProduct(productNo: number): Promise<void> {
  await fetchWithAuth(`${ADMIN_PRODUCT_PATH}/${productNo}`, {
    method: 'DELETE',
  })
}

export async function createAdminProduct(payload: FormData): Promise<Product> {
  const response = await fetchWithAuth(ADMIN_PRODUCT_PATH, {
    method: 'POST',
    body: payload,
  })
  const data = await response.json()
  return normalizeProduct(data)
}

