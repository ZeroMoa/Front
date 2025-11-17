import { notFound } from 'next/navigation'
import { fetchAdminProductDetail } from '@/app/admin/store/api/product'
import ProductDetailClient from './ProductDetailClient'

type PageParams = {
  productNo: string
}

export default async function AdminProductDetailPage({ params }: { params: PageParams }) {
  const productNo = Number(params.productNo)
  if (!Number.isFinite(productNo) || productNo <= 0) {
    notFound()
  }

  let product
  try {
    product = await fetchAdminProductDetail(productNo)
  } catch (error) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}

