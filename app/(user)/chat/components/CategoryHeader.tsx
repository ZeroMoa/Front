// components/CategoryHeader.tsx
'use client';

import { useState } from 'react';
import styles from './CategoryHeader.module.css'

interface CategoryHeaderProps {
    title: string;
    totalItems: number;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    onNutritionFilter: (type: string) => void;
}

const NUTRITION_TYPES = {
    'ALL': '전체',
    'ZERO_CALORIE': '제로칼로리',
    'LOW_CALORIE': '저칼로리',
    'ZERO_SUGAR': '무설탕',
    'LOW_SUGAR': '저당'
};

export default function CategoryHeader({ 
    title,
    totalItems, 
    pageSize,
    onPageSizeChange,
    onNutritionFilter,
}: CategoryHeaderProps) {
    const [selectedType, setSelectedType] = useState<string>('ALL');

    const handleNutritionSelect = (type: string) => {
        setSelectedType(type);
        onNutritionFilter(type);
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerTop}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>{title}</h1>
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
            <div className={styles.filterButtons}>
                {Object.entries(NUTRITION_TYPES).map(([type, label]) => (
                    <button
                        key={type}
                        className={`${styles.filterButton} ${selectedType === type ? styles.selected : ''}`}
                        onClick={() => handleNutritionSelect(type)}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}