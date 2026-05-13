import Link from "next/link";
import { FileText, Globe, Package, MessageSquare } from "lucide-react";

const actions = [
  {
    href: "/dashboard/workflows/itinerary",
    icon: FileText,
    title: "Client Itinerary",
    description: "Turn a client request into a full proposal",
    color: "bg-blue-50 text-blue-600",
  },
  {
    href: "/dashboard/workflows/research",
    icon: Globe,
    title: "Destination Report",
    description: "Research a destination end to end",
    color: "bg-teal-50 text-teal-600",
  },
  {
    href: "/dashboard/workflows/package",
    icon: Package,
    title: "Tour Package",
    description: "Build and publish a tour package",
    color: "bg-purple-50 text-purple-600",
  },
  {
    href: "/dashboard/chat",
    icon: MessageSquare,
    title: "Ask Anything",
    description: "Free-form travel business question",
    color: "bg-orange-50 text-orange-500",
  },
];

export default function QuickActions() {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-navy mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map(({ href, icon: Icon, title, description, color }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-teal hover:shadow-sm transition-all group"
          >
            <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-navy group-hover:text-teal transition-colors">
                {title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
