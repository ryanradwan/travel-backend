import Link from "next/link";

const settingsNav = [
  { href: "/dashboard/settings", label: "Profile" },
  { href: "/dashboard/settings/brand", label: "Brand & PDF" },
  { href: "/dashboard/settings/billing", label: "Billing & Plan" },
  { href: "/dashboard/settings/team", label: "Team" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto">
      <nav className="flex gap-1 border-b border-border mb-8 pb-0">
        {settingsNav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-navy border-b-2 border-transparent hover:border-navy transition-colors -mb-px"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
