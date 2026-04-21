'use client'

import { useEffect, useState } from "react"
import { User, Mail, Phone, Globe, MapPin, Share2, Copy, Check, X, Bookmark } from "lucide-react"
import { FaLine, FaXTwitter, FaInstagram, FaYoutube, FaFacebook, FaTiktok } from "react-icons/fa6"
import { supabase, type Profile, type Link } from "@/lib/supabase"

const accentColorClass: Record<string, string> = {
  blue:   "bg-blue-600",
  cyan:   "bg-cyan-500",
  green:  "bg-green-600",
  purple: "bg-purple-600",
  pink:   "bg-pink-600",
  orange: "bg-orange-600",
  white:  "bg-white border border-gray-300",
  black:  "bg-gray-900",
  yellow: "bg-yellow-400",
  lime:   "bg-lime-500",
  amber:  "bg-amber-400",
  red:    "bg-red-600",
}

const accentTextClass: Record<string, string> = {
  white: "text-gray-900",
}

const themes: Record<string, Record<string, string>> = {
  light: {
    background: "bg-gray-50",
    cardBg: "bg-white",
    text: "text-gray-900",
    textMuted: "text-gray-600",
    buttonSecondary: "bg-white text-gray-900 border-2 border-gray-200",
    border: "border-gray-200",
  },
  dark: {
    background: "bg-gray-900",
    cardBg: "bg-gray-800",
    text: "text-white",
    textMuted: "text-white",
    buttonSecondary: "bg-gray-700 text-white border-2 border-gray-600",
    border: "border-gray-600",
  },
  gradient: {
    background: "bg-gradient-to-br from-purple-50 to-pink-50",
    cardBg: "bg-white/90 backdrop-blur",
    text: "text-gray-900",
    textMuted: "text-gray-600",
    buttonSecondary: "bg-white text-gray-900 border-2 border-purple-200",
    border: "border-purple-200",
  },
  lime: {
    background: "bg-gradient-to-br from-lime-300 via-green-200 to-emerald-100",
    cardBg: "bg-white/75 backdrop-blur",
    text: "text-gray-900",
    textMuted: "text-gray-700",
    buttonSecondary: "bg-white/70 text-gray-900 border-2 border-lime-300",
    border: "border-lime-200",
  },
  yellow: {
    background: "bg-gradient-to-br from-yellow-300 via-amber-200 to-yellow-100",
    cardBg: "bg-white/75 backdrop-blur",
    text: "text-gray-900",
    textMuted: "text-gray-700",
    buttonSecondary: "bg-white/70 text-gray-900 border-2 border-yellow-300",
    border: "border-yellow-200",
  },
  orange: {
    background: "bg-gradient-to-br from-orange-300 via-amber-200 to-orange-100",
    cardBg: "bg-white/75 backdrop-blur",
    text: "text-gray-900",
    textMuted: "text-gray-700",
    buttonSecondary: "bg-white/70 text-gray-900 border-2 border-orange-300",
    border: "border-orange-200",
  },
  sky: {
    background: "bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-100",
    cardBg: "bg-white/75 backdrop-blur",
    text: "text-gray-900",
    textMuted: "text-gray-700",
    buttonSecondary: "bg-white/70 text-gray-900 border-2 border-sky-300",
    border: "border-sky-200",
  },
  charcoal: {
    background: "bg-gradient-to-br from-gray-600 via-gray-500 to-gray-600",
    cardBg: "bg-gray-700/90 backdrop-blur",
    text: "text-white",
    textMuted: "text-gray-200",
    buttonSecondary: "bg-gray-600 text-white border-2 border-gray-400",
    border: "border-gray-500",
  },
}

function getIcon(iconName: string, className = "w-5 h-5") {
  const style = { width: "1.25rem", height: "1.25rem" }
  switch (iconName) {
    case "line": return <FaLine className={className} style={style} />
    case "x": return <FaXTwitter className={className} style={style} />
    case "instagram": return <FaInstagram className={className} style={style} />
    case "youtube": return <FaYoutube className={className} style={style} />
    case "facebook": return <FaFacebook className={className} style={style} />
    case "tiktok": return <FaTiktok className={className} style={style} />
    default: return <Globe className={className} />
  }
}

export function PublicProfile({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .order('order_index')

      if (profileData) setProfile(profileData)
      if (linksData) setLinks(linksData)
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-900">プロフィールが見つかりません</p>
      </div>
    )
  }

  const theme = themes[profile.theme] ?? themes.light
  const accentBg = accentColorClass[profile.accent_color] ?? "bg-blue-600"
  const accentText = accentTextClass[profile.accent_color] ?? "text-white"
  const buttonPrimary = `${accentBg} ${accentText}`
  const companyLinks = links.filter(l => l.enabled && l.type === "company")
  const snsLinks = links.filter(l => l.enabled && l.type === "sns")
  const customLinks = links.filter(l => l.enabled && l.type === "custom")

  const [showSaveModal, setShowSaveModal] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)

  const profileUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleSaveProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}のデジタル名刺`,
          text: `${profile.name}${profile.organization ? `（${profile.organization}）` : ''}のプロフィールです。`,
          url: profileUrl,
        })
      } catch {
        // キャンセルされた場合は何もしない
      }
    } else {
      setShowSaveModal(true)
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(profileUrl)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  const handleSaveContact = () => {
    const vCardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nORG:${profile.organization}\nTITLE:${profile.title}\nTEL:${profile.phone}\nEMAIL:${profile.email}\nEND:VCARD`
    const blob = new Blob([vCardData], { type: 'text/vcard' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${profile.name}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className={`min-h-screen ${theme.background}`}>
      <div className="max-w-lg mx-auto">
        <div className={`${theme.cardBg} min-h-screen`}>
          <div className="h-12" />

          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-lg flex-shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <User className="w-14 h-14 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="text-center px-8 mb-6">
            <h1 className={`text-2xl mb-2 ${theme.text}`}>{profile.name}</h1>
            {profile.organization && <p className={`${theme.textMuted} mb-1`}>{profile.organization}</p>}
            {profile.title && <p className={`${theme.textMuted} mb-3`}>{profile.title}</p>}
            {profile.location && (
              <div className={`flex items-center justify-center gap-1 ${theme.textMuted} text-sm`}>
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          {profile.bio && (
            <div className="px-8 mb-8">
              <p className={`${theme.text} ${profile.bio_align === "center" ? "text-center" : "text-left"} leading-relaxed whitespace-pre-line text-sm`}>
                {profile.bio}
              </p>
            </div>
          )}

          <div className="px-8 mb-6 space-y-3">
            {profile.phone && (profile.show_phone ?? true) && (
              <div className={`flex items-center gap-3 text-sm ${theme.textMuted}`}>
                <Phone className="w-4 h-4" /><span>{profile.phone}</span>
              </div>
            )}
            {profile.email && (profile.show_email ?? true) && (
              <div className={`flex items-center gap-3 text-sm ${theme.textMuted}`}>
                <Mail className="w-4 h-4" /><span>{profile.email}</span>
              </div>
            )}
          </div>

          <div className="px-8 mb-8 space-y-3">
            {(profile.show_save_contact ?? true) && (
              <button
                onClick={handleSaveContact}
                className={`w-full ${buttonPrimary} py-3.5 rounded-lg transition-all shadow-sm hover:shadow-md`}
              >
                連絡先を保存
              </button>
            )}
            {((profile.show_phone ?? true) || (profile.show_email ?? true)) && (
              <div className="grid grid-cols-2 gap-3">
                {profile.phone && (profile.show_phone ?? true) && (
                  <a href={`tel:${profile.phone}`} className={`flex items-center justify-center gap-2 ${theme.buttonSecondary} py-3.5 rounded-lg transition-all hover:shadow-sm`}>
                    <Phone className="w-4 h-4" /><span className="text-sm">電話</span>
                  </a>
                )}
                {profile.email && (profile.show_email ?? true) && (
                  <a href={`mailto:${profile.email}`} className={`flex items-center justify-center gap-2 ${theme.buttonSecondary} py-3.5 rounded-lg transition-all hover:shadow-sm`}>
                    <Mail className="w-4 h-4" /><span className="text-sm">メール</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* このプロフィールを保存ボタン */}
          <div className="px-8 mb-8">
            <button
              onClick={handleSaveProfile}
              className={`w-full flex items-center justify-center gap-2 ${theme.buttonSecondary} py-3.5 rounded-lg transition-all hover:shadow-sm`}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">このプロフィールを保存・共有</span>
            </button>
          </div>

          {/* 保存方法モーダル（PC用フォールバック） */}
          {showSaveModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowSaveModal(false)} />
              <div className="relative bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-gray-900">プロフィールを保存する</h2>
                  <button onClick={() => setShowSaveModal(false)} className="p-1.5 hover:bg-gray-100 rounded-xl">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* URLコピー */}
                  <button
                    onClick={handleCopyUrl}
                    className="w-full flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-3.5 rounded-2xl transition-colors text-left"
                  >
                    {urlCopied ? <Check className="w-5 h-5 text-green-600 flex-shrink-0" /> : <Copy className="w-5 h-5 text-gray-600 flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{urlCopied ? "コピーしました！" : "URLをコピー"}</p>
                      <p className="text-xs text-gray-500">メモやLINEに貼り付けて保存</p>
                    </div>
                  </button>

                  {/* メールで自分に送る */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`${profile.name}のデジタル名刺`)}&body=${encodeURIComponent(`${profile.name}さんのプロフィールページです。\n\n${profileUrl}`)}`}
                    className="w-full flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-3.5 rounded-2xl transition-colors"
                  >
                    <Mail className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">メールで自分に送る</p>
                      <p className="text-xs text-gray-500">メールアプリが開きます</p>
                    </div>
                  </a>

                  {/* ブックマーク案内 */}
                  <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 px-4 py-3.5 rounded-2xl">
                    <Bookmark className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">ブックマークに追加</p>
                      <p className="text-xs text-gray-500">ブラウザの ☆ アイコンまたは Ctrl+D</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {companyLinks.length > 0 && (
            <div className="px-8 pb-6">
              <div className={`border-t ${theme.border} pt-6 mb-4`}>
                <h3 className={`text-sm ${theme.textMuted}`}>会社情報</h3>
              </div>
              <div className="space-y-2">
                {companyLinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-3 ${theme.buttonSecondary} px-4 py-3 rounded-xl transition-all hover:shadow-sm`}>
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium leading-snug">{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {snsLinks.length > 0 && (
            <div className="px-8 pb-8">
              <div className={`border-t ${theme.border} pt-6 mb-4`}>
                <h3 className={`text-sm ${theme.textMuted}`}>SNS</h3>
              </div>
              <div className={`grid gap-3 ${snsLinks.length <= 3 ? 'grid-cols-3' : snsLinks.length <= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {snsLinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                    <div className={`w-full aspect-square ${theme.buttonSecondary} rounded-2xl flex items-center justify-center transition-all hover:shadow-md group-hover:scale-105`}>
                      <div className={theme.textMuted}>{getIcon(link.icon)}</div>
                    </div>
                    <span className={`text-[10px] leading-tight ${theme.textMuted} text-center w-full px-0.5 line-clamp-1 break-all`}>{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {customLinks.length > 0 && (
            <div className="px-8 pb-12">
              <div className={`border-t ${theme.border} pt-6 mb-4`}>
                <h3 className={`text-sm ${theme.textMuted}`}>コンテンツ</h3>
              </div>
              <div className="space-y-4">
                {customLinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className={`block overflow-hidden rounded-2xl transition-all hover:shadow-lg border-2 ${theme.border}`}>
                    {link.banner ? (
                      /* バナーあり */
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={link.banner} alt={link.title}
                        className="w-full object-cover"
                        style={{ aspectRatio: '2/1' }}
                        loading="lazy" />
                    ) : (
                      /* バナーなし：CSSのみ */
                      <div className={`${theme.cardBg} px-5 py-4 flex items-center gap-3`}>
                        <svg className={`w-5 h-5 flex-shrink-0 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className={`font-medium ${theme.text}`}>{link.title}</span>
                      </div>
                    )}
                    <div className={`${theme.cardBg} px-5 py-4 flex items-center justify-between gap-3`}>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${theme.text} truncate`}>{link.title}</p>
                        {link.description && (
                          <p className={`text-sm ${theme.textMuted} line-clamp-2 mt-0.5`}>{link.description}</p>
                        )}
                      </div>
                      <svg className={`w-4 h-4 flex-shrink-0 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className={`text-center pb-8 px-8 border-t ${theme.border} pt-8`}>
            <p className={`text-xs ${theme.textMuted}`}>Powered by Digital Profile</p>
          </div>
        </div>
      </div>
    </div>
  )
}
