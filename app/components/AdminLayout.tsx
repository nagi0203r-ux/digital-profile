'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, User, Palette, Eye, LogOut, Share2, Images, KeyRound } from "lucide-react"
import { supabase } from "@/lib/supabase"

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/edit-profile", label: "プロフィール編集", icon: User },
  { href: "/edit-sns", label: "SNSリンク管理", icon: Share2 },
  { href: "/edit-content", label: "コンテンツ管理", icon: Images },
  { href: "/theme-settings", label: "デザイン設定", icon: Palette },
  { href: "/change-password", label: "パスワード変更", icon: KeyRound },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login")
      } else {
        setChecking(false)
      }
    })
  }, [router])

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* サイドバー（PC） */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed top-0 left-0 h-full z-20">
        <div className="px-6 py-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-lg font-semibold text-gray-900">
            Digital Profile
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm ${
                  isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                }`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-200 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            <Eye className="w-5 h-5" />
            公開ページを見る
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            ログアウト
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>

        {/* ボトムナビ（モバイル） */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
          <div className="grid grid-cols-7 h-16">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}>
                  <Icon className="w-4 h-4" />
                  <span className="truncate text-[9px] leading-tight px-0.5">{item.label.replace("プロフィール", "").replace("リンク", "").replace("管理", "").replace("設定", "").replace("変更", "")}</span>
                </Link>
              )
            })}
            <button onClick={handleLogout}
              className="flex flex-col items-center justify-center gap-0.5 text-xs text-red-400">
              <LogOut className="w-4 h-4" />
              <span className="text-[9px]">ログアウト</span>
            </button>
          </div>
        </nav>

        <div className="md:hidden h-16" />
      </div>
    </div>
  )
}
