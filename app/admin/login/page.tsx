'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const ADMIN_LOGIN_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? ''}/login`

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setErrorAndClose = (message: string) => {
    setError(message)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const usernameInput = form.elements.namedItem('username') as HTMLInputElement | null
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement | null
    const resolvedUsername = (usernameInput?.value ?? '').trim()
    const resolvedPassword = passwordInput?.value ?? ''

    if (!resolvedUsername || resolvedPassword.length === 0) {
      setError('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }
    setUsername(resolvedUsername)
    setPassword(resolvedPassword)
    if (!ADMIN_LOGIN_ENDPOINT) {
      setError('로그인 엔드포인트가 설정되지 않았습니다.')
      return
    }

    const payload = {
      username: resolvedUsername,
      password: resolvedPassword,
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(ADMIN_LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = `로그인에 실패했습니다. (HTTP ${response.status})`
        try {
          const result = await response.json()
          if (typeof result?.message === 'string') {
            message = result.message
          }
        } catch {
          // ignore
        }
        setErrorAndClose(message)
        return
      }

      const meResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? ''}/user/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!meResponse.ok) {
        setErrorAndClose('어드민 계정이 아닙니다.')
        return
      }

      const meData = await meResponse.json()
      const normalizedRole = typeof meData?.roleType === 'string' ? meData.roleType.toUpperCase() : ''
      if (normalizedRole !== 'ADMIN' && normalizedRole !== 'ROLE_ADMIN') {
        setErrorAndClose('어드민 계정이 아닙니다.')
        return
      }

      setUsername('')
      setPassword('')
      router.push('/admin/users')
    } catch (loginError) {
      if (loginError instanceof Error && loginError.message && loginError.message.includes('Failed to fetch')) {
        setError('서버와 연결이 끊겼습니다. 다시 시도해주세요.')
      } else {
        const fallbackMessage = (loginError as Error).message ?? '로그인 중 오류가 발생했습니다.'
        setErrorAndClose(fallbackMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingContent}>로그인 중...</div>
          </div>
        )}
        <Image src="/images/logo2.png" alt="제로모아" width={320} height={112} priority className={styles.logo} />
        <h1 className={styles.title}>관리자 로그인</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.form} method="post" action="#" autoComplete="off" onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="admin-username">아이디</label>
            <div className={styles.inputFieldWrapper}>
              <input
                id="admin-username"
                name="username"
                type="text"
                className={styles.inputField}
                placeholder="관리자 아이디를 입력하세요"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="admin-password">비밀번호</label>
            <div className={styles.inputFieldWrapper}>
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.inputField}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="off"
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
              >
                <Image
                  src={showPassword ? '/images/open_eye.png' : '/images/closed_eye.png'}
                  alt={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                  width={22}
                  height={22}
                />
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? '로그인 중…' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
