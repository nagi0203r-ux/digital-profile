'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, User, Palette, Eye, LogOut,
  Share2, Images, KeyRound, Menu, X,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

const navItems = [
  { href: "/dashboard",       label: "ダッシュボード",   icon: LayoutDashboard },
  { href: "/edit-profile",    label: "プロフィール編集", icon: User },
  { href: "/edit-sns",        label: "SNSリンク管理",    icon: Share2 },
  { href: "/edit-content",    label: "コンテンツ管理",   icon: Images },
  { href: "/theme-settings",  label: "デザイン設定",     icon: Palette },
  { href: "/change-password", label: "パスワード変更",   icon: KeyRound },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [publicUrl, setPublicUrl] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login")
      } else {
        setChecking(false)
        setPublicUrl(`/p/${session.user.id}`)
      }
    })
  }, [router])

  // ページ遷移時にドロワーを閉じる
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const NavLinks = () => (
    <>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors text-sm font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-900 hover:bg-gray-100"
              }`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-200 space-y-1">
        <Link href={publicUrl} target="_blank"
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors">
          <Eye className="w-5 h-5" />
          公開ページを見る
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5" />
          ログアウト
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ━━━ PC：固定サイドバー ━━━ */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed top-0 left-0 h-full z-20">
        <div className="px-6 py-6 border-b border-gray-200 flex-shrink-0">
          <Link href="/dashboard" className="text-lg font-semibold text-gray-900">
            Digital Profile
          </Link>
        </div>
        <NavLinks />
      </aside>

      {/* ━━━ モバイル：固定トップヘッダー ━━━ */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
        <Link href="/dashboard" className="text-base font-semibold text-gray-900">
          Digital Profile
        </Link>
        <button
          onClick={() => setDrawerOpen(v => !v)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-900"
          aria-label="メニュー">
          {drawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* ━━━ モバイル：ドロワーオーバーレイ ━━━ */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-20" onClick={() => setDrawerOpen(false)}>
          {/* 背景暗転 */}
          <div className="absolute inset-0 bg-black/40" />
          {/* ドロワー本体 */}
          <aside
            className="absolute top-14 left-0 bottom-0 w-72 bg-white flex flex-col shadow-xl"
            onClick={e => e.stopPropagation()}>
            <NavLinks />
          </aside>
        </div>
      )}

      {/* ━━━ メインコンテンツ ━━━ */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* モバイル：ヘッダー分の余白 */}
        <div className="md:hidden h-14 flex-shrink-0" />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
