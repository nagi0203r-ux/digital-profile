import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PROTECTED = ['/dashboard', '/edit-profile', '/edit-links', '/theme-settings']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some(path => pathname.startsWith(path))
  if (!isProtected) return NextResponse.next()

  // Supabaseのセッションクッキーを確認
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })

  const cookieHeader = request.headers.get('cookie') ?? ''
  const tokenMatch = cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/)
  const accessToken = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null

  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const parsed = JSON.parse(accessToken)
    const token = Array.isArray(parsed) ? parsed[0] : parsed
    const { data } = await supabase.auth.getUser(token)
    if (!data.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/edit-profile', '/edit-links', '/theme-settings'],
}
