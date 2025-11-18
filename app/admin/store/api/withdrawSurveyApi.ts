import { fetchWithAuth } from '@/lib/common/api/fetchWithAuth'
import { normalizeSurvey, type WithdrawSurvey } from '@/lib/utils/surveyUtils'
import { PageResponse } from '@/types/withdrawSurveyTypes'

export async function fetchWithdrawSurveys(params: URLSearchParams): Promise<PageResponse<WithdrawSurvey>> {
  const response = await fetchWithAuth(`/survey/withdraw?${params.toString()}`)
  const payload = await response.json()
  const content = Array.isArray(payload?.content) ? payload.content.map((item: any) => normalizeSurvey(item)) : []
  return {
    content,
    totalElements: payload?.totalElements ?? payload?.total_elements ?? 0,
    totalPages: payload?.totalPages ?? payload?.total_pages ?? 0,
    number: payload?.number ?? payload?.page ?? 0,
    size: payload?.size ?? payload?.pageSize ?? Number(params.get('size') ?? 0),
  }
}

