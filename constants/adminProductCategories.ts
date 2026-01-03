import type { AdminProductCategoryGroup } from '@/types/adminCategoryTypes'

export const ADMIN_PRODUCT_CATEGORY_TREE: AdminProductCategoryGroup[] = [
  {
    parent: { id: 1, name: '음료' },
    children: [
      { id: 5, name: '탄산' },
      { id: 6, name: '주스' },
      { id: 7, name: '유제품' },
      { id: 8, name: '차' },
      { id: 9, name: '커피' },
      { id: 10, name: '에너지 드링크' },
      // { id: 11, name: '주류' },
      { id: 12, name: '음료 - 기타' },
    ],
  },
  {
    parent: { id: 2, name: '제과' },
    children: [
      { id: 13, name: '과자' },
      { id: 14, name: '사탕' },
      { id: 15, name: '젤리' },
      { id: 16, name: '초콜릿' },
      { id: 17, name: '시리얼' },
      { id: 18, name: '제과 - 기타' },
    ],
  },
  {
    parent: { id: 3, name: '아이스크림' },
    children: [],
  },
  {
    parent: { id: 4, name: '카페' },
    children: [
      { id: 19, name: '커피' },
      { id: 20, name: '라떼' },
      { id: 21, name: '티' },
      { id: 22, name: '음료' },
      { id: 23, name: '베이커리' },
      { id: 24, name: '디저트' },
      { id: 25, name: '카페 - 기타' },
    ],
  },
]

