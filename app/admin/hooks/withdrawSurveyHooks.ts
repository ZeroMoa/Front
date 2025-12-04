import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchWithdrawSurveys } from '@/app/admin/store/api/withdrawSurveyApi'
import type { WithdrawSurveyPage } from '@/types/withdrawSurveyTypes'

export const useWithdrawSurveys = (params: URLSearchParams) => {
  const queryKey = useMemo(() => ['admin', 'withdrawSurveys', params.toString()], [params])
  return useQuery<WithdrawSurveyPage>({
    queryKey,
    queryFn: () => fetchWithdrawSurveys(params),
    placeholderData: (previousData) => previousData,
  })
}
