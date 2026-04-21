import type { Metadata } from "next"
import { Manual } from "@/app/components/Manual"

export const metadata: Metadata = {
  title: "使い方マニュアル",
}

export default function ManualPage() {
  return <Manual />
}
