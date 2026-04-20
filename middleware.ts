import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/edit-profile', '/edit-links', '/theme-settings']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some(path => pathname.startsWith(path))
  if (!isProtected) return NextResponse.next()

  // Supabaseのセッションクッキーを確認
  const cookies = request.cookies
  const hasSession = [...cookies.getAll()].some(c =>
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/edit-profile', '/edit-links', '/theme-settings'],
}
