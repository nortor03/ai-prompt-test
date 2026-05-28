"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Prompt Settings", path: "/prompts" },
    { name: "Route Settings", path: "/routes" },
    { name: "Test AI Prompt", path: "/test" },
    { name: "Compare by Route", path: "/compare/route" },
    { name: "Compare by Image", path: "/compare/picture" },
  ];

  return (
    <aside className="fixed top-0 left-0 w-72 h-screen bg-slate-50 text-slate-900 border-r border-slate-200 p-6 flex flex-col justify-between z-50">
      
      {/* ส่วนโครงสร้างเมนูหลัก */}
      <div className="w-full">
        <div className="px-2 mb-10">
          <h1 className="font-bold text-slate-950 text-xl tracking-tight">AI Prompt Test</h1>
        </div>

        {/* รายการเมนู */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      
      <div></div>

    </aside>
  );
}