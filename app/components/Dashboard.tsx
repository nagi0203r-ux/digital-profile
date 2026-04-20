'use client'

import Link from "next/link";
import { User, Edit, Link as LinkIcon, QrCode, Eye, Palette } from "lucide-react";
import { AdminLayout } from "./AdminLayout";

export function Dashboard() {
  const profileData = {
    name: "山田 太郎",
    title: "Webデザイナー",
    organization: "株式会社サンプル",
    linksCount: 4,
  };

  return (
    <AdminLayout>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-2xl">ダッシュボード</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl">プロフィールプレビュー</h2>
            <Link
              href="/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Eye className="w-5 h-5" />
              <span>表示</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl mb-1">{profileData.name}</h3>
            <p className="text-gray-500">{profileData.title}</p>
            <p className="text-sm text-gray-500">{profileData.organization}</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/edit-profile"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl transition-colors text-center"
            >
              プロフィール編集
            </Link>
            <Link
              href="/edit-links"
              className="flex-1 bg-white border-2 border-gray-200 hover:bg-gray-50 py-4 rounded-2xl transition-colors text-center"
            >
              リンク管理
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/edit-profile"
            className="bg-white rounded-3xl border-2 border-gray-200 p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">プロフィール編集</h3>
                <p className="text-sm text-gray-500">名前、肩書き、連絡先を編集</p>
              </div>
            </div>
          </Link>

          <Link
            href="/edit-links"
            className="bg-white rounded-3xl border-2 border-gray-200 p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">リンク管理</h3>
                <p className="text-sm text-gray-500">{profileData.linksCount}個のリンクを管理</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-3xl border-2 border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">QRコード</h3>
                <p className="text-sm text-gray-500">QRコードをダウンロード</p>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="bg-white rounded-3xl border-2 border-gray-200 p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">プレビュー</h3>
                <p className="text-sm text-gray-500">公開ページを確認</p>
              </div>
            </div>
          </Link>

          <Link
            href="/theme-settings"
            className="bg-white rounded-3xl border-2 border-gray-200 p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Palette className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">デザイン設定</h3>
                <p className="text-sm text-gray-500">テーマとカラーを変更</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
