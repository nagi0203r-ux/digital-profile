import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  name: string
  title: string
  organization: string
  location: string
  bio: string
  bio_align: 'center' | 'left'
  phone: string
  email: string
  theme: string
  accent_color: string
  avatar_url: string
}

export type Link = {
  id: string
  user_id: string
  title: string
  url: string
  icon: string
  enabled: boolean
  type: 'sns' | 'custom'
  banner: string
  description: string
  order_index: number
}
