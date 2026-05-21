"use client";

import { useState } from "react";
import { Menu, X, Bell } from "lucide-react";
import Sidebar from "./Sidebar";
import GlobalSearch from "./GlobalSearch";

interface TopBarProps {
  title?: string;
  businessName?: string;
  userEmail?: string;
  tier?: string;
}

export default function TopBar({ title, businessName, userEmail, tier }: TopBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="h-14 bg-white border-b border-border flex items-center px-6 gap-4">
        <button
          className="lg:hidden text-navy"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="flex-1 flex items-center gap-4 min-w-0">
          {title && <h1 className="text-navy font-semibold text-base hidden lg:block flex-shrink-0">{title}</h1>}
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button className="text-gray-400 hover:text-navy transition-colors" aria-label="Notifications">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0">
            <Sidebar businessName={businessName} userEmail={userEmail} tier={tier} />
            <button
              className="absolute top-4 right-4 text-white"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
