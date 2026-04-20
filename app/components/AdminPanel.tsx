'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, ExternalLink, LogOut, Eye } from "lucide-react"
import { supabase, type Profile } from "@/lib/supabase"

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

function formatDate(iso?: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function AdminPanel() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()

      // 管理者以外はログイン画面へ
      if (!user || user.email !== ADMIN_EMAIL) {
        router.replace("/login")
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, name, organization, title, email, created_at')
        .order('created_at', { ascending: false })

      if (!error && data) setProfiles(data as Profile[])
      setLoading(false)
    }
    load()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">ユーザー管理</h1>
              <p className="text-xs text-gray-500 leading-tight">管理者専用画面</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">入力画面へ</span>
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">

        {/* 集計 */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 px-6 py-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
            <p className="text-sm text-gray-500">登録ユーザー数</p>
          </div>
        </div>

        {/* PC：テーブル */}
        <div className="hidden md:block bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 w-8">No.</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">名前</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">会社名 / 肩書き</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">登録日時</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">プレビュー</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{p.name || "—"}</p>
                    {p.email && <p className="text-xs text-gray-400 mt-0.5">{p.email}</p>}
                  </td>
                  <td className="px-5 py-4">
                    {p.organization && <p className="text-sm text-gray-700">{p.organization}</p>}
                    {p.title && <p className="text-xs text-gray-500 mt-0.5">{p.title}</p>}
                    {!p.organization && !p.title && <span className="text-sm text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <a href={`${origin}/p/${p.user_id}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline">
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>表示</span>
                    </a>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                    登録ユーザーがいません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* モバイル：カード */}
        <div className="md:hidden space-y-3">
          {profiles.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">登録ユーザーがいません</div>
          )}
          {profiles.map((p, i) => (
            <div key={p.id} className="bg-white rounded-2xl border-2 border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-400 flex-shrink-0">#{i + 1}</span>
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name || "—"}</p>
                </div>
                <a href={`${origin}/p/${p.user_id}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 flex-shrink-0 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                  <ExternalLink className="w-3 h-3" />
                  プレビュー
                </a>
              </div>
              {(p.organization || p.title) && (
                <div className="mb-2">
                  {p.organization && <p className="text-xs text-gray-600">{p.organization}</p>}
                  {p.title && <p className="text-xs text-gray-400">{p.title}</p>}
                </div>
              )}
              {p.email && <p className="text-xs text-gray-400 mb-2">{p.email}</p>}
              <p className="text-xs text-gray-400 border-t border-gray-100 pt-2 mt-2">
                登録日時：{formatDate(p.created_at)}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
