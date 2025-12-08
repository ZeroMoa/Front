import { useQuery } from '@tanstack/react-query'
import { getUserData } from '../store/api/userAuthApi'
import { UserResponseDTO } from '@/types/authTypes'

// 사용자 정보 조회 React Query hook
export const useUserData = () => {
    const shouldFetch = typeof window !== 'undefined'

    return useQuery<UserResponseDTO, Error>({
        queryKey: ['user'], // 캐시 키
        queryFn: getUserData, // API 호출 함수
        staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
        gcTime: 10 * 60 * 1000, // 10분 후 가비지 컬렉션
        retry: (failureCount, error) => {
            // 401, 403 에러는 재시도하지 않음 (인증 오류)
            if (error.message.includes('401') || error.message.includes('403')) {
                return false
            }
            return failureCount < 1 // 다른 에러는 1번만 재시도
        },
        refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 비활성화
        refetchOnMount: false, // 컴포넌트 마운트 시 재요청 비활성화 (캐시 우선)
        enabled: shouldFetch,
    })
}

// 로그인 상태 확인 hook
export const useIsLoggedIn = () => {
    const { data: userData, isLoading, error } = useUserData()
    
    return {
        isLoggedIn: !!userData && !error,
        userData,
        isLoading,
        error
    }
}
