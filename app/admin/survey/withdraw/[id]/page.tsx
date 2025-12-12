'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import styles from './page.module.css'
import type { WithdrawSurvey } from '@/types/withdrawSurveyTypes'
import { formatDateParts } from '@/lib/utils/surveyUtils'
import { REASON_LABEL_MAP } from '@/constants/withdrawSurveyConstants'

const DETAIL_CACHE_KEY = 'withdrawSurveyDetailCache'

function readCachedSurvey(id: number): WithdrawSurvey | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(DETAIL_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, WithdrawSurvey>
    return parsed[String(id)] ?? null
  } catch (error) {
    console.warn('설문조사 상세 캐시 읽기 실패', error)
    return null
  }
}

export default function WithdrawSurveyDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const surveyId = Number(params?.id ?? 0)
  const [survey, setSurvey] = useState<WithdrawSurvey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!surveyId) {
      setError('잘못된 설문조사 번호입니다.')
      setIsLoading(false)
      return
    }
    const cached = readCachedSurvey(surveyId)
    if (cached) {
      setSurvey(cached)
      setError(null)
    } else {
      setSurvey(null)
      setError('설문조사 정보를 찾을 수 없습니다. 목록에서 다시 선택해 주세요.')
    }
    setIsLoading(false)
  }, [surveyId])

  const formattedCreated = survey?.createdDate ? formatDateParts(survey.createdDate) : null

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>설문조사 상세</h1>
          {survey && <span className={styles.meta}>#{survey.displayIndex}</span>}
        </div>
        <button type="button" className={styles.backButton} onClick={() => router.push('/admin/survey/withdraw')}>
          목록으로
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>설문조사를 불러오는 중입니다…</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : survey ? (
        <div className={styles.card}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>회원명</span>
              <span className={styles.infoValue}>{survey.username || '—'}</span>
              <span className={styles.meta}>ID: {survey.userId || '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>작성일</span>
              {formattedCreated ? (
                <div className={styles.dateCell}>
                  <span className={styles.dateLine}>{formattedCreated.dateLine}</span>
                  <span className={styles.timeLine}>{formattedCreated.timeLine}</span>
                </div>
              ) : (
                <span className={styles.infoValue}>—</span>
              )}
            </div>
          </div>

          <div>
            <div className={styles.reasonTitle}>이유 코드</div>
            {survey.reasonCodes.length > 0 ? (
              <div className={styles.reasonTags}>
                {survey.reasonCodes.map((code) => {
                  const label = REASON_LABEL_MAP[code] ?? code
                  return (
                    <span key={code} className={styles.reasonTag}>
                      {label}
                    </span>
                  )
                })}
              </div>
            ) : (
              <span className={styles.meta}>선택된 이유 코드가 없습니다.</span>
            )}
          </div>

          <div>
            <div className={styles.reasonTitle}>추가 의견</div>
            <div className={styles.commentBox}>
              {survey.reasonComment ? survey.reasonComment : <span className={styles.emptyComment}>입력된 내용이 없습니다.</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.errorState}>설문조사 정보를 찾을 수 없습니다.</div>
      )}
    </div>
  )
}

