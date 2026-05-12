import "./globals.css";
import NavTabs from "../components/NavTabs";
import GlobalHeader from "../components/GlobalHeader";

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
      <body className="min-h-screen pb-28">
        <GlobalHeader />
        <main className="max-w-2xl mx-auto px-4 py-4">{children}</main>
        <NavTabs />
      </body>
    </html>
  );
}
