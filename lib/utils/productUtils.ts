import {
  PRODUCT_FILTER_KEYS,
  type ProductFilterKey,
} from '@/constants/adminProductConstants'

export type ProductSearchParams = Partial<Record<string, string | string[]>>

export const parseSingleValue = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value[0]
  }
  return value
}

export const parseNumberParam = (value: string | undefined, fallback: number, min = 0): number => {
  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed < min) {
    return fallback
  }
  return parsed
}

export const parseBooleanParam = (value: string | undefined): boolean | undefined => {
  if (value === undefined) return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

export const parseFilters = (
  searchParams: Record<string, string | string[] | undefined>
): Record<ProductFilterKey, boolean> =>
  PRODUCT_FILTER_KEYS.reduce<Record<ProductFilterKey, boolean>>((accumulator, key) => {
    const raw = parseSingleValue(searchParams[key])
    accumulator[key] = raw === 'true'
    return accumulator
  }, {} as Record<ProductFilterKey, boolean>)

export const getActiveFilters = (filters: Record<ProductFilterKey, boolean>) =>
  Object.entries(filters).reduce<Record<ProductFilterKey, boolean>>((acc, [filterKey, isActive]) => {
    if (isActive) {
      acc[filterKey as ProductFilterKey] = true
    }
    return acc
  }, {} as Record<ProductFilterKey, boolean>)

