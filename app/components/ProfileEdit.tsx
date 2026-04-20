'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, User, Upload, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

export function ProfileEdit() {
  const [userId, setUserId] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    name: "", organization: "", title: "", location: "",
    bio: "", phone: "", email: "", bioAlign: "center" as "center" | "left",
  })
  const [showPhone, setShowPhone] = useState(true)
  const [showEmail, setShowEmail] = useState(true)
  const [showSaveContact, setShowSaveContact] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if (data) {
        setProfileId(data.id)
        setAvatarUrl(data.avatar_url ?? "")
        setShowPhone(data.show_phone ?? true)
        setShowEmail(data.show_email ?? true)
        setShowSaveContact(data.show_save_contact ?? true)
        setFormData({
          name: data.name ?? "", organization: data.organization ?? "",
          title: data.title ?? "", location: data.location ?? "",
          bio: data.bio ?? "", phone: data.phone ?? "",
          email: data.email ?? "", bioAlign: data.bio_align ?? "center",
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    if (!file.type.startsWith('image/')) {
      toast.error("画像ファイルを選択してください")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください")
      return
    }

    setUploadingAvatar(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      console.error("avatar upload error:", uploadError)
      toast.error("アップロードに失敗しました: " + uploadError.message)
      setUploadingAvatar(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const urlWithCache = `${publicUrl}?t=${Date.now()}`

    const { error: updateError } = await supabase.from('profiles')
      .update({ avatar_url: urlWithCache })
      .eq('user_id', userId)

    if (updateError) {
      toast.error("画像URLの保存に失敗しました")
    } else {
      setAvatarUrl(urlWithCache)
      toast.success("プロフィール画像を更新しました ✓")
    }
    setUploadingAvatar(false)
    // ファイル入力をリセット（同じファイルを再選択できるように）
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleAvatarDelete = async () => {
    if (!userId) return
    await supabase.from('profiles').update({ avatar_url: "" }).eq('user_id', userId)
    setAvatarUrl("")
    toast.success("プロフィール画像を削除しました")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)

    const payload = {
      name: formData.name, organization: formData.organization,
      title: formData.title, location: formData.location,
      bio: formData.bio, bio_align: formData.bioAlign,
      phone: formData.phone, email: formData.email,
      show_phone: showPhone, show_email: showEmail,
      show_save_contact: showSaveContact,
    }

    let error
    if (profileId) {
      const res = await supabase.from('profiles').update(payload).eq('id', profileId)
      error = res.error
    } else {
      const res = await supabase.from('profiles').insert({
        user_id: userId, ...payload,
        theme: 'light', accent_color: 'blue',
      }).select().single()
      error = res.error
      if (res.data) setProfileId(res.data.id)
    }

    if (error) {
      console.error("profile save error:", error)
      toast.error("保存に失敗しました")
    } else {
      toast.success("プロフィールを保存しました ✓")
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
      <div className="bg-white border-b border-gray-200 sticky top-14 md:top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl">プロフィール編集</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-white rounded-3xl border-2 border-gray-200 p-5 md:p-8">
            <label className="block mb-6">プロフィール画像</label>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* アバター（クリックでファイル選択） */}
              <button type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0 group focus:outline-none">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="プロフィール画像" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  {uploadingAvatar
                    ? <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    : <Upload className="w-7 h-7 text-white" />
                  }
                </div>
              </button>

              <div className="flex flex-col gap-3">
                <button type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:bg-gray-50 px-6 py-3 rounded-2xl transition-colors disabled:opacity-60">
                  <Upload className="w-5 h-5" />
                  <span>{uploadingAvatar ? "アップロード中..." : "画像をアップロード"}</span>
                </button>
                {avatarUrl && (
                  <button type="button"
                    onClick={handleAvatarDelete}
                    className="flex items-center gap-2 text-red-500 hover:bg-red-50 border-2 border-red-200 px-6 py-3 rounded-2xl transition-colors text-sm">
                    <Trash2 className="w-4 h-4" />
                    <span>画像を削除</span>
                  </button>
                )}
                <p className="text-xs text-gray-500">JPG・PNG・WebP、最大5MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-gray-200 p-5 md:p-8">
            <h2 className="mb-6">基本情報</h2>
            <div className="space-y-5">
              {[
                { label: "名前", name: "name", placeholder: "山田 太郎" },
                { label: "会社名", name: "organization", placeholder: "株式会社サンプル" },
                { label: "肩書き", name: "title", placeholder: "Webデザイナー" },
                { label: "場所", name: "location", placeholder: "東京都" },
              ].map(f => (
                <div key={f.name}>
                  <label className="block mb-2">{f.label}</label>
                  <input type="text" name={f.name}
                    value={formData[f.name as keyof typeof formData] as string}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors text-gray-900 placeholder:text-gray-400"
                    placeholder={f.placeholder} />
                </div>
              ))}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label>自己紹介</label>
                  <span className="text-sm text-gray-700">{formData.bio.length}/200文字</span>
                </div>
                <textarea name="bio" value={formData.bio} onChange={handleChange}
                  rows={4} maxLength={200}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors resize-none text-gray-900 placeholder:text-gray-400"
                  placeholder="あなたについて簡単に紹介してください（最大200文字）" />
              </div>

              <div>
                <label className="block mb-2">自己紹介の配置</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["center", "left"] as const).map(align => (
                    <button key={align} type="button"
                      onClick={() => setFormData({ ...formData, bioAlign: align })}
                      className={`px-4 py-3 rounded-xl transition-colors border-2 ${
                        formData.bioAlign === align
                          ? "bg-blue-50 border-blue-600 text-blue-700"
                          : "bg-gray-50 border-transparent hover:border-gray-300"
                      }`}>
                      {align === "center" ? "中央揃え" : "左詰め"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-gray-200 p-5 md:p-8">
            <h2 className="mb-6">連絡先情報</h2>
            <div className="space-y-5">
              <div>
                <label className="block mb-2">電話番号</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors text-gray-900 placeholder:text-gray-400"
                  placeholder="090-1234-5678" />
              </div>
              <div>
                <label className="block mb-2">メールアドレス</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl transition-colors text-gray-900 placeholder:text-gray-400"
                  placeholder="you@example.com" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-gray-200 p-5 md:p-8">
            <h2 className="mb-2">公開ページの表示設定</h2>
            <p className="text-sm text-gray-500 mb-6">オフにすると公開ページに表示されません</p>
            <div className="space-y-4">
              {[
                { label: "「連絡先を保存」ボタン", value: showSaveContact, setter: setShowSaveContact },
                { label: "「電話」ボタン", value: showPhone, setter: setShowPhone },
                { label: "「メール」ボタン", value: showEmail, setter: setShowEmail },
              ].map(({ label, value, setter }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{label}</span>
                  <button type="button" onClick={() => setter(!value)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
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
