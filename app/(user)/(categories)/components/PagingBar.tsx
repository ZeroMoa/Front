'use client'
import styles from './PagingBar.module.css';

interface PagingBarProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export default function PagingBar({ 
    currentPage, 
    totalPages, 
    onPageChange,
    isLoading = false 
}: PagingBarProps) {
    const pageGroupSize = 5;
    const startPage = Math.floor(currentPage / pageGroupSize) * pageGroupSize;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages - 1);
    
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    if (isLoading || totalPages <= 1) return null;

    const handlePageChange = (page: number) => {
        onPageChange(page);
    };

    return (
        <ul className={styles.pagingUl}>
            <li>
                <button
                    className={`${styles.pagingBtn} ${styles.bdRadiusLeft} ${styles.btn} ${currentPage <= 0 ? styles.disabledBtn : ''}`}
                    disabled={currentPage <= 0}
                    onClick={() => handlePageChange(0)}
                >
                    {`<<`}
                </button>
            </li>
            <li>
                <button
                    className={`${styles.pagingBtn} ${styles.btn} ${currentPage <= 0 ? styles.disabledBtn : ''}`}
                    disabled={currentPage <= 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    &lt;
                </button>
            </li>
            {pageNumbers.map(num => (
                <li key={num}>
                    <button
                        className={`${styles.noPagingBtn} ${styles.btn} ${currentPage === num ? styles.currentPage : ''}`}
                        disabled={currentPage === num}
                        onClick={() => handlePageChange(num)}
                    >
                        {num + 1}
                    </button>
                </li>
            ))}
            <li>
                <button
                    className={`${styles.pagingBtn} ${styles.btn} ${currentPage >= totalPages - 1 ? styles.disabledBtn : ''}`}
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    &gt;
                </button>
            </li>
            <li>
                <button
                    className={`${styles.pagingBtn} ${styles.bdRadiusRight} ${styles.btn} ${currentPage >= totalPages - 1 ? styles.disabledBtn : ''}`}
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => handlePageChange(totalPages - 1)}
                >
                    &gt;&gt;
                </button>
            </li>
        </ul>
    );
}