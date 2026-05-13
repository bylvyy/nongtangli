import "./globals.css";
import NavTabs from "../components/NavTabs";
import GlobalHeader from "../components/GlobalHeader";
import HtmlLangSync from "../components/HtmlLangSync";

export const metadata = {
  title: "Nongtangli · Shanghai citywalk / 上海街区漫游",
  description:
    "Citywalk isn't consumerism — no route here costs more than ¥300 per person.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f6f2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen pb-28">
        <HtmlLangSync />
        <GlobalHeader />
        <main className="max-w-2xl mx-auto px-4 py-4">{children}</main>
        <NavTabs />
      </body>
    </html>
  );
}
