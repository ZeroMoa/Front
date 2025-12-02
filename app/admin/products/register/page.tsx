import ProductCreateClient from './ProductCreateClient'
import styles from './page.module.css'
import { ADMIN_PRODUCT_CATEGORY_TREE } from '@/constants/adminProductCategories'

export default function AdminProductCreatePage() {
  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>제품 등록</h1>
        </div>
      </header>
      <ProductCreateClient categoryTree={ADMIN_PRODUCT_CATEGORY_TREE} />
    </div>
  )
}

