// 后台外壳: 顶栏 + 内容区。中间件已经在边缘做了 Basic Auth, 这里不再校验。
// 视觉沿用前台 ink-* 配色 + 衬线标题, 但比前台更紧凑。

import AdminHeader from "../../components/admin/AdminHeader";

export const metadata = {
  title: "Nongtangli Admin",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-800">
      <AdminHeader />
      <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
