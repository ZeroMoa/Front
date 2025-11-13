import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default function AdminIndexPage() {
  const cookieStore = cookies()
  const hasRefreshToken = cookieStore.get('refreshToken')?.value

  if (!hasRefreshToken) {
    redirect('/admin/login')
  }

  redirect('/admin/users')
}

