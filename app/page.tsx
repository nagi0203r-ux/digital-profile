import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Digital Profile</h1>
        <p className="text-gray-500 mb-10">あなただけのデジタル名刺を作成しましょう</p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl transition-colors font-medium text-lg shadow-md"
        >
          はじめる
        </Link>
      </div>
    </div>
  )
}
