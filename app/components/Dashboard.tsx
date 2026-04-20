'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { User, Edit, Share2, Images, Palette, Copy, Check, KeyRound, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

export function Dashboard() {
  const [profile, setProfile] = useState<{ name: string; title: string; organization: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [snsCount, setSnsCount] = useState(0)
  const [contentCount, setContentCount] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profileData } = await supabase
        .from('profiles').select('name, title, organization').eq('user_id', user.id).single()
      if (profileData) setProfile(profileData)

      const { count: sns } = await supabase
        .from('links').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'sns')
      setSnsCount(sns ?? 0)

      const { count: content } = await supabase
        .from('links').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'custom')
      setContentCount(content ?? 0)
    }
    load()
  }, [])

  const publicUrl = userId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${userId}`
    : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AdminLayout>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-2xl">ダッシュボード</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* プロフィールプレビューカード */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl">プロフィールプレビュー</h2>
            {userId && (
              <Link href={`/p/${userId}`} target="_blank"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <Eye className="w-5 h-5" />
                <span>表示</span>
              </Link>
            )}
          </div>

          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl mb-1">{profile?.name || "名前未設定"}</h3>
            {profile?.title && <p className="text-gray-500">{profile.title}</p>}
            {profile?.organization && <p className="text-sm text-gray-500">{profile.organization}</p>}
          </div>

          {userId && (
            <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3 mb-6">
              <span className="text-sm text-gray-500 flex-1 truncate">{publicUrl}</span>
              <button onClick={handleCopy}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 flex-shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "コピー済み" : "コピー"}
              </button>
            </div>
          )}

          <Link href="/edit-profile"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl transition-colors text-center">
            プロフィール編集
          </Link>
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/edit-profile" className="bg-white rounded-3xl border-2 border-gray-200 p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="mb-1">プロフィール編集</h3>
                <p className="text-sm text-gray-500">名前、肩書き、連絡先を編集</p>
              </div>
            </div>
          </Link>

          <Link href="/edit-sns" className="bg-white rounded-3xl border-2 border-gray-200 p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="mb-1">SNSリンク管理</h3>
                <p className="text-sm text-gray-500">{snsCount}件のSNSを設定中</p>
              </div>
            </div>
          </Link>

          <Link href="/edit-content" className="bg-white rounded-3xl border-2 border-gray-200 p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Images className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="mb-1">コンテンツ管理</h3>
                <p className="text-sm text-gray-500">{contentCount}件のコンテンツを掲載中</p>
              </div>
            </div>
          </Link>

          <Link href="/theme-settings" className="bg-white rounded-3xl border-2 border-gray-200 p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Palette className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="mb-1">デザイン設定</h3>
                <p className="text-sm text-gray-500">テーマとカラーを変更</p>
              </div>
            </div>
          </Link>

          <Link href="/change-password" className="bg-white rounded-3xl border-2 border-gray-200 p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="mb-1">パスワード・メールアドレス変更</h3>
                <p className="text-sm text-gray-500">ログイン情報の変更</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}
