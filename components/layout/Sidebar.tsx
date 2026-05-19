"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/app/auth/actions";
import {
  LayoutDashboard, MessageSquare, Users, Clock, Plug, Settings, LogOut,
  Wand2, BookOpen, FileText, Globe, Package, Puzzle, TrendingUp, Mail,
  BarChart2, PieChart, Inbox, Sparkles, Plane,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badgeKey?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    label: "",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/chat", label: "TravelBackend", icon: MessageSquare },
    ],
  },
  {
    label: "Workflows",
    items: [
      { href: "/dashboard/workflows/itinerary", label: "Client Itinerary", icon: FileText },
      { href: "/dashboard/workflows/research", label: "Destination Report", icon: Globe },
      { href: "/dashboard/workflows/package", label: "Tour Package", icon: Package },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/dashboard/pipeline", label: "Pipeline", icon: TrendingUp },
      { href: "/dashboard/revenue", label: "Revenue", icon: BarChart2 },
      { href: "/dashboard/analytics", label: "Analytics", icon: PieChart },
    ],
  },
  {
    label: "Clients",
    items: [
      { href: "/dashboard/clients", label: "Clients", icon: Users },
      { href: "/dashboard/inbox", label: "Inbox", icon: Inbox, badgeKey: "inbox" },
      { href: "/dashboard/follow-ups", label: "Follow-Ups", icon: Mail, badgeKey: "followUps" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/dashboard/trends", label: "Trends", icon: Sparkles },
      { href: "/dashboard/flights", label: "Flight Search", icon: Plane },
      { href: "/dashboard/templates", label: "Templates", icon: BookOpen },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/dashboard/connectors", label: "Connectors", icon: Plug },
      { href: "/dashboard/skills", label: "Custom Skills", icon: Wand2 },
      { href: "/dashboard/plugins", label: "Custom Plugins", icon: Puzzle },
      { href: "/dashboard/tasks", label: "Task History", icon: Clock },
    ],
  },
];

interface SidebarProps {
  businessName?: string;
  userEmail?: string;
  tier?: string;
  pendingFollowUps?: number;
  pendingInquiries?: number;
}

export default function Sidebar({
  businessName, userEmail, tier = "Starter",
  pendingFollowUps = 0, pendingInquiries = 0,
}: SidebarProps) {
  const pathname = usePathname();

  const badges: Record<string, number> = {
    followUps: pendingFollowUps,
    inbox: pendingInquiries,
  };

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  return (
    <aside className="w-56 bg-navy flex flex-col h-full min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <Link href="/dashboard" className="text-white text-lg font-bold tracking-tight">
          TravelBackend
        </Link>
        {businessName && (
          <p className="text-blue-300 text-xs mt-0.5 truncate">{businessName}</p>
        )}
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            {group.label && (
              <p className="text-blue-400/60 text-xs font-semibold uppercase tracking-wider px-3 mb-1">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, badgeKey }) => {
                const active = isActive(href);
                const badgeCount = badgeKey ? badges[badgeKey] : 0;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-colors",
                      active
                        ? "bg-teal text-white"
                        : "text-blue-200 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    <span className="flex-1 truncate">{label}</span>
                    {badgeCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom — settings, logout, user info */}
      <div className="px-2 pb-3 border-t border-white/10 pt-3 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-colors",
            pathname.startsWith("/dashboard/settings")
              ? "bg-teal text-white"
              : "text-blue-200 hover:bg-white/10 hover:text-white"
          )}
        >
          <Settings size={15} />
          Settings
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={15} />
            Log out
          </button>
        </form>

        <div className="px-3 pt-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-blue-300/70 text-xs truncate">{userEmail}</p>
            <span className="text-xs bg-teal/30 text-teal px-1.5 py-0.5 rounded capitalize flex-shrink-0">
              {tier}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
