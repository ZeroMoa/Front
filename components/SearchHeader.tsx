// components/Header.tsx
'use client'

import Image from 'next/image'
import styles from './SearchHeader.module.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchHeader() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className={styles.header}>
            <nav className={styles.navbar}>
                <form onSubmit={handleSearch} className={styles.searchContainer}>
                    <input 
                        type="text" 
                        placeholder="저당, 저칼로리 식품을 검색해보세요!" 
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className={styles.searchButton}>
                        <Image 
                            src="/images/search.png" 
                            alt="검색" 
                            width={20} 
                            height={20} 
                        />
                    </button>
                </form>
            </nav>
        </header>
    )
}