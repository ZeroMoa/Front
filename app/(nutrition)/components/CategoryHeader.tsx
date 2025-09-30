// components/CategoryHeader.tsx
import styles from './CategoryHeader.module.css'
import Link from 'next/link'
import Image from 'next/image'

interface CategoryHeaderProps {
    title: string;
    totalItems: number;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    category: 'zero-calorie' | 'zero-sugar' | 'low-calorie' | 'low-sugar';
}

export default function CategoryHeader({ 
    title,
    totalItems, 
    pageSize,
    onPageSizeChange,
    category,
}: CategoryHeaderProps) {
    // 카테고리별 이미지 매핑
    const categoryImages = {
        'zero-sugar': '/images/zero_sugar.png',
        'low-sugar': '/images/low_sugar.png',
        'zero-calorie': '/images/zero_calorie.png',
        'low-calorie': '/images/low_calorie.png',
    };

    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <Link href={`/${category}`} className={styles.title}>
                    <Image 
                        src={categoryImages[category]}
                        alt={title}
                        width={100}
                        height={100}
                        className={styles.categoryIcon}
                    />
                    <h3>{title}</h3>
                </Link>
                <span className={styles.count}>총 {totalItems}개</span>
            </div>
            <div className={styles.rightSection}>
                <select 
                    className={styles.sortSelect}
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    <option value="30">30개씩 보기</option>
                    <option value="60">60개씩 보기</option>
                    <option value="90">90개씩 보기</option>
                </select>
            </div>
        </div>
    );
}