import Link from "next/link";

export interface RouteTableItem {
  id: string;
  name: string;
  totalImages: number;
}

interface Props {
  routes: RouteTableItem[];
  actionLabel: string;
  actionHref: (id: string) => string;
  emptyMessage?: string;
}

export default function RouteTable({ routes, actionLabel, actionHref, emptyMessage = "ยังไม่มี Route ในระบบ" }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">ชื่อ Route / คลังข้อมูล</th>
              <th className="px-6 py-4 text-center w-48">จำนวนรูปภาพใน Route</th>
              <th className="px-6 py-4 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {routes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {routes.map((route) => (
              <tr key={route.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{route.name}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 font-mono text-xs font-semibold rounded-lg">
                    {route.totalImages} รูป
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={actionHref(route.id)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-950 hover:underline transition-all pr-2"
                  >
                    {actionLabel}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
