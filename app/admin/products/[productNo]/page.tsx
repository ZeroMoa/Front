import { notFound } from 'next/navigation'
import { fetchAdminProductDetailServer } from '@/app/admin/store/api/adminProductServerApi'
import ProductDetailClient from './ProductDetailClient'
import styles from './adminDetail.module.css'

type PageParams = {
  productNo: string
}

type HttpErrorLike = Error & { status?: number }

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { productNo: productNoParam } = await params
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
    return (
      <div className={styles.errorStateWrapper}>
        <div className={styles.errorStateCard}>
          <p className={styles.errorStateTitle}>서버와 통신하지 못했습니다.</p>
          <p className={styles.errorStateDescription}>다시 시도해주세요.</p>
          <a className={styles.errorStateLink} href="/admin/products">
            목록으로 돌아가기
          </a>
        </div>
      </div>
    )
  }

  return <ProductDetailClient product={product} />
}

