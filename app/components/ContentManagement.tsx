'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, ExternalLink, Link2, ChevronUp, ChevronDown, Pencil, X } from "lucide-react"
import { toast } from "sonner"
import { supabase, type Link as LinkItem } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

function extractDriveId(url: string): string | null {
  // /file/d/ID/ または /d/ID 形式
  const fileMatch = url.match(/\/d\/([^/?&]+)/)
  if (fileMatch) return fileMatch[1]
  // thumbnail?id=ID 形式
  const thumbMatch = url.match(/[?&]id=([^&]+)/)
  if (thumbMatch) return thumbMatch[1]
  // lh3.googleusercontent.com/d/ID 形式
  const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([^?&/]+)/)
  if (lh3Match) return lh3Match[1]
  return null
}

function convertDriveUrl(url: string): string {
  const id = extractDriveId(url)
  if (!id) return url
  return `https://lh3.googleusercontent.com/d/${id}`
}

function isDriveUrl(url: string): boolean {
  return url.includes("drive.google.com") || url.includes("googleusercontent.com")
}

const emptyForm = { title: "", url: "", description: "", driveUrl: "" }

type EditForm = { title: string; url: string; description: string; driveUrl: string }

export function ContentManagement() {
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>(emptyForm)
  const [editSaving, setEditSaving] = useState(false)

  const addPreview = form.driveUrl
    ? (isDriveUrl(form.driveUrl) ? convertDriveUrl(form.driveUrl) : form.driveUrl)
    : ""
  const editPreview = editForm.driveUrl
    ? (isDriveUrl(editForm.driveUrl) ? convertDriveUrl(editForm.driveUrl) : editForm.driveUrl)
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

    if (error) {
      console.error("content insert error:", error)
      toast.error("追加に失敗しました: " + error.message)
      return
    }
    if (data) {
      setItems(prev => [...prev, data])
      setForm(emptyForm)
      setShowForm(false)
      toast.success("コンテンツを追加しました")
    }
  }

  const startEdit = (item: LinkItem) => {
    setEditingId(item.id)
    // 保存済みのバナーURLからGoogle DriveのファイルIDを取り出し、編集しやすい形式に戻す
    let driveUrl = ""
    if (item.banner) {
      const id = extractDriveId(item.banner)
      driveUrl = id ? `https://drive.google.com/file/d/${id}/view` : item.banner
    }
    setEditForm({
      title: item.title,
      url: item.url,
      description: item.description ?? "",
      driveUrl,
    })
    setShowForm(false)
  }

  const handleEditSave = async (id: string) => {
    setEditSaving(true)
    const bannerUrl = editForm.driveUrl
      ? (isDriveUrl(editForm.driveUrl) ? convertDriveUrl(editForm.driveUrl) : editForm.driveUrl)
      : ""

    const { error } = await supabase.from('links').update({
      title: editForm.title,
      url: editForm.url,
      description: editForm.description,
      banner: bannerUrl,
    }).eq('id', id)

    if (error) {
      console.error("edit save error:", error)
      toast.error("保存に失敗しました")
    } else {
      setItems(prev => prev.map(i => i.id === id
        ? { ...i, title: editForm.title, url: editForm.url, description: editForm.description, banner: bannerUrl }
        : i
      ))
      // バナーURLをlh3形式から元のDrive URL形式に戻してフォームを維持
      if (bannerUrl) {
        const savedId = extractDriveId(bannerUrl)
        if (savedId) {
          setEditForm(prev => ({ ...prev, driveUrl: `https://drive.google.com/file/d/${savedId}/view` }))
        }
      }
      toast.success("保存しました ✓")
    }
    setEditSaving(false)
  }

  const handleRemoveBanner = async (id: string) => {
    setEditForm(prev => ({ ...prev, driveUrl: "" }))
    setItems(prev => prev.map(i => i.id === id ? { ...i, banner: "" } : i))
    await supabase.from('links').update({ banner: "" }).eq('id', id)
    toast.success("バナーを削除しました")
  }

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    if (editingId === id) setEditingId(null)
    await supabase.from('links').delete().eq('id', id)
    toast.success("コンテンツを削除しました")
  }

  const handleToggle = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i))
    await supabase.from('links').update({ enabled: !item.enabled }).eq('id', id)
  }

  const moveItem = async (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    const next = [...items]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setItems(next)
    await Promise.all(next.map((it, i) =>
      supabase.from('links').update({ order_index: i }).eq('id', it.id)
    ))
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
          <h1 className="text-xl">コンテンツ管理</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6 space-y-1">
          <p className="text-sm text-blue-900 font-medium">バナー画像の使い方</p>
          <p className="text-sm text-blue-800">① Google Driveに画像をアップロード</p>
          <p className="text-sm text-blue-800">② 「リンクを知っている人が閲覧可」に設定</p>
          <p className="text-sm text-blue-800">③ 共有リンクをコピーして下の欄に貼り付け</p>
        </div>

        {!showForm && (
          <div className="mb-6">
            <button onClick={() => { setShowForm(true); setEditingId(null) }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /><span>コンテンツを追加</span>
            </button>
          </div>
        )}

        {/* 追加フォーム */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-white rounded-3xl border-2 border-gray-200 p-4 md:p-6 mb-6 space-y-4">
            <h2>新しいコンテンツ</h2>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">タイトル<span className="text-red-500 ml-1">*</span></label>
              <input type="text" value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                placeholder="コンテンツのタイトル" required />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">説明文</label>
              <textarea value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400 resize-none"
                placeholder="コンテンツの簡単な説明を入力してください" />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">リンクURL<span className="text-red-500 ml-1">*</span></label>
              <input type="url" value={form.url}
                onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                placeholder="https://example.com" required />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <span className="flex items-center gap-1.5"><Link2 className="w-4 h-4" />バナー画像（Google Driveリンク・任意）</span>
              </label>
              <input type="text" value={form.driveUrl}
                onChange={e => setForm(prev => ({ ...prev, driveUrl: e.target.value }))}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400"
                placeholder="https://drive.google.com/file/d/xxxxx/view" />
              {addPreview && (
                <div className="mt-3">
                  <p className="text-xs text-gray-700 mb-1">プレビュー</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={addPreview} alt="preview"
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

        {/* コンテンツ一覧 */}
        <div className="space-y-3 mb-6">
          {items.length === 0 && !showForm && (
            <div className="text-center py-16 text-gray-700">
              <ExternalLink className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>コンテンツがまだありません</p>
            </div>
          )}

          {items.map((item, index) => (
            <div key={item.id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
              {/* バナー */}
              {item.banner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.banner} alt={item.title} className="w-full h-40 object-cover" loading="lazy" />
              ) : (
                <div className="bg-gray-100 h-12 flex items-center px-4 gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">バナーなし</span>
                </div>
              )}

              {/* カード本体 */}
              <div className="p-4">
                <div className="flex items-start gap-2">
                  {/* 並べ替えボタン */}
                  <div className="flex flex-col gap-1 flex-shrink-0 mt-0.5">
                    <button type="button"
                      onClick={() => moveItem(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    </button>
                    <button type="button"
                      onClick={() => moveItem(index, index + 1)}
                      disabled={index === items.length - 1}
                      className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* テキスト */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{item.title}</div>
                    {item.description && (
                      <div className="text-sm text-gray-700 line-clamp-1 mt-0.5">{item.description}</div>
                    )}
                    <div className="text-xs text-gray-500 truncate mt-0.5">{item.url}</div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button"
                      onClick={() => editingId === item.id ? setEditingId(null) : startEdit(item)}
                      className={`p-2 rounded-xl transition-colors ${editingId === item.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}>
                      {editingId === item.id ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                    </button>
                    <button type="button" onClick={() => handleToggle(item.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${item.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${item.enabled ? 'translate-x-5' : ''}`} />
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 編集フォーム（インライン展開） */}
              {editingId === item.id && (
                <div className="border-t-2 border-blue-100 bg-blue-50/40 p-4 md:p-5 space-y-4">
                  <p className="text-sm font-medium text-blue-700">編集</p>

                  <div>
                    <label className="block mb-1.5 text-sm text-gray-700">タイトル<span className="text-red-500 ml-1">*</span></label>
                    <input type="text" value={editForm.title}
                      onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-white border-2 border-gray-200 focus:border-blue-600 focus:outline-none px-4 py-2.5 rounded-xl text-gray-900 placeholder:text-gray-400"
                      placeholder="タイトル" />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm text-gray-700">説明文</label>
                    <textarea value={editForm.description}
                      onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full bg-white border-2 border-gray-200 focus:border-blue-600 focus:outline-none px-4 py-2.5 rounded-xl text-gray-900 placeholder:text-gray-400 resize-none"
                      placeholder="説明文" />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm text-gray-700">リンクURL<span className="text-red-500 ml-1">*</span></label>
                    <input type="url" value={editForm.url}
                      onChange={e => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full bg-white border-2 border-gray-200 focus:border-blue-600 focus:outline-none px-4 py-2.5 rounded-xl text-gray-900 placeholder:text-gray-400"
                      placeholder="https://example.com" />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm text-gray-700">
                      <span className="flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" />バナー画像（Google Driveリンク）</span>
                    </label>
                    <input type="text" value={editForm.driveUrl}
                      onChange={e => setEditForm(prev => ({ ...prev, driveUrl: e.target.value }))}
                      className="w-full bg-white border-2 border-gray-200 focus:border-blue-600 focus:outline-none px-4 py-2.5 rounded-xl text-gray-900 placeholder:text-gray-400"
                      placeholder="https://drive.google.com/file/d/xxxxx/view" />

                    {/* バナープレビュー or 削除ボタン */}
                    {item.banner && !editForm.driveUrl && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1.5">現在のバナー</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.banner} alt="current banner"
                          className="w-full h-32 object-cover rounded-xl mb-2" loading="lazy" />
                        <button type="button"
                          onClick={() => handleRemoveBanner(item.id)}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 py-2 rounded-xl text-sm transition-colors">
                          バナー画像を削除
                        </button>
                      </div>
                    )}
                    {editPreview && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1.5">新しいバナープレビュー</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={editPreview} alt="preview"
                          className="w-full h-32 object-cover rounded-xl"
                          loading="lazy"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button"
                      onClick={() => handleEditSave(item.id)}
                      disabled={editSaving || !editForm.title || !editForm.url}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-2xl text-sm transition-colors">
                      {editSaving ? "保存中..." : "保存する"}
                    </button>
                    <button type="button"
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-white border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-2xl text-sm text-gray-700 transition-colors">
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
