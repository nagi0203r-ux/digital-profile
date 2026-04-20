'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Globe } from "lucide-react"
import { toast } from "sonner"
import { supabase, type Link as LinkItem } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

const MAX_COMPANY = 6

export function CompanyLinkManagement() {
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('links').select('*')
        .eq('user_id', user.id).eq('type', 'company')
        .order('order_index')
      if (data) setItems(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !newTitle || !newUrl) return
    if (items.length >= MAX_COMPANY) {
      toast.error(`会社URLは最大${MAX_COMPANY}件までです`)
      return
    }

    const { data, error } = await supabase.from('links').insert({
      user_id: userId,
      title: newTitle,
      url: newUrl,
      icon: 'globe',
      enabled: true,
      type: 'company',
      order_index: items.length,
      description: '',
      banner: '',
    }).select().single()

    if (error) {
      console.error("company link insert error:", error)
      toast.error("追加に失敗しました: " + error.message)
      return
    }
    if (data) {
      setItems(prev => [...prev, data])
      setNewTitle("")
      setNewUrl("")
      setShowForm(false)
      toast.success("会社URLを追加しました")
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

  const handleSave = async () => {
    setSaving(true)
    const promises = items.map(item =>
      supabase.from('links').update({
        title: item.title,
        url: item.url,
        enabled: item.enabled,
      }).eq('id', item.id)
    )
    await Promise.all(promises)
    toast.success("保存しました ✓")
    setSaving(false)
  }

  const handleInlineChange = (id: string, field: 'title' | 'url', value: string) => {
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
      <div className="bg-white border-b border-gray-200 sticky top-14 md:top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl">会社URL管理</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-blue-900">公開ページのSNSリンクの上に2列で表示されます。最大{MAX_COMPANY}件まで登録できます。（現在 {items.length}/{MAX_COMPANY}）</p>
        </div>

        {/* 追加ボタン */}
        {!showForm && items.length < MAX_COMPANY && (
          <div className="mb-6">
            <button onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /><span>会社URLを追加</span>
            </button>
          </div>
        )}

        {/* 追加フォーム */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-white rounded-3xl border-2 border-gray-200 p-4 md:p-6 mb-6 space-y-4">
            <h2>新しい会社URL</h2>
            <div>
              <label className="block mb-2 text-sm text-gray-700">ボタン名<span className="text-red-500 ml-1">*</span></label>
              <input type="text" value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                placeholder="公式サイト" required />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-700">URL<span className="text-red-500 ml-1">*</span></label>
              <input type="url" value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                placeholder="https://example.com" required />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl">追加</button>
              <button type="button"
                onClick={() => { setShowForm(false); setNewTitle(""); setNewUrl("") }}
                className="flex-1 bg-white border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-2xl text-gray-700">キャンセル</button>
            </div>
          </form>
        )}

        {/* 一覧 */}
        {items.length === 0 && !showForm ? (
          <div className="text-center py-16 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>会社URLがまだありません</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {items.map(item => (
              <div key={item.id} className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <input type="text"
                      value={item.title}
                      onChange={e => handleInlineChange(item.id, 'title', e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-3 py-2 rounded-xl text-sm font-medium text-gray-900"
                      placeholder="ボタン名" />
                    <input type="url"
                      value={item.url}
                      onChange={e => handleInlineChange(item.id, 'url', e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-3 py-2 rounded-xl text-xs text-gray-700"
                      placeholder="https://example.com" />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => handleToggle(item.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${item.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${item.enabled ? 'translate-x-5' : ''}`} />
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="sticky bottom-0 bg-gray-50 pt-4 pb-8">
            <button onClick={handleSave} disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-2xl transition-colors shadow-lg">
              {saving ? "保存中..." : "保存する"}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
