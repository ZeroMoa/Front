import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchWithdrawSurveys } from '@/app/admin/store/api/withdrawSurveyApi'

export const useWithdrawSurveys = (params: URLSearchParams) => {
  const queryKey = useMemo(() => ['admin', 'withdrawSurveys', params.toString()], [params])
  return useQuery({
    queryKey,
    queryFn: () => fetchWithdrawSurveys(params),
    placeholderData: (previousData) => previousData,
  })
}

