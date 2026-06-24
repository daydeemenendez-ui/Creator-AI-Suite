"use client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StubPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  items?: { label: string; desc: string }[];
}

export function StubPage({ title, description, icon: Icon, comingSoon, items }: StubPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#FF0033]/10 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-[#FF0033]" style={{ width: 32, height: 32 }} />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {comingSoon && (
          <Badge className="text-[10px] bg-[#FF0033]/10 text-[#FF0033] border-[#FF0033]/20">
            Próximamente
          </Badge>
        )}
      </div>
      <p className="text-[#888] text-sm max-w-md mb-8">{description}</p>
      {items && (
        <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-md">
          {items.map((item) => (
            <div
              key={item.label}
              className="bg-[#171717] border border-[#2A2A2A] rounded-xl p-4 text-left"
            >
              <p className="text-sm font-semibold text-white mb-1">{item.label}</p>
              <p className="text-xs text-[#666]">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
      <Button className="bg-[#FF0033] hover:bg-[#CC0029] text-white gap-2">
        <Icon className="w-4 h-4" />
        Explorar {title}
      </Button>
    </div>
  );
}
