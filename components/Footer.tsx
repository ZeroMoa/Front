'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="siteFooter__copy">© 2026 ZeroMoa. All rights reserved.</div>
      <div className="siteFooter__links">
        <Link href="/privacy">개인정보처리방침</Link>
      </div>
      <div className="siteFooter__credit">
        이미지·아이콘 출처:&nbsp;
        <Link href="https://www.freepik.com/" target="_blank" rel="noreferrer">
          Freepik
        </Link>
        ,&nbsp;
        <Link href="https://www.flaticon.com/kr/" target="_blank" rel="noreferrer">
          Flaticon
        </Link>
      </div>
    </footer>
  )
}
