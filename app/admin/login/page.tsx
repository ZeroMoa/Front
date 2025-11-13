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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ADMIN_LOGIN_ENDPOINT) {
      setError('로그인 엔드포인트가 설정되지 않았습니다.')
      return
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
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!response.ok) {
        let message = `로그인에 실패했습니다. (HTTP ${response.status})`
        try {
          const result = await response.json()
          if (typeof result?.message === 'string') {
            message = result.message
          }
        } catch {
          // ignore json parse error
        }
        throw new Error(message)
      }

      setUsername('')
      setPassword('')
      router.push('/admin/users')
    } catch (loginError) {
      setError((loginError as Error).message ?? '로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Image src="/images/logo2.png" alt="제로모아" width={320} height={112} priority className={styles.logo} />
        <h1 className={styles.title}>관리자 로그인</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
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
                autoComplete="username"
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
                autoComplete="current-password"
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
