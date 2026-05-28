"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const mainMenuItems = [
    { name: "Prompt Settings", path: "/prompts" },
    { name: "Route Settings", path: "/routes" },
    { name: "Test AI Prompt", path: "/test" },
  ];

  const compareMenuItems = [
    { name: "Compare by Route", path: "/compare/route" },
    { name: "Compare by Image", path: "/compare/picture" },
  ];

  return (
    <aside className="fixed top-0 left-0 w-72 h-screen bg-slate-50 text-slate-900 border-r border-slate-200 p-6 flex flex-col justify-between z-50">

      <div className="w-full">
        <div className="px-2 mb-10">
          <h1 className="font-bold text-slate-950 text-xl tracking-tight">AI Prompt Test</h1>
        </div>

        <nav className="flex flex-col gap-1">
          {mainMenuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Compare label */}
          <div className="px-4 pt-4 pb-1">
            <span className="text-base font-medium text-slate-700">Compare</span>
          </div>

          {/* Compare submenu items */}
          <div className="ml-4 pl-3 border-l-2 border-slate-200 flex flex-col gap-1">
            {compareMenuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-slate-950 text-white shadow-sm font-medium"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <div></div>

    </aside>
  );
}
