'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import styles from './page.module.css';
import ProductGrid from '@/app/product/components/ProductGrid';
import ProductPagination from '@/app/product/components/ProductPagination';
import type { ProductResponse } from '@/types/product';

interface SearchResultsClientProps {
    keyword: string;
    data: ProductResponse;
    page: number;
    size: number;
}

export default function SearchResultsClient({ keyword, data, page, size }: SearchResultsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const totalPages = useMemo(() => data.totalPages ?? 0, [data.totalPages]);

    const handlePageChange = (nextPage: number) => {
        if (nextPage === page || nextPage < 0 || nextPage >= totalPages) {
            return;
        }

        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.set('q', keyword);
        nextParams.set('page', String(nextPage));

        if (size > 0) {
            nextParams.set('size', String(size));
        }

        startTransition(() => {
            router.replace(`${pathname}?${nextParams.toString()}`, { scroll: true });
        });
    };

    return (
        <div className={styles.body}>
            <ProductGrid products={data.content} />
            <ProductPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
    );
}
