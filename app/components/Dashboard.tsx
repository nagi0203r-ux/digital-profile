'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { User, Edit, Link as LinkIcon, QrCode, Eye, Palette, Copy, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

export function Dashboard() {
  const [profile, setProfile] = useState<{ name: string; title: string; organization: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [linksCount, setLinksCount] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles').select('name, title, organization').eq('user_id', user.id).single()
      if (profile) setProfile(profile)

      const { count } = await supabase
        .from('links').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      setLinksCount(count ?? 0)
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

          {/* 公開URL */}
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

          <div className="flex gap-3">
            <Link href="/edit-profile"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl transition-colors text-center">
              プロフィール編集
            </Link>
            <Link href="/edit-links"
              className="flex-1 bg-white border-2 border-gray-200 hover:bg-gray-50 py-4 rounded-2xl transition-colors text-center">
              リンク管理
            </Link>
          </div>
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

          <Link href="/edit-links" className="bg-white rounded-3xl border-2 border-gray-200 p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="mb-1">リンク管理</h3>
                <p className="text-sm text-gray-500">{linksCount}個のリンクを管理</p>
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

          <div className="bg-white rounded-3xl border-2 border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="mb-1">QRコード</h3>
                <p className="text-sm text-gray-500">準備中</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
