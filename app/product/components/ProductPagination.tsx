'use client';

import styles from '../page.module.css';

const PAGE_GROUP_SIZE = 5;

interface ProductPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function ProductPagination({
    currentPage,
    totalPages,
    onPageChange,
}: ProductPaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const currentGroup = Math.floor(currentPage / PAGE_GROUP_SIZE);
    const startPage = currentGroup * PAGE_GROUP_SIZE;
    const endPage = Math.min(totalPages - 1, startPage + PAGE_GROUP_SIZE - 1);
    const pages = [];

    for (let index = startPage; index <= endPage; index += 1) {
        pages.push(index);
    }

    const goToPage = (page: number) => {
        if (page < 0 || page > totalPages - 1 || page === currentPage) {
            return;
        }
        onPageChange(page);
    };

    return (
        <nav className={styles.pagination} aria-label="제품 목록 페이지네이션">
            <button
                type="button"
                className={`${styles.pageArrow} ${styles.firstArrow}`}
                onClick={() => goToPage(0)}
                disabled={currentPage === 0}
            >
                <span className={styles.visuallyHidden}>첫 페이지</span>
            </button>
            <button
                type="button"
                className={`${styles.pageArrow} ${styles.prevArrow}`}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
            >
                <span className={styles.visuallyHidden}>이전 페이지</span>
            </button>
            <div className={styles.pageNumberGroup}>
                {pages.map((page) => (
                    <button
                        key={page}
                        type="button"
                        className={`${styles.pageButton} ${
                            page === currentPage ? styles.pageButtonActive : ''
                        }`}
                        onClick={() => goToPage(page)}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page + 1}
                    </button>
                ))}
            </div>
            <button
                type="button"
                className={`${styles.pageArrow} ${styles.nextArrow}`}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
            >
                <span className={styles.visuallyHidden}>다음 페이지</span>
            </button>
            <button
                type="button"
                className={`${styles.pageArrow} ${styles.lastArrow}`}
                onClick={() => goToPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
            >
                <span className={styles.visuallyHidden}>마지막 페이지</span>
            </button>
        </nav>
    );
}

