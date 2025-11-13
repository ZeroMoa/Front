'use client'

import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { store } from './(user)/store/slices/store'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
    // QueryClient를 useState로 생성하여 리렌더링 시 재생성 방지
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
                gcTime: 10 * 60 * 1000, // 10분 후 가비지 컬렉션
                retry: 1, // 실패 시 1번만 재시도
                refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 비활성화
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                {children}
            </Provider>
        </QueryClientProvider>
    )
} 