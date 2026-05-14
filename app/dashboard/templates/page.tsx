import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileText, Globe, Mail, Package, BarChart2, Share2 } from "lucide-react";
import TemplateCopyButton from "@/components/templates/TemplateCopyButton";

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  itinerary: { label: "Itineraries", icon: FileText, color: "bg-blue-50 text-blue-700" },
  proposal: { label: "Proposals", icon: Package, color: "bg-purple-50 text-purple-700" },
  email: { label: "Emails", icon: Mail, color: "bg-green-50 text-green-700" },
  report: { label: "Reports", icon: BarChart2, color: "bg-orange-50 text-orange-700" },
  social_media: { label: "Social Media", icon: Share2, color: "bg-pink-50 text-pink-700" },
  invoice: { label: "Invoices", icon: Globe, color: "bg-gray-50 text-gray-700" },
};

export default async function TemplatesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: templates } = await supabase
    .from("travel_templates")
    .select("id, name, category, destination, client_type, content")
    .eq("is_public", true)
    .order("category")
    .order("name");

  const grouped: Record<string, typeof templates> = {};
  for (const t of templates ?? []) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category]!.push(t);
  }

  const totalCount = templates?.length ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Templates Library</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalCount} ready-to-use travel business templates. Click a template to copy it to the chat.
        </p>
      </div>

      {Object.entries(grouped).map(([category, items]) => {
        const meta = CATEGORY_META[category] ?? { label: category, icon: FileText, color: "bg-gray-50 text-gray-700" };
        const Icon = meta.icon;

        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-7 h-7 rounded flex items-center justify-center ${meta.color}`}>
                <Icon size={14} />
              </div>
              <h2 className="text-base font-bold text-navy">{meta.label}</h2>
              <span className="text-xs text-gray-400">{items?.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items?.map((template) => (
                <div key={template.id} className="card group hover:border-teal hover:shadow-card-hover transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-navy text-sm group-hover:text-teal transition-colors">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {template.destination && (
                          <span className="text-xs text-gray-400">{template.destination}</span>
                        )}
                        {template.client_type && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                            {template.client_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <TemplateCopyButton content={template.content} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {totalCount === 0 && (
        <div className="card text-center py-12">
          <FileText size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No templates found</p>
          <p className="text-gray-400 text-xs mt-1">Templates are loaded automatically — check your database connection.</p>
        </div>
      )}
    </div>
  );
}
