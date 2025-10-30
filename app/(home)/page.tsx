'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './page.module.css'

export default function HomePage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/chat?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleTagClick = (query: string) => {
        router.push(`/chat?q=${encodeURIComponent(query)}`);
    };

    return (
        <main>
            <section className={styles.heroSection}>
                <h1 className={styles.heroTitle}>모든 저당, 저칼로리 식품을 한번에!</h1>
                <form onSubmit={handleSearch} className={styles.searchContainer}>
                    <input 
                        type="text" 
                        placeholder="건강하게 즐길 식품을 검색해보세요!" 
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className={styles.searchButton}>
                        <Image src="/images/search.png" alt="검색" width={20} height={20} />
                    </button>
                </form>
                <div className={styles.searchTags}>
                    <button 
                        className={styles.tag}
                        onClick={() => handleTagClick("주스")}
                    >
                        주스
                    </button>
                    <button 
                        className={styles.tag}
                        onClick={() => handleTagClick("젤리")}
                    >
                        젤리
                    </button>
                    <button 
                        className={styles.tag}
                        onClick={() => handleTagClick("단백질 바")}
                    >
                        단백질 바
                    </button>
                </div>
            </section>

            <section className={styles.features}>
                <Link href="/zero-calorie">
                    <div className={styles.featureItem}>
                        <Image 
                            src="/images/zero_calorie.png" 
                            alt="제로 칼로리" 
                            width={80} 
                            height={80}
                            className={styles.featureImage}
                        />
                        <div className={styles.featureText}>
                            <h3>제로 칼로리</h3>
                            <span>100g(ml)당 4kcal 미만</span>
                        </div>
                    </div>
                </Link>
                <Link href="/zero-sugar">
                    <div className={styles.featureItem}>
                        <Image 
                            src="/images/zero_sugar.png" 
                            alt="제로 슈가" 
                            width={80} 
                            height={80}
                            className={styles.featureImage}
                        />
                        <div className={styles.featureText}>
                            <h3>제로 슈가</h3>
                            <span>100g(ml)당 0.5g 미만</span>
                        </div>
                    </div>
                </Link>
                <Link href="/low-calorie">
                    <div className={styles.featureItem}>
                        <Image 
                            src="/images/low_calorie.png" 
                            alt="저칼로리" 
                            width={80} 
                            height={80}
                            className={styles.featureImage}
                        />
                        <div className={styles.featureText}>
                            <h3>저칼로리</h3>
                            <span>100g당 40kcal 미만</span>
                            <span>100ml당 20kcal 미만</span>
                        </div>
                    </div>
                </Link>
                <Link href="/low-sugar">
                    <div className={styles.featureItem}>
                        <Image 
                            src="/images/low_sugar.png" 
                            alt="저당 식품" 
                            width={80} 
                            height={80}
                            className={styles.featureImage}
                        />
                        <div className={styles.featureText}>
                            <h3>저당 식품</h3>
                            <span>100g당 5g 미만</span>
                            <span>100ml당 2.5g 미만</span>
                        </div>
                    </div>
                </Link>
            </section>
        </main>
    )
}