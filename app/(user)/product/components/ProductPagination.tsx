'use client';

import Pagination from '@/components/pagination/Pagination';

interface ProductPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function ProductPagination({ currentPage, totalPages, onPageChange }: ProductPaginationProps) {
    return (
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageGroupSize={5}
        />
    );
}

