'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, GripVertical, Globe, Camera, Briefcase, Play, Trash2 } from "lucide-react"
import { useDrag, useDrop, DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { toast } from "sonner"
import { supabase, type Link as LinkItem } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

function getIcon(iconName: string) {
  switch (iconName) {
    case "instagram": return <Camera className="w-5 h-5" />
    case "linkedin": return <Briefcase className="w-5 h-5" />
    case "youtube": return <Play className="w-5 h-5" />
    default: return <Globe className="w-5 h-5" />
  }
}

function DraggableLink({ link, index, moveLink, onToggle, onDelete }: {
  link: LinkItem
  index: number
  moveLink: (from: number, to: number) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'link',
    item: { index },
    collect: (m) => ({ isDragging: m.isDragging() }),
  })
  const [, drop] = useDrop({
    accept: 'link',
    hover: (item: { index: number }) => {
      if (item.index !== index) { moveLink(item.index, index); item.index = index }
    },
  })

  return (
    <div ref={(n) => { drag(drop(n)) }}
      className={`bg-white border-2 border-gray-200 rounded-2xl p-4 transition-all ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="cursor-grab active:cursor-grabbing text-gray-400">
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="text-gray-500">{getIcon(link.icon)}</div>
        <div className="flex-1 min-w-0">
          <div className="text-gray-500 text-sm mb-1">
            {link.type === "company" ? "会社URL" : link.type === "sns" ? "SNS" : "カスタムリンク"}
            {link.banner && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">バナー付き</span>}
          </div>
          <div className="font-medium truncate">{link.title}</div>
          <div className="text-sm text-gray-500 truncate">{link.url}</div>
        </div>
        <button type="button" onClick={() => onToggle(link.id)}
          className={`relative w-12 h-7 rounded-full transition-colors ${link.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${link.enabled ? 'translate-x-5' : ''}`} />
        </button>
        <button type="button" onClick={() => onDelete(link.id)}
          className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export function LinkManagement() {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: "globe", type: "custom" as LinkItem['type'], banner: "" })

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()
      if (profile) {
        setProfileId(profile.id)
        const { data: linksData } = await supabase.from('links').select('*').eq('profile_id', profile.id).order('order_index')
        if (linksData) setLinks(linksData)
      }
      setLoading(false)
    }
    load()
  }, [])

  const companyCount = links.filter(l => l.type === "company").length
  const snsCount = links.filter(l => l.type === "sns").length

  const moveLink = (from: number, to: number) => {
    const next = [...links]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setLinks(next)
  }

  const handleToggle = async (id: string) => {
    const link = links.find(l => l.id === id)
    if (!link) return
    setLinks(links.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l))
    await supabase.from('links').update({ enabled: !link.enabled }).eq('id', id)
  }

  const handleDelete = async (id: string) => {
    setLinks(links.filter(l => l.id !== id))
    await supabase.from('links').delete().eq('id', id)
    toast.success("リンクを削除しました")
  }

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileId) return
    if (newLink.type === "company" && companyCount >= 6) { toast.error("会社URLは最大6つまでです"); return }
    if (newLink.type === "sns" && snsCount >= 6) { toast.error("SNSは最大6つまでです"); return }
    if (!newLink.title || !newLink.url) return

    const order_index = links.length
    const { data, error } = await supabase.from('links').insert({
      profile_id: profileId,
      ...newLink,
      enabled: true,
      order_index,
    }).select().single()

    if (data) {
      setLinks([...links, data])
      setNewLink({ title: "", url: "", icon: "globe", type: "custom", banner: "" })
      setShowAddForm(false)
      toast.success("リンクを追加しました")
    } else if (error) {
      toast.error("追加に失敗しました")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const updates = links.map((link, i) =>
      supabase.from('links').update({ order_index: i }).eq('id', link.id)
    )
    await Promise.all(updates)
    toast.success("変更を保存しました")
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
            <h1 className="text-xl">リンク管理</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6 space-y-1">
            <p className="text-sm text-blue-900"><strong>会社URL：</strong>2列の長方形カード（最大6個）</p>
            <p className="text-sm text-blue-900"><strong>SNS：</strong>正方形グリッド（最大6個）</p>
            <p className="text-sm text-blue-900"><strong>カスタムリンク：</strong>長方形カード（無制限）</p>
          </div>

          {!showAddForm && (
            <div className="mb-6">
              <button onClick={() => setShowAddForm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /><span>新しいリンクを追加</span>
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                会社URL: {companyCount}/6 | SNS: {snsCount}/6 | カスタム: 無制限
              </p>
            </div>
          )}

          {showAddForm && (
            <form onSubmit={handleAddLink} className="bg-white rounded-3xl border-2 border-gray-200 p-6 mb-6 space-y-4">
              <h2>新しいリンク</h2>
              <div>
                <label className="block mb-2">リンクタイプ</label>
                <select value={newLink.type} onChange={e => setNewLink({ ...newLink, type: e.target.value as LinkItem['type'] })}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl">
                  <option value="company">会社URL</option>
                  <option value="sns">SNS</option>
                  <option value="custom">カスタムリンク</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">タイトル</label>
                <input type="text" value={newLink.title} onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl"
                  placeholder="公式サイト" required />
              </div>
              <div>
                <label className="block mb-2">URL</label>
                <input type="url" value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl"
                  placeholder="https://example.com" required />
              </div>
              <div>
                <label className="block mb-2">アイコン</label>
                <select value={newLink.icon} onChange={e => setNewLink({ ...newLink, icon: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl">
                  <option value="globe">ウェブサイト</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
              {newLink.type === "custom" && (
                <div>
                  <label className="block mb-2">バナー画像URL（任意）</label>
                  <input type="url" value={newLink.banner} onChange={e => setNewLink({ ...newLink, banner: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl"
                    placeholder="https://example.com/banner.jpg" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl">追加</button>
                <button type="button" onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-white border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-2xl">キャンセル</button>
              </div>
            </form>
          )}

          <div className="space-y-3 mb-6">
            {links.map((link, index) => (
              <DraggableLink key={link.id} link={link} index={index}
                moveLink={moveLink} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>

          <div className="sticky bottom-0 bg-gray-50 pt-4 pb-8">
            <button onClick={handleSave} disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-2xl transition-colors shadow-lg">
              {saving ? "保存中..." : "変更を保存"}
            </button>
          </div>
        </div>
      </DndProvider>
    </AdminLayout>
  )
}
