"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [compareOpen, setCompareOpen] = useState(false);

  const mainMenuItems = [
    { name: "Prompt Settings", path: "/prompts" },
    { name: "Route Settings", path: "/routes" },
    { name: "Test AI Prompt", path: "/test" },
  ];

  const compareMenuItems = [
    { name: "Compare by Route", path: "/compare/route" },
    { name: "Compare by Image", path: "/compare/picture" },
  ];

  const isCompareActive = compareMenuItems.some((item) => pathname === item.path);

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

          {/* Compare with submenu */}
          <div
            className="relative"
            onMouseEnter={() => setCompareOpen(true)}
            onMouseLeave={() => setCompareOpen(false)}
          >
            <button
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isCompareActive || compareOpen
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-950 hover:text-white"
              }`}
            >
              <span>Compare</span>
              <svg
                className={`w-4 h-4 transition-transform duration-150 ${compareOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Submenu */}
            {compareOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                {compareMenuItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-slate-100 text-slate-950"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      <div></div>

    </aside>
  );
}
