import "./globals.css";
import Link from "next/link";
import NavTabs from "../components/NavTabs";

export const metadata = {
  title: "弄堂里 · 上海街区漫游",
  description: "Citywalk 不是消费主义,所以这里没有一条路线的人均超过 300。",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f6f2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen pb-20">
        <header className="sticky top-0 z-30 bg-ink-50/90 backdrop-blur border-b border-ink-100">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-baseline justify-between">
            <Link href="/" className="text-lg font-serif font-bold text-ink-800">
              弄堂里
            </Link>
            <span className="text-xs text-ink-400">上海街区漫游 · V1</span>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-4">{children}</main>
        <NavTabs />
      </body>
    </html>
  );
}
