'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, ExternalLink, GripVertical, Link2 } from "lucide-react"
import { useDrag, useDrop, DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { toast } from "sonner"
import { supabase, type Link as LinkItem } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

function convertDriveUrl(url: string): string {
  const match = url.match(/\/d\/(.*?)\//)
  if (!match) return url
  return `https://drive.google.com/uc?export=view&id=${match[1]}`
}

function isDriveUrl(url: string): boolean {
  return url.includes("drive.google.com")
}

function ContentCard({ item, index, moveItem, onDelete, onToggle, onRemoveBanner }: {
  item: LinkItem; index: number
  moveItem: (from: number, to: number) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  onRemoveBanner: (id: string) => void
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'content', item: { index },
    collect: m => ({ isDragging: m.isDragging() }),
  })
  const [, drop] = useDrop({
    accept: 'content',
    hover: (dragged: { index: number }) => {
      if (dragged.index !== index) { moveItem(dragged.index, index); dragged.index = index }
    },
  })

  return (
    <div ref={n => { drag(drop(n)) }}
      className={`bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all ${isDragging ? 'opacity-50' : ''}`}>
      {item.banner ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.banner} alt={item.title} className="w-full h-40 object-cover" loading="lazy" />
          <button type="button" onClick={() => onRemoveBanner(item.id)}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs">
            ✕
          </button>
        </div>
      ) : (
        <div className="bg-gray-100 h-16 flex items-center px-4 gap-3">
          <ExternalLink className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-400">バナーなし</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="cursor-grab active:cursor-grabbing text-gray-400 mt-0.5 flex-shrink-0">
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 mb-1 truncate">{item.title}</div>
            {item.description && <div className="text-sm text-gray-500 line-clamp-2 mb-1">{item.description}</div>}
            <div className="text-xs text-gray-400 truncate">{item.url}</div>
          </div>
          <button type="button" onClick={() => onToggle(item.id)}
            className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${item.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${item.enabled ? 'translate-x-5' : ''}`} />
          </button>
          <button type="button" onClick={() => onDelete(item.id)}
            className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500 flex-shrink-0">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

const emptyForm = { title: "", url: "", description: "", driveUrl: "" }

export function ContentManagement() {
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const convertedPreview = form.driveUrl
    ? (isDriveUrl(form.driveUrl) ? convertDriveUrl(form.driveUrl) : form.driveUrl)
    : ""

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('links').select('*').eq('user_id', user.id).eq('type', 'custom').order('order_index')
      if (data) setItems(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !form.title || !form.url) return

    const bannerUrl = form.driveUrl
      ? (isDriveUrl(form.driveUrl) ? convertDriveUrl(form.driveUrl) : form.driveUrl)
      : ""

    const { data, error } = await supabase.from('links').insert({
      user_id: userId,
      title: form.title,
      url: form.url,
      description: form.description,
      banner: bannerUrl,
      icon: 'globe',
      enabled: true,
      type: 'custom',
      order_index: items.length,
    }).select().single()

    if (error) { toast.error("追加に失敗しました"); return }
    if (data) {
      setItems(prev => [...prev, data])
      setForm(emptyForm)
      setShowForm(false)
      toast.success("コンテンツを追加しました")
    }
  }

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('links').delete().eq('id', id)
    toast.success("コンテンツを削除しました")
  }

  const handleToggle = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i))
    await supabase.from('links').update({ enabled: !item.enabled }).eq('id', id)
  }

  const handleRemoveBanner = async (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, banner: "" } : i))
    await supabase.from('links').update({ banner: "" }).eq('id', id)
    toast.success("バナーを削除しました")
  }

  const moveItem = (from: number, to: number) => {
    const next = [...items]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setItems(next)
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    await Promise.all(items.map((item, i) =>
      supabase.from('links').update({ order_index: i }).eq('id', item.id)
    ))
    toast.success("順番を保存しました")
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

  return (
    <AdminLayout>
      <DndProvider backend={HTML5Backend}>
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl">コンテンツ管理</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6 space-y-1">
            <p className="text-sm text-blue-900 font-medium">バナー画像の使い方</p>
            <p className="text-sm text-blue-800">① Google Driveに画像をアップロード</p>
            <p className="text-sm text-blue-800">② 「リンクを知っている人が閲覧可」に設定</p>
            <p className="text-sm text-blue-800">③ 共有リンクをコピーして下の欄に貼り付け</p>
          </div>

          {!showForm && (
            <div className="mb-6">
              <button onClick={() => setShowForm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /><span>コンテンツを追加</span>
              </button>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleAdd} className="bg-white rounded-3xl border-2 border-gray-200 p-6 mb-6 space-y-4">
              <h2>新しいコンテンツ</h2>

              {/* タイトル */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">タイトル<span className="text-red-500 ml-1">*</span></label>
                <input type="text" value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                  placeholder="コンテンツのタイトル" required />
              </div>

              {/* 説明文 */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">説明文</label>
                <textarea value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400 resize-none"
                  placeholder="コンテンツの簡単な説明を入力してください" />
              </div>

              {/* 遷移URL */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">リンクURL<span className="text-red-500 ml-1">*</span></label>
                <input type="url" value={form.url}
                  onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                  placeholder="https://example.com" required />
              </div>

              {/* Google Drive URL */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-1.5"><Link2 className="w-4 h-4" />バナー画像（Google Driveリンク・任意）</span>
                </label>
                <input type="text" value={form.driveUrl}
                  onChange={e => setForm(prev => ({ ...prev, driveUrl: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                  placeholder="https://drive.google.com/file/d/xxxxx/view" />
                {convertedPreview && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">プレビュー</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={convertedPreview} alt="preview"
                      className="w-full h-40 object-cover rounded-xl"
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl">
                  追加
                </button>
                <button type="button"
                  onClick={() => { setShowForm(false); setForm(emptyForm) }}
                  className="flex-1 bg-white border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-2xl text-gray-700">
                  キャンセル
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3 mb-6">
            {items.length === 0 && !showForm && (
              <div className="text-center py-16 text-gray-400">
                <ExternalLink className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>コンテンツがまだありません</p>
              </div>
            )}
            {items.map((item, index) => (
              <ContentCard key={item.id} item={item} index={index}
                moveItem={moveItem} onDelete={handleDelete}
                onToggle={handleToggle} onRemoveBanner={handleRemoveBanner} />
            ))}
          </div>

          {items.length > 0 && (
            <div className="sticky bottom-0 bg-gray-50 pt-4 pb-8">
              <button onClick={handleSaveOrder} disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-2xl transition-colors shadow-lg">
                {saving ? "保存中..." : "順番を保存"}
              </button>
            </div>
          )}
        </div>
      </DndProvider>
    </AdminLayout>
  )
}
