'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

const themeOptions = [
  { id: "light", name: "ライト", description: "明るく清潔感のあるデザイン",
    preview: { bg: "bg-gray-50", card: "bg-white", primary: "bg-blue-600" } },
  { id: "dark", name: "ダーク", description: "洗練されたダークテーマ",
    preview: { bg: "bg-gray-900", card: "bg-gray-800", primary: "bg-cyan-500" } },
  { id: "lime", name: "黄緑", description: "フレッシュな黄緑背景",
    preview: { bg: "bg-gradient-to-br from-lime-300 to-emerald-100", card: "bg-white/80", primary: "bg-lime-500" } },
  { id: "yellow", name: "黄色", description: "明るくポップな黄色背景",
    preview: { bg: "bg-gradient-to-br from-yellow-300 to-amber-100", card: "bg-white/80", primary: "bg-yellow-500" } },
  { id: "orange", name: "オレンジ", description: "温かみのあるオレンジ背景",
    preview: { bg: "bg-gradient-to-br from-orange-300 to-amber-100", card: "bg-white/80", primary: "bg-orange-500" } },
  { id: "sky", name: "水色", description: "さわやかな水色背景",
    preview: { bg: "bg-gradient-to-br from-sky-300 to-blue-100", card: "bg-white/80", primary: "bg-sky-500" } },
  { id: "charcoal", name: "グレー", description: "シックな濃いめのグレー背景",
    preview: { bg: "bg-gradient-to-br from-gray-600 to-gray-500", card: "bg-gray-700", primary: "bg-gray-400" } },
]

const accentColors = [
  { id: "blue", name: "ブルー", color: "bg-blue-600" },
  { id: "cyan", name: "シアン", color: "bg-cyan-500" },
  { id: "green", name: "グリーン", color: "bg-green-600" },
  { id: "purple", name: "パープル", color: "bg-purple-600" },
  { id: "pink", name: "ピンク", color: "bg-pink-600" },
  { id: "orange", name: "オレンジ", color: "bg-orange-600" },
  { id: "white", name: "ホワイト", color: "bg-white border border-gray-300" },
  { id: "black", name: "ブラック", color: "bg-gray-900" },
  { id: "yellow", name: "イエロー", color: "bg-yellow-400" },
  { id: "lime", name: "黄緑", color: "bg-lime-500" },
  { id: "amber", name: "薄オレンジ", color: "bg-amber-400" },
  { id: "red", name: "レッド", color: "bg-red-600" },
]

export function ThemeSettings() {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState("light")
  const [selectedAccent, setSelectedAccent] = useState("blue")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('id, theme, accent_color').eq('user_id', user.id).single()
      if (data) {
        setProfileId(data.id)
        setSelectedTheme(data.theme)
        setSelectedAccent(data.accent_color)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)

    let error
    if (profileId) {
      const res = await supabase.from('profiles')
        .update({ theme: selectedTheme, accent_color: selectedAccent }).eq('id', profileId)
      error = res.error
    } else {
      const res = await supabase.from('profiles').insert({
        user_id: userId, theme: selectedTheme, accent_color: selectedAccent,
        name: '名前未設定', title: '', organization: '', location: '',
        bio: '', bio_align: 'center', phone: '', email: '',
      }).select().single()
      error = res.error
      if (res.data) setProfileId(res.data.id)
    }

    if (error) {
      console.error("theme save error:", error)
      toast.error("保存に失敗しました")
    } else {
      toast.success("デザインを保存しました ✓")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  const accentBg = accentColors.find(c => c.id === selectedAccent)?.color ?? "bg-blue-600"

  return (
    <AdminLayout>
      <div className="bg-white border-b border-gray-200 sticky top-14 md:top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl">デザイン設定</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-5 md:p-8 mb-6">
          <h2 className="mb-6">テーマ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themeOptions.map(theme => (
              <button key={theme.id} onClick={() => setSelectedTheme(theme.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                  selectedTheme === theme.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                {selectedTheme === theme.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`${theme.preview.bg} rounded-xl p-4 mb-3 h-32`}>
                  <div className={`${theme.preview.card} rounded-lg p-3 shadow-sm`}>
                    <div className={`h-2 ${theme.preview.primary} rounded-full w-3/4 mb-2`} />
                    <div className="h-1.5 bg-gray-300 rounded w-1/2" />
                  </div>
                </div>
                <div className="font-medium mb-1 text-gray-900">{theme.name}</div>
                <div className="text-sm text-gray-700">{theme.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-200 p-5 md:p-8 mb-6">
          <h2 className="mb-6">メインボタンカラー</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {accentColors.map(color => (
              <button key={color.id} onClick={() => setSelectedAccent(color.id)}
                className={`relative aspect-square rounded-2xl border-2 transition-all ${
                  selectedAccent === color.id ? 'border-gray-900 scale-95' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className={`w-full h-full ${color.color} rounded-xl`} />
                {selectedAccent === color.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-gray-900" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-200 p-5 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2>プレビュー</h2>
            {userId && (
              <Link href={`/p/${userId}`} target="_blank" className="text-sm text-blue-600 hover:text-blue-700">
                実際のページを見る
              </Link>
            )}
          </div>
          <div className="bg-gray-100 rounded-2xl p-8 flex justify-center">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
                <div className="h-4 bg-gray-900 rounded w-1/2 mx-auto mb-2" />
                <div className="h-3 bg-gray-400 rounded w-2/3 mx-auto mb-6" />
                <div className={`h-10 ${accentBg} rounded-lg mb-3`} />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-gray-200 rounded-lg" />
                  <div className="h-10 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 pt-4 pb-8">
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-2xl transition-colors shadow-lg">
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
