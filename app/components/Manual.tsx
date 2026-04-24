'use client'

import { AdminLayout } from "./AdminLayout"
import { User, Globe, Share2, Images, Palette, KeyRound, ChevronRight, Lightbulb, AlertCircle } from "lucide-react"

const sections = [
  {
    id: "profile",
    icon: User,
    title: "プロフィール編集",
    color: "bg-yellow-100 text-yellow-700",
    steps: [
      { label: "名前", desc: "公開ページに表示される氏名を入力します。" },
      { label: "肩書き・会社名・所在地", desc: "それぞれ任意で入力できます。空欄の場合は非表示になります。" },
      { label: "自己紹介", desc: "プロフィール下部に表示されるテキストです。改行も反映されます。" },
      { label: "アイコン画像", desc: "Google DriveにアップロードしたURLを貼り付けると顔写真として表示されます。" },
      { label: "連絡先の表示設定", desc: "電話番号・メールアドレスの表示/非表示をスイッチで切り替えられます。" },
    ],
    tips: [
      "アイコン画像はGoogle Driveで「リンクを知っている全員が閲覧可」に設定してください。",
      "自己紹介は短めに書くと閲覧者が読みやすくなります。",
    ],
  },
  {
    id: "company",
    icon: Globe,
    title: "会社URL管理",
    color: "bg-yellow-100 text-yellow-700",
    steps: [
      { label: "新規追加", desc: "「＋ 会社URLを追加」ボタンを押してタイトル・URLを入力し「追加」を押します。" },
      { label: "編集", desc: "各カードの編集ボタンを押すとタイトル・URLを変更できます。" },
      { label: "並び替え", desc: "↑↓ボタンで表示順を変更できます。上にある項目が先に表示されます。" },
      { label: "削除", desc: "削除ボタンを押すと確認なしで即削除されます。ご注意ください。" },
    ],
    tips: [
      "URLは「https://」から始まる形式で入力してください。",
      "会社サイト・採用ページ・サービスページなど複数登録できます。",
    ],
  },
  {
    id: "sns",
    icon: Share2,
    title: "SNSリンク管理",
    color: "bg-yellow-100 text-yellow-700",
    steps: [
      { label: "プラットフォームを選ぶ", desc: "追加したいSNSのアイコン（Instagram・X・YouTubeなど）を選択します。" },
      { label: "アカウント名とURLを入力", desc: "何のアカウントか分かる名前（例：公式Instagram）とURLを入力します。" },
      { label: "アイコン変更", desc: "登録済みのカードのアイコンボタンを押すと別のプラットフォームに変更できます。" },
      { label: "1プラットフォームに複数登録", desc: "同じSNSでも複数のアカウントを登録できます（最大6件）。" },
    ],
    tips: [
      "アカウント名を入れると、閲覧者がどのアカウントか一目でわかります。",
      "URLはSNSの個人ページのURLをそのまま貼り付けてください。",
    ],
  },
  {
    id: "content",
    icon: Images,
    title: "コンテンツ管理",
    color: "bg-yellow-100 text-yellow-700",
    steps: [
      { label: "タイトルを入力", desc: "カードに表示されるタイトル（例：サービス紹介・実績紹介）を入力します。" },
      { label: "リンクURLを入力", desc: "タップ時に遷移するURLを入力します。" },
      { label: "説明文を入力（任意）", desc: "カード下部に表示される補足テキストです。省略可能です。" },
      { label: "バナー画像を設定（任意）", desc: "Google DriveのURLを貼り付けるとカード上部に画像が表示されます。推奨サイズは 1200×600px です。" },
    ],
    tips: [
      "バナー画像はGoogle Driveで「リンクを知っている全員が閲覧可」に設定してください。",
      "画像なしでもテキストカードとして表示されます。",
    ],
  },
  {
    id: "theme",
    icon: Palette,
    title: "デザイン設定",
    color: "bg-yellow-100 text-yellow-700",
    steps: [
      { label: "背景テーマを選ぶ", desc: "ホワイト・グレー・ブラック・ライム・イエローなど全8種類から選択できます。" },
      { label: "メインボタンカラーを選ぶ", desc: "ボタンやリンクのアクセントカラーを12色から選択できます。" },
      { label: "プレビューで確認", desc: "設定後は「公開ページを見る」から見た目を確認してください。" },
    ],
    tips: [
      "背景とボタンカラーの組み合わせによって印象が大きく変わります。",
      "ダークテーマ（ブラック・チャコール）には白系ボタンカラーが映えます。",
    ],
  },
  {
    id: "password",
    icon: KeyRound,
    title: "パスワード変更",
    color: "bg-yellow-100 text-yellow-700",
    steps: [
      { label: "現在のパスワードを入力", desc: "ログイン中に使用しているパスワードを入力します。" },
      { label: "新しいパスワードを入力", desc: "6文字以上の新しいパスワードを2回入力します。" },
      { label: "変更を保存", desc: "「変更する」ボタンを押すと反映されます。次回ログインから新しいパスワードが有効になります。" },
    ],
    tips: [
      "パスワードは他のサービスと使い回さないようにしましょう。",
    ],
  },
]

export function Manual() {
  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ヘッダー */}
        <div className="bg-yellow-400 rounded-3xl px-8 py-8 mb-8 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-36 h-36 bg-yellow-300 rounded-full opacity-50" />
          <div className="absolute -right-2 bottom-0 w-20 h-20 bg-yellow-500 rounded-full opacity-30" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-sm font-semibold text-yellow-900 bg-yellow-300 px-3 py-1 rounded-full">使い方ガイド</span>
            </div>
            <h1 className="text-2xl font-bold text-yellow-900 mb-1">デジタルプロフィール 入力マニュアル</h1>
            <p className="text-yellow-800 text-sm">各機能の操作方法をわかりやすくまとめました。</p>
          </div>
        </div>

        {/* 注意書き */}
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 mb-8">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            設定内容は保存ボタンを押すまで反映されません。編集後は必ず「保存」を押してください。
          </p>
        </div>

        {/* セクション一覧 */}
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.id} className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden">
                {/* セクションヘッダー */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${section.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">{section.title}</h2>
                </div>

                {/* ステップ */}
                <div className="px-6 py-5 space-y-4">
                  {section.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <ChevronRight className="w-3.5 h-3.5 text-yellow-500" />
                          <span className="text-sm font-semibold text-gray-800">{step.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ヒント */}
                {section.tips.length > 0 && (
                  <div className="mx-6 mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4">
                    <p className="text-xs font-semibold text-yellow-700 mb-2">💡 ポイント</p>
                    <ul className="space-y-1.5">
                      {section.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-yellow-800 leading-relaxed flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">・</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* フッター */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 text-sm font-semibold px-6 py-3 rounded-full">
            <Lightbulb className="w-4 h-4" />
            わからないことがあればお気軽にご相談ください
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
