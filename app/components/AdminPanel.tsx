'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, ExternalLink, LogOut, UserPlus, Trash2, X } from "lucide-react"
import { supabase, type Profile } from "@/lib/supabase"

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "1026.yoneda@gmail.com"

function formatDate(iso?: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function AdminPanel() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState("")

  // ユーザー追加モーダル
  const [showAdd, setShowAdd] = useState(false)
  const [addEmail, setAddEmail] = useState("")
  const [addPassword, setAddPassword] = useState("")
  const [addName, setAddName] = useState("")
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState("")

  // 削除確認
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        router.replace("/login?redirect=/admin")
        return
      }
      await fetchProfiles()
      setLoading(false)
    }
    load()
  }, [router])

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, name, organization, title, email, created_at')
      .order('created_at', { ascending: false })
    if (data) setProfiles(data as Profile[])
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError("")
    setAdding(true)

    // 新規ユーザーをSupabaseに登録
    const { data, error } = await supabase.auth.signUp({
      email: addEmail,
      password: addPassword,
    })

    if (error) {
      setAddError("登録に失敗しました: " + error.message)
      setAdding(false)
      return
    }

    // プロフィールレコードを作成
    if (data.user) {
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        name: addName || "名前未設定",
        title: "", organization: "", location: "", bio: "",
        bio_align: "center", phone: "", email: addEmail,
        theme: "light", accent_color: "blue",
      })
    }

    await fetchProfiles()
    setShowAdd(false)
    setAddEmail("")
    setAddPassword("")
    setAddName("")
    setAdding(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)

    // リンクデータを削除
    await supabase.from('links').delete().eq('user_id', deleteTarget.user_id)
    // プロフィールを削除
    await supabase.from('profiles').delete().eq('id', deleteTarget.id)

    setProfiles(prev => prev.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
    setDeleting(false)
  }

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
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-gray-900 leading-tight">ユーザー管理</h1>
              <p className="text-xs text-gray-400 leading-tight">管理者専用</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-xl transition-colors">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">ユーザー追加</span>
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">

        {/* 集計カード */}
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
                <th className="w-12 px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                    登録ユーザーがいません
                  </td>
                </tr>
              )}
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
                      <ExternalLink className="w-3.5 h-3.5" />
                      表示
                    </a>
                  </td>
                  <td className="px-4 py-4">
                    <button onClick={() => setDeleteTarget(p)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
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
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">#{i + 1}</span>
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name || "—"}</p>
                  </div>
                  {p.email && <p className="text-xs text-gray-400 mt-0.5 truncate">{p.email}</p>}
                </div>
                <button onClick={() => setDeleteTarget(p)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {(p.organization || p.title) && (
                <div className="mb-2">
                  {p.organization && <p className="text-xs text-gray-600">{p.organization}</p>}
                  {p.title && <p className="text-xs text-gray-400">{p.title}</p>}
                </div>
              )}
              <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
                <p className="text-xs text-gray-400">{formatDate(p.created_at)}</p>
                <a href={`${origin}/p/${p.user_id}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                  <ExternalLink className="w-3 h-3" />
                  プレビュー
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━ ユーザー追加モーダル ━━━ */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">ユーザー追加</h2>
              <button onClick={() => { setShowAdd(false); setAddError("") }}
                className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">名前</label>
                <input type="text" value={addName}
                  onChange={e => setAddName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                  placeholder="山田 太郎" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">メールアドレス<span className="text-red-500 ml-1">*</span></label>
                <input type="email" value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                  placeholder="user@example.com" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">初期パスワード<span className="text-red-500 ml-1">*</span></label>
                <input type="password" value={addPassword}
                  onChange={e => setAddPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                  placeholder="6文字以上" required minLength={6} />
                <p className="text-xs text-gray-500 mt-1">ユーザーに別途パスワード変更を案内してください</p>
              </div>
              {addError && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{addError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={adding}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-2xl transition-colors">
                  {adding ? "追加中..." : "追加する"}
                </button>
                <button type="button" onClick={() => { setShowAdd(false); setAddError("") }}
                  className="flex-1 bg-white border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-2xl text-gray-700 transition-colors">
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ━━━ 削除確認モーダル ━━━ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">ユーザーを削除</h2>
            <p className="text-sm text-gray-600 text-center mb-1">
              <span className="font-medium text-gray-900">{deleteTarget.name || deleteTarget.email}</span>
            </p>
            <p className="text-xs text-gray-500 text-center mb-6">
              このユーザーのプロフィールとリンクデータが削除されます。この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-3 rounded-2xl transition-colors">
                {deleting ? "削除中..." : "削除する"}
              </button>
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-white border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-2xl text-gray-700 transition-colors">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
