"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Newspaper,
  Compass,
  BookOpen,
  Brain,
  Settings,
  LogOut,
  Bookmark,
} from "lucide-react";

const navMain = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Today" },
  { href: "/briefings", icon: Newspaper, label: "Briefings" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/learning", icon: BookOpen, label: "Learning" },
];

const navAccount = [
  { href: "/profile", icon: Brain, label: "Knowledge" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-[#E7E5E0] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E7E5E0]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#1649FF"/>
            <path d="M7 14c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 14c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="1.5" fill="white"/>
          </svg>
          <div>
            <div className="font-bold text-[#111110] text-sm leading-tight">AI Pulse</div>
            <div className="text-[10px] text-[#A8A29E] leading-tight">Intelligence Daily</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        {/* Main nav */}
        <div className="space-y-0.5 mb-6">
          {navMain.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                  active
                    ? "bg-[#EFF3FF] text-[#1649FF]"
                    : "text-[#57534E] hover:bg-[#F2F1EE] hover:text-[#111110]"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-[#1649FF]" : "text-[#A8A29E]")} />
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1649FF]" />}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-[#E7E5E0] mb-4" />

        {/* Saved */}
        <div className="space-y-0.5 mb-6">
          <Link
            href="/profile#saved"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-[#57534E] hover:bg-[#F2F1EE] hover:text-[#111110] transition-all"
          >
            <Bookmark className="w-4 h-4 text-[#A8A29E] shrink-0" />
            Saved
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E7E5E0] mb-4" />

        {/* Account */}
        <div className="space-y-0.5">
          {navAccount.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                  active
                    ? "bg-[#EFF3FF] text-[#1649FF]"
                    : "text-[#57534E] hover:bg-[#F2F1EE] hover:text-[#111110]"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-[#1649FF]" : "text-[#A8A29E]")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-4 border-t border-[#E7E5E0] pt-3">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-[#A8A29E] hover:text-[#7F1D1D] hover:bg-[#FEF2F2] transition-all w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
