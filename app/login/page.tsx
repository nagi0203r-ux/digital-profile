'use client'

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15
const LOCKOUT_MS = LOCKOUT_MINUTES * 60 * 1000
const STORAGE_KEY = "login_attempts"

type AttemptData = { count: number; since: number; lockedUntil: number }

function getAttemptData(): AttemptData {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { count: 0, since: Date.now(), lockedUntil: 0 }
}

function saveAttemptData(data: AttemptData) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* ignore */ }
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/dashboard'
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [lockoutRemaining, setLockoutRemaining] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ロックアウトタイマーの管理
  useEffect(() => {
    const data = getAttemptData()
    const remaining = data.lockedUntil - Date.now()
    if (remaining > 0) startLockoutTimer(data.lockedUntil)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const startLockoutTimer = (lockedUntil: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockoutRemaining(0)
        clearInterval(timerRef.current!)
        const data = getAttemptData()
        saveAttemptData({ ...data, count: 0, lockedUntil: 0 })
      } else {
        setLockoutRemaining(remaining)
      }
    }, 1000)
  }

  const recordFailure = () => {
    const data = getAttemptData()
    const newCount = data.count + 1
    if (newCount >= MAX_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCKOUT_MS
      saveAttemptData({ count: newCount, since: data.since, lockedUntil })
      startLockoutTimer(lockedUntil)
    } else {
      saveAttemptData({ ...data, count: newCount })
    }
    return newCount
  }

  const recordSuccess = () => {
    saveAttemptData({ count: 0, since: Date.now(), lockedUntil: 0 })
  }

  const isLocked = lockoutRemaining > 0

  const formatRemaining = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}分${s}秒` : `${s}秒`
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    setError("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const count = recordFailure()
      if (count >= MAX_ATTEMPTS) {
        setError(`ログイン試行回数が上限に達しました。${LOCKOUT_MINUTES}分後に再試行してください。`)
      } else {
        setError(`メールアドレスまたはパスワードが正しくありません（残り${MAX_ATTEMPTS - count}回）`)
      }
      setLoading(false)
    } else {
      recordSuccess()
      router.push(redirectTo)
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

    if (data.user && !data.session) {
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
    <div className={`min-h-screen flex items-center justify-center px-4 ${redirectTo === '/admin' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-sm">
        {redirectTo === '/admin' ? (
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white">管理者ログイン</h1>
            <p className="text-sm text-gray-400 mt-2">ユーザー管理画面</p>
          </div>
        ) : (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">デジタル名刺</h1>
            <p className="text-sm text-gray-600 mt-2">入力画面へログイン</p>
          </div>
        )}

        {redirectTo !== '/admin' && (
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
        )}

        <div className={`rounded-3xl border-2 p-8 ${redirectTo === '/admin' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {isLocked ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">アカウントが一時ロックされました</p>
              <p className="text-xs text-gray-600 mb-4">不正なログイン試行を検出しました</p>
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700 font-medium">{formatRemaining(lockoutRemaining)} 後に再試行可能</p>
              </div>
            </div>
          ) : (
            <form onSubmit={mode === 'login' || redirectTo === '/admin' ? handleLogin : handleRegister} className="space-y-5">
              {mode === 'register' && redirectTo !== '/admin' && (
                <div>
                  <label className="block text-sm mb-2 text-gray-700">名前</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors text-gray-900 placeholder:text-gray-400"
                    placeholder="山田 太郎"
                    autoComplete="name"
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
                  autoComplete="email"
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
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginContent />
    </Suspense>
  )
}
