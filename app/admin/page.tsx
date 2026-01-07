import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminIndexPage() {
  const cookieStore = await cookies()
  const hasRefreshToken = cookieStore.get('refreshToken')?.value

  if (!hasRefreshToken) {
    redirect('/admin/login')
  }

  redirect('/admin/users')
}

