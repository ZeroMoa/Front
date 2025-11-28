import { notFound } from 'next/navigation'
import { fetchAdminProductDetailServer } from '@/app/admin/store/api/adminProductServerApi'
import ProductDetailClient from './ProductDetailClient'

type PageParams = {
  productNo: string
}

type Awaitable<T> = T | Promise<T>

type HttpErrorLike = Error & { status?: number }

export default async function AdminProductDetailPage({ params }: { params: Awaitable<PageParams> }) {
  const { productNo: productNoParam } = await Promise.resolve(params)
  const productNo = Number(productNoParam)
  if (!Number.isFinite(productNo) || productNo <= 0) {
    notFound()
  }

  let product
  try {
    product = await fetchAdminProductDetailServer(productNo)
  } catch (error) {
    const status = (error as HttpErrorLike | null)?.status
    if (status === 404) {
      notFound()
    }
    throw error
  }

  return <ProductDetailClient product={product} />
}

