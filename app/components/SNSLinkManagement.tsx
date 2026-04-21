'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { FaLine, FaInstagram, FaYoutube, FaFacebook, FaTiktok, FaXTwitter } from "react-icons/fa6"
import { toast } from "sonner"
import { supabase, type Link as LinkItem } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

const MAX_SNS = 6

const PLATFORMS = [
  { id: "line",      name: "LINE",       Icon: FaLine,      color: "text-green-500" },
  { id: "instagram", name: "Instagram",  Icon: FaInstagram, color: "text-pink-500"  },
  { id: "youtube",   name: "YouTube",    Icon: FaYoutube,   color: "text-red-500"   },
  { id: "facebook",  name: "Facebook",   Icon: FaFacebook,  color: "text-blue-600"  },
  { id: "tiktok",    name: "TikTok",     Icon: FaTiktok,    color: "text-gray-900"  },
  { id: "x",         name: "X (Twitter)",Icon: FaXTwitter,  color: "text-gray-900"  },
]

function PlatformIcon({ id, className }: { id: string; className?: string }) {
  const p = PLATFORMS.find(p => p.id === id)
  if (!p) return null
  return <p.Icon className={className ?? "w-5 h-5"} />
}

const emptyForm = { icon: "instagram", accountName: "", url: "" }

export function SNSLinkManagement() {
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('links').select('*')
        .eq('user_id', user.id).eq('type', 'sns')
        .order('order_index')
      if (data) setItems(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !form.url) return
    if (items.length >= MAX_SNS) {
      toast.error(`SNSは最大${MAX_SNS}件までです`)
      return
    }

    const platform = PLATFORMS.find(p => p.id === form.icon)
    const title = form.accountName.trim() || platform?.name || form.icon

    const { data, error } = await supabase.from('links').insert({
      user_id: userId,
      title,
      url: form.url,
      icon: form.icon,
      enabled: true,
      type: 'sns',
      order_index: items.length,
      description: '',
      banner: '',
    }).select().single()

    if (error) {
      toast.error("追加に失敗しました: " + error.message)
      return
    }
    if (data) {
      setItems(prev => [...prev, data])
      setForm(emptyForm)
      setShowForm(false)
      toast.success("SNSを追加しました")
    }
  }

  const handleToggle = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i))
    await supabase.from('links').update({ enabled: !item.enabled }).eq('id', id)
  }

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('links').delete().eq('id', id)
    toast.success("削除しました")
  }

  const handleMove = (index: number, dir: 'up' | 'down') => {
    const next = dir === 'up' ? index - 1 : index + 1
    if (next < 0 || next >= items.length) return
    const updated = [...items]
    ;[updated[index], updated[next]] = [updated[next], updated[index]]
    setItems(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    await Promise.all(
      items.map((item, idx) =>
        supabase.from('links').update({
          title: item.title,
          url: item.url,
          icon: item.icon,
          enabled: item.enabled,
          order_index: idx,
        }).eq('id', item.id)
      )
    )
    toast.success("保存しました ✓")
    setSaving(false)
  }

  const handleInlineChange = (id: string, field: 'title' | 'url' | 'icon', value: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
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
      <div className="bg-yellow-400 sticky top-14 md:top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-yellow-500 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-yellow-900" />
          </Link>
          <h1 className="text-xl font-bold text-yellow-900">SNSリンク管理</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-yellow-900">
            SNSアカウントを自由に追加できます。同じSNSを複数登録可能です。最大{MAX_SNS}件まで表示されます。（現在 {items.length}/{MAX_SNS}）
          </p>
        </div>

        {/* 追加ボタン */}
        {!showForm && items.length < MAX_SNS && (
          <div className="mb-6">
            <button onClick={() => setShowForm(true)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /><span>SNSを追加</span>
            </button>
          </div>
        )}

        {/* 追加フォーム */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-white rounded-3xl border-2 border-yellow-200 p-4 md:p-6 mb-6 space-y-4">
            <h2>新しいSNS</h2>

            {/* プラットフォーム選択 */}
            <div>
              <label className="block mb-2 text-sm text-gray-700">SNSの種類<span className="text-red-500 ml-1">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map(p => (
                  <button key={p.id} type="button"
                    onClick={() => setForm(prev => ({ ...prev, icon: p.id }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${
                      form.icon === p.id
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                    <span className={p.color}><p.Icon className="w-4 h-4" /></span>
                    <span className="text-xs font-medium text-gray-900 truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* アカウント名 */}
            <div>
              <label className="block mb-2 text-sm text-gray-700">アカウント名（表示名）</label>
              <input type="text" value={form.accountName}
                onChange={e => setForm(prev => ({ ...prev, accountName: e.target.value }))}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-500 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                placeholder="例：公式アカウント、個人用 など" />
              <p className="text-xs text-gray-500 mt-1">空欄の場合はSNS名が表示されます</p>
            </div>

            {/* URL */}
            <div>
              <label className="block mb-2 text-sm text-gray-700">URL<span className="text-red-500 ml-1">*</span></label>
              <input type="url" value={form.url}
                onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-500 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                placeholder="https://instagram.com/username" required />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit"
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-2xl">追加</button>
              <button type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm) }}
                className="flex-1 bg-white border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-2xl text-gray-700">キャンセル</button>
            </div>
          </form>
        )}

        {/* 一覧 */}
        {items.length === 0 && !showForm ? (
          <div className="text-center py-16 text-gray-500">
            <FaInstagram className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>SNSがまだ登録されていません</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {items.map((item, idx) => {
              const platform = PLATFORMS.find(p => p.id === item.icon)
              return (
                <div key={item.id} className="bg-white border-2 border-yellow-200 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5 flex-shrink-0">
                      <button type="button" onClick={() => handleMove(idx, 'up')} disabled={idx === 0}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-25">
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      </button>
                      <button type="button" onClick={() => handleMove(idx, 'down')} disabled={idx === items.length - 1}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-25">
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className={`w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 ${platform?.color ?? 'text-gray-500'}`}>
                      <PlatformIcon id={item.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{platform?.name}</span>
                    <div className="flex-1 min-w-0" />
                    <button type="button" onClick={() => handleToggle(item.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${item.enabled ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${item.enabled ? 'translate-x-5' : ''}`} />
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)}
                      className="p-1.5 hover:bg-red-50 rounded-xl transition-colors text-red-500 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      {PLATFORMS.map(p => (
                        <button key={p.id} type="button"
                          onClick={() => handleInlineChange(item.id, 'icon', p.id)}
                          className={`flex items-center gap-1.5 px-2 py-2 rounded-xl border-2 transition-all ${
                            item.icon === p.id
                              ? 'border-yellow-500 bg-yellow-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}>
                          <span className={p.color}><p.Icon className="w-3.5 h-3.5 flex-shrink-0" /></span>
                          <span className="text-xs text-gray-900 truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                    <input type="text"
                      value={item.title}
                      onChange={e => handleInlineChange(item.id, 'title', e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-500 focus:outline-none px-3 py-2 rounded-xl text-sm font-medium text-gray-900"
                      placeholder="アカウント名" />
                    <input type="url"
                      value={item.url}
                      onChange={e => handleInlineChange(item.id, 'url', e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-500 focus:outline-none px-3 py-2 rounded-xl text-xs text-gray-700"
                      placeholder="https://..." />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {items.length > 0 && (
          <div className="sticky bottom-0 bg-gray-50 pt-4 pb-8">
            <button onClick={handleSave} disabled={saving}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-semibold py-4 rounded-2xl transition-colors shadow-lg">
              {saving ? "保存中..." : "保存する"}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
