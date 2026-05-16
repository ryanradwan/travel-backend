"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/app/auth/actions";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Clock,
  Plug,
  Settings,
  LogOut,
  Wand2,
  BookOpen,
  FileText,
  Globe,
  Package,
  Puzzle,
  TrendingUp,
  Mail,
  BarChart2,
  PieChart,
  Inbox,
  Sparkles,
  Plane,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "Ask TripDesk", icon: MessageSquare },
  { href: "/dashboard/workflows/itinerary", label: "Client Itinerary", icon: FileText },
  { href: "/dashboard/workflows/research", label: "Destination Report", icon: Globe },
  { href: "/dashboard/workflows/package", label: "Tour Package", icon: Package },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: TrendingUp },
  { href: "/dashboard/revenue", label: "Revenue", icon: BarChart2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: PieChart },
  { href: "/dashboard/trends", label: "Trends", icon: Sparkles },
  { href: "/dashboard/flights", label: "Flight Search", icon: Plane },
  { href: "/dashboard/inbox", label: "Inbox", icon: Inbox, badgeKey: "inbox" },
  { href: "/dashboard/follow-ups", label: "Follow-Ups", icon: Mail, badgeKey: "followUps" },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/tasks", label: "Task History", icon: Clock },
  { href: "/dashboard/templates", label: "Templates", icon: BookOpen },
  { href: "/dashboard/connectors", label: "Connectors", icon: Plug },
  { href: "/dashboard/skills", label: "Custom Skills", icon: Wand2 },
  { href: "/dashboard/plugins", label: "Custom Plugins", icon: Puzzle },
];

const bottomNav = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  businessName?: string;
  userEmail?: string;
  tier?: string;
  pendingFollowUps?: number;
  pendingInquiries?: number;
}

export default function Sidebar({ businessName, userEmail, tier = "Starter", pendingFollowUps = 0, pendingInquiries = 0 }: SidebarProps) {
  const pathname = usePathname();

  const badges: Record<string, number> = {
    followUps: pendingFollowUps,
    inbox: pendingInquiries,
  };

  return (
    <aside className="w-64 bg-navy flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-navy-400/30">
        <Link href="/dashboard" className="text-white text-xl font-bold tracking-tight">
          TripDesk<span className="text-teal">.ai</span>
        </Link>
        {businessName && (
          <p className="text-blue-300 text-xs mt-0.5 truncate">{businessName}</p>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, badgeKey }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const badgeCount = badgeKey ? badges[badgeKey] : 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors",
                active
                  ? "bg-teal text-white"
                  : "text-blue-200 hover:bg-navy-400/40 hover:text-white"
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {badgeCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-3 space-y-0.5 border-t border-navy-400/30 pt-3">
        {bottomNav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors",
                active
                  ? "bg-teal text-white"
                  : "text-blue-200 hover:bg-navy-400/40 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}

        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-blue-200 hover:bg-navy-400/40 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </form>

        {/* User info + tier badge */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center justify-between">
            <p className="text-blue-300 text-xs truncate max-w-[140px]">{userEmail}</p>
            <span className="text-xs bg-teal/30 text-teal-200 px-2 py-0.5 rounded-full capitalize">
              {tier}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
