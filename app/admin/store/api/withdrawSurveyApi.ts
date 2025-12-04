import { fetchWithAuth } from '@/lib/common/api/fetchWithAuth'
import { normalizeSurvey, normalizeReasonCode, type WithdrawSurvey } from '@/lib/utils/surveyUtils'
import { type WithdrawSurveyPage, type WithdrawSurveyStatistics } from '@/types/withdrawSurveyTypes'

function parseReasonCounts(raw: unknown): Array<{ code: string; count: number }> {
  if (!raw) {
    return []
  }

  if (Array.isArray(raw)) {
    return raw
      .map((item: any) => {
        const codeSource = item?.code ?? item?.reasonCode ?? item?.reason_code ?? item
        const normalized = typeof codeSource === 'string' ? normalizeReasonCode(codeSource) : ''
        const countValue = Number(item?.count ?? item?.value ?? 0)
        return normalized ? { code: normalized, count: Number.isFinite(countValue) ? countValue : 0 } : null
      })
      .filter((entry): entry is { code: string; count: number } => Boolean(entry))
  }

  if (typeof raw === 'object') {
    return Object.entries(raw as Record<string, unknown>)
      .map(([code, count]) => {
        const normalized = normalizeReasonCode(code)
        const numericCount = Number(count)
        return normalized ? { code: normalized, count: Number.isFinite(numericCount) ? numericCount : 0 } : null
      })
      .filter((entry): entry is { code: string; count: number } => Boolean(entry))
  }

  return []
}

function normalizeStatistics(payload: any): WithdrawSurveyStatistics | undefined {
  const rawStats = payload?.statistics ?? payload?.stats ?? null
  const countsSource =
    rawStats?.reasonCounts ?? rawStats?.reason_counts ?? payload?.reasonCounts ?? payload?.reason_counts ?? null
  const reasonCounts = parseReasonCounts(countsSource).filter((item) => item.count > 0)

  const earliestCreatedDate =
    rawStats?.earliestCreatedDate ?? rawStats?.earliest_created_date ?? payload?.earliestCreatedDate ?? undefined
  const latestCreatedDate =
    rawStats?.latestCreatedDate ?? rawStats?.latest_created_date ?? payload?.latestCreatedDate ?? undefined

  if (reasonCounts.length === 0 && !earliestCreatedDate && !latestCreatedDate) {
    return undefined
  }

  return {
    reasonCounts,
    earliestCreatedDate: typeof earliestCreatedDate === 'string' ? earliestCreatedDate : undefined,
    latestCreatedDate: typeof latestCreatedDate === 'string' ? latestCreatedDate : undefined,
  }
}

export async function fetchWithdrawSurveys(params: URLSearchParams): Promise<WithdrawSurveyPage> {
  const response = await fetchWithAuth(`/survey/withdraw?${params.toString()}`)
  const payload = await response.json()
  const content = Array.isArray(payload?.content) ? payload.content.map((item: any) => normalizeSurvey(item)) : []
  const statistics = normalizeStatistics(payload)
  return {
    content,
    totalElements: payload?.totalElements ?? payload?.total_elements ?? 0,
    totalPages: payload?.totalPages ?? payload?.total_pages ?? 0,
    number: payload?.number ?? payload?.page ?? 0,
    size: payload?.size ?? payload?.pageSize ?? Number(params.get('size') ?? 0),
    statistics,
  }
}
