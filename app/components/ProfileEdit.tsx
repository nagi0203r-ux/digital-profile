'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, User, Upload } from "lucide-react"
import { toast } from "sonner"
import { supabase, type Profile } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

export function ProfileEdit() {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    organization: "",
    location: "",
    bio: "",
    phone: "",
    email: "",
    bioAlign: "center" as "center" | "left",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('*').limit(1).single()
      if (data) {
        setProfileId(data.id)
        setFormData({
          name: data.name,
          title: data.title,
          organization: data.organization,
          location: data.location,
          bio: data.bio,
          phone: data.phone,
          email: data.email,
          bioAlign: data.bio_align,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileId) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      name: formData.name,
      title: formData.title,
      organization: formData.organization,
      location: formData.location,
      bio: formData.bio,
      bio_align: formData.bioAlign,
      phone: formData.phone,
      email: formData.email,
    }).eq('id', profileId)

    if (error) {
      toast.error("保存に失敗しました")
    } else {
      toast.success("プロフィールを保存しました")
    }
    setSaving(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

  return (
    <AdminLayout>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl">プロフィール編集</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-white rounded-3xl border-2 border-gray-200 p-8">
            <label className="block mb-6">プロフィール画像</label>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="w-16 h-16 text-white" />
              </div>
              <button type="button" className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:bg-gray-50 px-6 py-3 rounded-2xl transition-colors">
                <Upload className="w-5 h-5" />
                <span>画像をアップロード</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-gray-200 p-8">
            <h2 className="mb-6">基本情報</h2>
            <div className="space-y-5">
              {[
                { label: "名前", name: "name", placeholder: "山田 太郎" },
                { label: "肩書き", name: "title", placeholder: "Webデザイナー" },
                { label: "所属", name: "organization", placeholder: "株式会社サンプル" },
                { label: "場所", name: "location", placeholder: "東京都" },
              ].map(field => (
                <div key={field.name}>
                  <label className="block mb-2">{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name as keyof typeof formData] as string}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label>自己紹介</label>
                  <span className="text-sm text-gray-500">{formData.bio.length}/200文字</span>
                </div>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={200}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors resize-none"
                  placeholder="あなたについて簡単に紹介してください（最大200文字）"
                />
              </div>

              <div>
                <label className="block mb-2">自己紹介の配置</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["center", "left"] as const).map(align => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setFormData({ ...formData, bioAlign: align })}
                      className={`px-4 py-3 rounded-xl transition-colors border-2 ${
                        formData.bioAlign === align
                          ? "bg-blue-50 border-blue-600 text-blue-700"
                          : "bg-gray-50 border-transparent hover:border-gray-300"
                      }`}
                    >
                      {align === "center" ? "中央揃え" : "左詰め"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-gray-200 p-8">
            <h2 className="mb-6">連絡先情報</h2>
            <div className="space-y-5">
              <div>
                <label className="block mb-2">電話番号</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors"
                  placeholder="090-1234-5678" />
              </div>
              <div>
                <label className="block mb-2">メールアドレス</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors"
                  placeholder="yamada@example.com" />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 pt-4 pb-8">
            <button type="submit" disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-2xl transition-colors shadow-lg">
              {saving ? "保存中..." : "保存する"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
