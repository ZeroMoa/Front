'use client'

import { useRouter } from 'next/navigation'
import { useTransition, type ComponentProps } from 'react'
import ProductPageClient from '@/app/(user)/product/components/ProductPageClient'
import { deleteAdminProduct } from '@/app/admin/store/api/product'
import type { Product } from '@/types/product'

type AdminProductPageClientProps = ComponentProps<typeof ProductPageClient>

export default function AdminProductPageClient(props: AdminProductPageClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

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

  return (
    <ProductPageClient
      {...props}
      productCardVariant="admin"
      onDeleteProduct={handleDelete}
      getProductHref={(product) => `/admin/products/${product.productNo}`}
    />
  )
}

