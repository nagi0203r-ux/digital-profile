import type { NextConfig } from "next";

const securityHeaders = [
  // フィッシング・MITM対策: 2年間HTTPSを強制
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // クリックジャッキング対策: iframe埋め込みを完全禁止
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // MIMEスニッフィング攻撃対策
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // リファラー情報の漏洩を最小化
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // 不要なブラウザ機能を無効化（位置情報・マイク・カメラ等）
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // XSSフィルター（旧ブラウザ向け）
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Content Security Policy: 許可する通信先・スクリプト源を制限
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js App Router はインラインスクリプトを使用するため unsafe-inline が必要
      "script-src 'self' 'unsafe-inline'",
      // Tailwind CSS はインラインスタイルを使用
      "style-src 'self' 'unsafe-inline'",
      // 画像: 自ドメイン + Supabase Storage + Google Drive CDN
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
      // API通信: Supabase のみ許可
      "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co",
      // フォント: 自ドメイン + Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // iframe での読み込みを禁止
      "frame-ancestors 'none'",
      // プラグイン（Flash等）を禁止
      "object-src 'none'",
      // base タグによるURL操作を禁止
      "base-uri 'self'",
      // フォーム送信先を自ドメインに制限
      "form-action 'self'",
      // HTTP通信を自動的にHTTPSへアップグレード
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
