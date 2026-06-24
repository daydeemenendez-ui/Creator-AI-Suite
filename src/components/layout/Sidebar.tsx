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
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Search, label: "Research Studio", href: "/research", badge: "New" },
  { icon: FileText, label: "Content Studio", href: "/content" },
  { icon: Mic, label: "Voice Studio", href: "/voice" },
  { icon: Lightbulb, label: "Banco de Ideas", href: "/ideas" },
  { icon: BookOpen, label: "Prompt Library", href: "/prompts" },
  { icon: Database, label: "Knowledge Base", href: "/knowledge" },
  { icon: Zap, label: "AI Playground", href: "/playground" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-[#111111] border-r border-[#2A2A2A] transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#2A2A2A]">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#FF0033] flex items-center justify-center shadow-lg shadow-red-950/50">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-white leading-tight">Creator AI</p>
            <p className="text-[10px] text-[#888] leading-tight">Suite v1.0</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#FF0033]/15 text-white border border-[#FF0033]/30"
                  : "text-[#888] hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "flex-shrink-0 w-4.5 h-4.5 transition-colors",
                  isActive ? "text-[#FF0033]" : "group-hover:text-white"
                )}
                style={{ width: 18, height: 18 }}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <Badge className="text-[9px] px-1.5 py-0 bg-[#FF0033]/20 text-[#FF0033] border-[#FF0033]/30">
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
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#2A2A2A] border border-[#333] flex items-center justify-center hover:bg-[#FF0033] transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-white" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-white" />
        )}
      </button>

      {/* Bottom user section */}
      {!collapsed && (
        <div className="p-3 border-t border-[#2A2A2A]">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF0033] to-[#CC0029] flex items-center justify-center text-xs font-bold text-white">
              C
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Creator User</p>
              <p className="text-[10px] text-[#666] truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
