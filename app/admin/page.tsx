import type { Metadata } from "next"
import { AdminPanel } from "@/app/components/AdminPanel"

export const metadata: Metadata = {
  title: "デジタル名刺管理画面",
}

export default function AdminPage() {
  return <AdminPanel />
}
