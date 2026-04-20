'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { FaLine, FaInstagram, FaYoutube, FaFacebook, FaTiktok, FaXTwitter } from "react-icons/fa6"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { AdminLayout } from "./AdminLayout"

const SNS_PLATFORMS = [
  { id: "line", name: "LINE", Icon: FaLine, color: "text-green-500", placeholder: "https://line.me/ti/p/xxxxx" },
  { id: "instagram", name: "Instagram", Icon: FaInstagram, color: "text-pink-500", placeholder: "https://instagram.com/username" },
  { id: "youtube", name: "YouTube", Icon: FaYoutube, color: "text-red-500", placeholder: "https://youtube.com/@channel" },
  { id: "facebook", name: "Facebook", Icon: FaFacebook, color: "text-blue-600", placeholder: "https://facebook.com/username" },
  { id: "tiktok", name: "TikTok", Icon: FaTiktok, color: "text-gray-900", placeholder: "https://tiktok.com/@username" },
  { id: "x", name: "X (Twitter)", Icon: FaXTwitter, color: "text-gray-900", placeholder: "https://x.com/username" },
]

type SnsState = Record<string, { url: string; enabled: boolean; id: string | null }>

export function SNSLinkManagement() {
  const [userId, setUserId] = useState<string | null>(null)
  const [state, setState] = useState<SnsState>(() =>
    Object.fromEntries(SNS_PLATFORMS.map(p => [p.id, { url: "", enabled: true, id: null }]))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('links').select('*').eq('user_id', user.id).eq('type', 'sns')
      if (data) {
        const next = { ...state }
        for (const link of data) {
          if (next[link.icon]) {
            next[link.icon] = { url: link.url, enabled: link.enabled, id: link.id }
          }
        }
        setState(next)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)

    for (const platform of SNS_PLATFORMS) {
      const entry = state[platform.id]
      const url = entry.url.trim()

      if (entry.id) {
        if (url) {
          await supabase.from('links').update({
            url, enabled: entry.enabled, title: platform.name,
          }).eq('id', entry.id)
        } else {
          await supabase.from('links').delete().eq('id', entry.id)
          setState(prev => ({ ...prev, [platform.id]: { url: "", enabled: true, id: null } }))
        }
      } else if (url) {
        const { data } = await supabase.from('links').insert({
          user_id: userId, title: platform.name, url,
          icon: platform.id, enabled: entry.enabled,
          type: 'sns', banner: '', description: '', order_index: SNS_PLATFORMS.findIndex(p => p.id === platform.id),
        }).select().single()
        if (data) setState(prev => ({ ...prev, [platform.id]: { ...prev[platform.id], id: data.id } }))
      }
    }

    toast.success("SNSリンクを保存しました")
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl">SNSリンク管理</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-blue-900">URLを入力したSNSのみ公開ページに表示されます。空白のSNSは非表示になります。</p>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-200 p-6 space-y-4">
          {SNS_PLATFORMS.map(({ id, name, Icon, color, placeholder }) => {
            const entry = state[id]
            return (
              <div key={id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon style={{ width: "1.25rem", height: "1.25rem" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">{name}</p>
                  <input
                    type="url"
                    value={entry.url}
                    onChange={e => setState(prev => ({ ...prev, [id]: { ...prev[id], url: e.target.value } }))}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:outline-none px-4 py-2.5 rounded-xl text-gray-900 placeholder:text-gray-400 text-sm"
                    placeholder={placeholder}
                  />
                </div>
                {entry.url && (
                  <button
                    type="button"
                    onClick={() => setState(prev => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id].enabled } }))}
                    className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${entry.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${entry.enabled ? 'translate-x-5' : ''}`} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="sticky bottom-0 bg-gray-50 pt-4 pb-8 mt-6">
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-2xl transition-colors shadow-lg">
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
