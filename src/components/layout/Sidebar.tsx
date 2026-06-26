"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  Mic,
  Lightbulb,
  BookOpen,
  Database,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",       href: "/" },
  { icon: Search,          label: "Research Studio", href: "/research", badge: "New" },
  { icon: FileText,        label: "Content Studio",  href: "/content" },
  { icon: Mic,             label: "Voice Studio",    href: "/voice" },
  { icon: Lightbulb,       label: "Banco de Ideas",  href: "/ideas" },
  { icon: BookOpen,        label: "Prompt Library",  href: "/prompts" },
  { icon: Database,        label: "Knowledge Base",  href: "/knowledge" },
  { icon: Zap,             label: "AI Playground",   href: "/playground" },
  { icon: Settings,        label: "Settings",        href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-[#0d0d0d] border-r border-white/[0.07] transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.07]">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#FF0033] flex items-center justify-center shadow-[0_0_16px_rgba(255,0,51,0.3)]">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-white leading-tight tracking-tight">Creator AI</p>
            <p className="text-[10px] text-zinc-600 leading-tight mt-0.5">Suite v1.0</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#FF0033]/10 text-white border border-[#FF0033]/20"
                  : "text-zinc-500 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive ? "text-[#FF0033]" : "text-zinc-600 group-hover:text-zinc-300"
                )}
                style={{ width: 17, height: 17 }}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <Badge className="text-[9px] px-1.5 py-0 bg-[#FF0033]/15 text-[#FF0033] border-[#FF0033]/25 font-medium">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center hover:bg-[#FF0033] hover:border-[#FF0033] transition-all z-10 shadow-sm"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-zinc-400" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-zinc-400" />
        )}
      </button>

      {/* User section */}
      {!collapsed && (
        <div className="p-3 border-t border-white/[0.07]">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF0033] to-[#CC0029] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-[0_0_8px_rgba(255,0,51,0.2)]">
              C
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">Creator User</p>
              <p className="text-[10px] text-zinc-600 truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
