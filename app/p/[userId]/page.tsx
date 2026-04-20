import { PublicProfile } from "@/app/components/PublicProfile"

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  return <PublicProfile userId={userId} />
}
