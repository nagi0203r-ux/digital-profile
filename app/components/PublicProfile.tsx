'use client'

import { useEffect, useState } from "react"
import { User, Mail, Phone, Globe, MapPin } from "lucide-react"
import { FaLine, FaXTwitter, FaInstagram, FaYoutube, FaFacebook, FaTiktok } from "react-icons/fa6"
import { supabase, type Profile, type Link } from "@/lib/supabase"

const themes: Record<string, Record<string, string>> = {
  light: {
    background: "bg-gray-50",
    cardBg: "bg-white",
    text: "text-gray-900",
    textMuted: "text-gray-600",
    buttonPrimary: "bg-blue-600 text-white",
    buttonSecondary: "bg-white text-gray-900 border-2 border-gray-200",
    border: "border-gray-200",
  },
  dark: {
    background: "bg-gray-900",
    cardBg: "bg-gray-800",
    text: "text-white",
    textMuted: "text-gray-400",
    buttonPrimary: "bg-cyan-500 text-white",
    buttonSecondary: "bg-gray-700 text-white border-2 border-gray-600",
    border: "border-gray-700",
  },
  gradient: {
    background: "bg-gradient-to-br from-purple-50 to-pink-50",
    cardBg: "bg-white/90 backdrop-blur",
    text: "text-gray-900",
    textMuted: "text-gray-600",
    buttonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    buttonSecondary: "bg-white text-gray-900 border-2 border-purple-200",
    border: "border-purple-200",
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
  const snsLinks = links.filter(l => l.enabled && l.type === "sns")
  const customLinks = links.filter(l => l.enabled && l.type === "custom")

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
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-4 ring-white shadow-lg">
              <User className="w-14 h-14 text-white" />
            </div>
          </div>

          <div className="text-center px-8 mb-6">
            <h1 className={`text-2xl mb-2 ${theme.text}`}>{profile.name}</h1>
            {profile.title && <p className={`${theme.textMuted} mb-1`}>{profile.title}</p>}
            {profile.organization && <p className={`${theme.textMuted} mb-3`}>{profile.organization}</p>}
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
            {profile.phone && (
              <div className={`flex items-center gap-3 text-sm ${theme.textMuted}`}>
                <Phone className="w-4 h-4" /><span>{profile.phone}</span>
              </div>
            )}
            {profile.email && (
              <div className={`flex items-center gap-3 text-sm ${theme.textMuted}`}>
                <Mail className="w-4 h-4" /><span>{profile.email}</span>
              </div>
            )}
          </div>

          <div className="px-8 mb-8 space-y-3">
            <button
              onClick={handleSaveContact}
              className={`w-full ${theme.buttonPrimary} py-3.5 rounded-lg transition-all shadow-sm hover:shadow-md`}
            >
              連絡先を保存
            </button>
            <div className="grid grid-cols-2 gap-3">
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className={`flex items-center justify-center gap-2 ${theme.buttonSecondary} py-3.5 rounded-lg transition-all hover:shadow-sm`}>
                  <Phone className="w-4 h-4" /><span className="text-sm">電話</span>
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className={`flex items-center justify-center gap-2 ${theme.buttonSecondary} py-3.5 rounded-lg transition-all hover:shadow-sm`}>
                  <Mail className="w-4 h-4" /><span className="text-sm">メール</span>
                </a>
              )}
            </div>
          </div>

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
                    <span className={`text-xs ${theme.textMuted} text-center truncate w-full px-1`}>{link.title}</span>
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
