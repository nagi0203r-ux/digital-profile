'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("メールアドレスまたはパスワードが正しくありません")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError("登録に失敗しました: " + error.message)
      setLoading(false)
      return
    }

    // メール確認が必要な場合（sessionがない）
    if (data.user && !data.session) {
      setError("")
      setLoading(false)
      alert("確認メールを送信しました。メールのリンクをクリックしてからログインしてください。")
      setMode('login')
      return
    }

    if (data.user && data.session) {
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        name: name || "名前未設定",
        title: "", organization: "", location: "", bio: "",
        bio_align: "center", phone: "", email: email,
        theme: "light", accent_color: "blue",
      })
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Digital Profile</h1>
          <p className="text-sm text-gray-900 mt-2">デジタル名刺を作成・管理する</p>
        </div>

        {/* タブ */}
        <div className="flex bg-gray-200 rounded-2xl p-1 mb-6">
          <button
            onClick={() => { setMode('login'); setError("") }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            ログイン
          </button>
          <button
            onClick={() => { setMode('register'); setError("") }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            新規登録
          </button>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8">
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-sm mb-2 text-gray-700">名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors text-gray-900 placeholder:text-gray-400"
                  placeholder="山田 太郎"
                />
              </div>
            )}
            <div>
              <label className="block text-sm mb-2 text-gray-700">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors text-gray-900 placeholder:text-gray-400"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors text-gray-900 placeholder:text-gray-400"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {mode === 'register' && (
                <p className="text-xs text-gray-700 mt-1">6文字以上</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-2xl transition-colors font-medium"
            >
              {loading ? "処理中..." : mode === 'login' ? "ログイン" : "登録して始める"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
