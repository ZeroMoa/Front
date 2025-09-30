// (categories)/components/CategoryHeader.tsx
import styles from './CategoryHeader.module.css'

interface CategoryHeaderProps {
    title: string;
    totalItems: number;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    categories?: string[];  // optional로 변경
    selectedCategory?: string;  // optional로 변경
    onCategoryChange?: (category: string) => void;  // optional로 변경
}

export default function CategoryHeader({ 
    title, 
    totalItems, 
    pageSize,
    onPageSizeChange,
    categories = [],  // 기본값 설정
    selectedCategory,
    onCategoryChange
}: CategoryHeaderProps) {
    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <h3 className={styles.title}>
                     {title}
                </h3>
                <span className={styles.count}>총 {totalItems}개</span>
                <select 
                    className={styles.sortSelect}
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    <option value="30">30개</option>
                    <option value="60">60개</option>
                    <option value="90">90개</option>
                </select>
            </div>
            {/* categories가 있을 때만 카테고리 섹션 렌더링 */}
            {categories.length > 0 && onCategoryChange && (
                <div className={styles.categories}>
                    {categories.map((category) => (
                        <button 
                            key={category} 
                            className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
                            onClick={() => onCategoryChange(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}