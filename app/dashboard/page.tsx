import type { Metadata } from "next"
import { Dashboard } from "../components/Dashboard";

export const metadata: Metadata = {
  title: "デジタル名刺入力画面",
}

export default function DashboardPage() {
  return <Dashboard />;
}
