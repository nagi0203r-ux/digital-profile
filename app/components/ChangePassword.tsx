'use client'

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Lock } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

export function ChangePassword() {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSavingEmail(true)
    const { error } = await supabase.auth.updateUser({ email })
    if (error) {
      toast.error("変更に失敗しました: " + error.message)
    } else {
      toast.success("確認メールを送信しました。新しいメールアドレスのリンクをクリックして確認してください。")
      setEmail("")
    }
    setSavingEmail(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error("パスワードは6文字以上で入力してください")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("パスワードが一致しません")
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error("変更に失敗しました: " + error.message)
    } else {
      toast.success("パスワードを変更しました")
      setNewPassword("")
      setConfirmPassword("")
    }
    setSavingPassword(false)
  }

  return (
    <AdminLayout>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl">パスワード・メールアドレス変更</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* メールアドレス変更 */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <h2>メールアドレス変更</h2>
          </div>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">新しいメールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                placeholder="new@example.com"
                required
              />
            </div>
            <p className="text-xs text-gray-400">変更後、新しいメールアドレスに確認メールが届きます。</p>
            <button type="submit" disabled={savingEmail}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-2xl transition-colors">
              {savingEmail ? "処理中..." : "メールアドレスを変更"}
            </button>
          </form>
        </div>

        {/* パスワード変更 */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <h2>パスワード変更</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">新しいパスワード</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                placeholder="6文字以上"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">パスワード（確認）</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                placeholder="もう一度入力"
                minLength={6}
                required
              />
            </div>
            <button type="submit" disabled={savingPassword}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-3.5 rounded-2xl transition-colors">
              {savingPassword ? "処理中..." : "パスワードを変更"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
