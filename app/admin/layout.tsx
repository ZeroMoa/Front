'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react'
import styles from './layout.module.css'
import { getCdnUrl } from '@/lib/cdn'
import Cookies from 'js-cookie'

type NavChildItem = {
  href: string
  label: string
  shortLabel?: string
}

type NavItem = {
  href?: string
  label: string
  icon: string
  children?: NavChildItem[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: '회원',
    icon: '/images/users_white.png',
    children: [
      { href: '/admin/users', label: '회원 조회', shortLabel: '조회' },
      { href: '/admin/users/manage', label: '회원 관리', shortLabel: '관리' },
    ],
  },
  {
    label: '제품',
    icon: '/images/product_white.png',
    children: [
      { href: '/admin/products', label: '제품 조회/삭제', shortLabel: '조회' },
      { href: '/admin/products/register', label: '제품 등록', shortLabel: '등록' },
    ],
  },
  { href: '/admin/boards', label: '게시판', icon: '/images/notice_white.png' },
  { href: '/admin/notifications', label: '알림', icon: '/images/bell_white.png' },
  { href: '/admin/survey/withdraw', label: '설문조사', icon: '/images/board_white.png' }
]

const HEADER_CARDS: Array<{
  title: string
  valueKey: 'pendingProducts' | 'registeredToday' | 'deletedToday'
  icon: string
  color: string
}> = [
  { title: '확인해야 할 제품', valueKey: 'pendingProducts', icon: '/images/check2.png', color: '#9DE5FC' },
  { title: '오늘 가입한 사람들', valueKey: 'registeredToday', icon: '/images/heart_plus.png', color: '#8EE7A2' },
  { title: '오늘 탈퇴한 사람들', valueKey: 'deletedToday', icon: '/images/heart_minus.png', color: '#FD9B9B' },
]

type AdminLayoutProps = {
  children: ReactNode
}

type AdminLayoutHeaderValues = {
  pendingProducts?: number | null
  registeredToday?: number | null
  deletedToday?: number | null
}

type AdminHeaderContextValue = {
  values: AdminLayoutHeaderValues
  setValues: (nextValues: Partial<AdminLayoutHeaderValues>) => void
}

const AdminHeaderContext = createContext<AdminHeaderContextValue | null>(null)

export function useAdminHeader() {
  const context = useContext(AdminHeaderContext)
  if (!context) {
    throw new Error('useAdminHeader 훅은 Admin 레이아웃 내부에서만 사용할 수 있습니다.')
  }
  return context
}

function hexToRgba(hex: string, alpha = 0.35) {
  const sanitized = hex.trim().replace('#', '')
  if (sanitized.length !== 6) {
    return `rgba(79, 124, 255, ${alpha})`
  }

  const r = Number.parseInt(sanitized.substring(0, 2), 16)
  const g = Number.parseInt(sanitized.substring(2, 4), 16)
  const b = Number.parseInt(sanitized.substring(4, 6), 16)

  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return `rgba(79, 124, 255, ${alpha})`
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const [headerValues, setHeaderValues] = useState<AdminLayoutHeaderValues>({
    pendingProducts: null,
    registeredToday: null,
    deletedToday: null,
  })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const parentWithChild = NAV_ITEMS.find((item) =>
      item.children?.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`))
    )
    if (parentWithChild) {
      setOpenMenu(parentWithChild.label)
    }
  }, [pathname])

  const updateHeaderValues = useCallback((nextValues: Partial<AdminLayoutHeaderValues>) => {
    setHeaderValues((prev) => ({
      ...prev,
      ...nextValues,
    }))
  }, [])

  const contextValue = useMemo<AdminHeaderContextValue>(
    () => ({
      values: headerValues,
      setValues: updateHeaderValues,
    }),
    [headerValues, updateHeaderValues]
  )

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev)
  }

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileMenuOpen])

  const handleLogout = useCallback(async () => {
    try {
      const xsrfToken = Cookies.get('XSRF-TOKEN')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
        credentials: 'include',
      })
      if (!response.ok) {
        let message = `로그아웃에 실패했습니다. (HTTP ${response.status})`
        try {
          const data = await response.json()
          if (data && typeof data.message === 'string') {
            message = data.message
          }
        } catch {
          // ignore
        }
        throw new Error(message)
      }
    } catch (logoutError) {
      console.error('Failed to logout admin:', logoutError)
      alert(logoutError instanceof Error ? logoutError.message : '로그아웃 중 오류가 발생했습니다.')
    } finally {
      setIsProfileMenuOpen(false)
      router.replace('/admin/login')
    }
  }, [router])

  const handleProfileToggle = () => {
    setIsProfileMenuOpen((prev) => !prev)
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <AdminHeaderContext.Provider value={contextValue}>
      <div className={`${styles.layout} ${isSidebarCollapsed ? styles.layoutCollapsed : ''}`}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarControlGroup}>
                <button
                  type="button"
                  className={styles.sidebarCollapseButton}
                  onClick={handleToggleSidebar}
                  aria-label={isSidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
                >
                  <Image
                    src={getCdnUrl(isSidebarCollapsed ? '/images/sidebar_open.png' : '/images/sidebar_close.png')}
                    alt={isSidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
                    width={35}
                    height={35}
                  />
                </button>
                <div className={styles.sidebarLogo}>
                  <div className={styles.sidebarLogoImageWrapper}>
                    <Image
                      src={getCdnUrl('/images/logo2.png')}
                      alt="제로모아"
                      fill
                      priority
                      sizes="(max-width: 1280px) 96px, 180px"
                      className={styles.sidebarLogoImage}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.sidebarLogoSmall}>
                <Image
                  src={getCdnUrl('/images/logo_small.png')}
                  alt="제로모아"
                  width={40}
                  height={40}
                  priority
                />
              </div>
            </div>
          </div>
          <div className={styles.sidebarBottom}>
            <nav className={styles.sidebarNav}>
              {NAV_ITEMS.map((item) => {
                const hasChildren = item.children && item.children.length > 0
                if (hasChildren) {
                  const activeChildHref =
                    item.children?.reduce<string | null>((match, child) => {
                      const childHref = child.href
                      const isChildMatch =
                        pathname === childHref || pathname.startsWith(`${childHref}/`)
                      if (!isChildMatch) {
                        return match
                      }
                      if (!match || childHref.length > match.length) {
                        return childHref
                      }
                      return match
                    }, null) ?? null
                  const isExpanded = openMenu === item.label
                  const isActive = Boolean(activeChildHref)
                  return (
                    <div key={item.label} className={`${styles.navGroup} ${isActive ? styles.navGroupActive : ''}`}>
                      <button
                        type="button"
                        className={`${styles.navItemButton} ${isActive ? styles.navItemActive : ''}`}
                        onClick={() => setOpenMenu((prev) => (prev === item.label ? null : item.label))}
                        aria-expanded={isExpanded}
                      >
                        <Image src={getCdnUrl(item.icon)} alt={item.label} width={35} height={35} />
                        <span>{item.label}</span>
                        <span
                          className={`${styles.navItemArrow} ${isExpanded ? styles.navItemArrowOpen : ''}`}
                          aria-hidden="true"
                        >
                          ▾
                        </span>
                      </button>
                      <div className={`${styles.navSubmenu} ${isExpanded ? styles.navSubmenuOpen : ''}`}>
                        {item.children!.map((child) => {
                          const childActive = activeChildHref === child.href
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`${styles.navSubmenuItem} ${
                                childActive ? styles.navSubmenuItemActive : ''
                              }`}
                            >
                              <span className={styles.navSubmenuText}>
                                <span className={styles.navSubmenuLabelFull}>{child.label}</span>
                                <span className={styles.navSubmenuLabelShort}>
                                  {child.shortLabel ?? child.label}
                                </span>
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                }

                if (!item.href) {
                  return null
                }

                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  >
                    <Image src={getCdnUrl(item.icon)} alt={item.label} width={35} height={35} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        <section className={styles.main}>
          <header className={styles.header}>
            <div className={styles.headerInner}>
              <div className={styles.headerCards}>
                {HEADER_CARDS.map(({ title, valueKey, icon, color }) => {
                  const value = headerValues[valueKey]
                  const displayValue =
                    typeof value === 'number' && !Number.isNaN(value) ? value.toLocaleString() : '—'
                  const circleShadow = hexToRgba(color, 0.32)
                  const valueColor = color
                  return (
                    <div key={valueKey} className={styles.headerCard}>
                      <div className={styles.cardColorBar} style={{ backgroundColor: color }} />
                      <div className={styles.cardBody}>
                        <div className={styles.cardTextGroup}>
                          <span className={styles.cardTitle}>{title}</span>
                          <span className={styles.cardValue} style={{ color: valueColor }}>
                            {displayValue}
                          </span>
                        </div>
                        <div
                          className={styles.cardCircle}
                          style={{ backgroundColor: color, boxShadow: `0 18px 28px ${circleShadow}` }}
                        >
                          <Image src={getCdnUrl(icon)} alt={title} width={40} height={40} className={styles.cardIcon} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className={styles.headerActions} ref={profileMenuRef}>
                <button
                  type="button"
                  className={styles.profileButton}
                  onClick={handleProfileToggle}
                  aria-label="관리자 메뉴 열기"
                >
                  <Image src={getCdnUrl('/images/profile.png')} alt="관리자" width={44} height={44} />
                </button>
                {isProfileMenuOpen && (
                  <div className={styles.profileMenu}>
                    <button type="button" className={styles.profileMenuItem} onClick={handleLogout}>
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className={styles.content}>{children}</div>
        </section>
      </div>
    </AdminHeaderContext.Provider>
  )
}