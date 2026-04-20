'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Link as LinkIcon, Palette, Eye } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/edit-profile", label: "プロフィール編集", icon: User },
  { href: "/edit-links", label: "リンク管理", icon: LinkIcon },
  { href: "/theme-settings", label: "デザイン設定", icon: Palette },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* サイドバー（PC） */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed top-0 left-0 h-full z-20">
        <div className="px-6 py-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-lg font-semibold text-gray-900">
            Digital Profile
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Eye className="w-5 h-5" />
            公開ページを見る
          </Link>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>

        {/* ボトムナビ（モバイル） */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
          <div className="grid grid-cols-5 h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="truncate">{item.label.replace("編集", "").replace("管理", "").replace("設定", "")}</span>
                </Link>
              );
            })}
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-1 text-xs text-gray-500"
            >
              <Eye className="w-5 h-5" />
              <span>公開</span>
            </Link>
          </div>
        </nav>

        {/* モバイルボトムナビの余白 */}
        <div className="md:hidden h-16" />
      </div>
    </div>
  );
}
