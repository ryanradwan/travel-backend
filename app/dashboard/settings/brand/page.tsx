import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { saveBrandSettings } from "./actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface PageProps { searchParams: { saved?: string; error?: string } }

export default async function BrandSettingsPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("business_name, brand_color, brand_logo_url, brand_tagline, contact_phone, contact_email, website_url")
    .eq("user_id", user.id)
    .single();

  const p = profile as {
    business_name: string; brand_color: string | null; brand_logo_url: string | null;
    brand_tagline: string | null; contact_phone: string | null;
    contact_email: string | null; website_url: string | null;
  } | null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Brand Settings</h2>
        <p className="text-gray-500 text-sm mt-1">
          Used on PDF proposals and the client portal. Clients will see your brand, not TripDesk.
        </p>
      </div>

      {searchParams.saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          Brand settings saved successfully.
        </div>
      )}
      {searchParams.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}

      <form action={saveBrandSettings} className="card space-y-5">
        {/* Colour preview */}
        <div>
          <label className="label">Brand colour</label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="color"
              name="brand_color"
              defaultValue={p?.brand_color ?? "#0E7C7B"}
              className="w-12 h-10 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              name="brand_color"
              defaultValue={p?.brand_color ?? "#0E7C7B"}
              placeholder="#0E7C7B"
              className="input w-32 font-mono text-sm"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
            <span className="text-xs text-gray-400">Used as the accent colour on PDFs and the client portal</span>
          </div>
        </div>

        <Input
          label="Logo URL"
          name="brand_logo_url"
          type="url"
          defaultValue={p?.brand_logo_url ?? ""}
          placeholder="https://youragency.com/logo.png"
          hint="Direct link to your logo image (PNG or SVG). Upload to Google Drive or Dropbox and paste the public link."
        />

        <Input
          label="Tagline (optional)"
          name="brand_tagline"
          defaultValue={p?.brand_tagline ?? ""}
          placeholder="e.g. Crafting unforgettable journeys since 2012"
          hint="Appears below your business name on proposals."
        />

        <div className="border-t border-border pt-5">
          <p className="text-sm font-semibold text-navy mb-4">Contact details — shown on proposals</p>
          <div className="space-y-4">
            <Input label="Phone" name="contact_phone" defaultValue={p?.contact_phone ?? ""} placeholder="+1 (212) 555-0100" />
            <Input label="Email" name="contact_email" type="email" defaultValue={p?.contact_email ?? ""} placeholder="hello@youragency.com" />
            <Input label="Website" name="website_url" type="url" defaultValue={p?.website_url ?? ""} placeholder="https://youragency.com" />
          </div>
        </div>

        {/* Preview card */}
        <div className="border-t border-border pt-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Preview — proposal header</p>
          <div className="rounded-lg border border-border p-5 bg-gray-50">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: p?.brand_color ?? "#0E7C7B" }}
              >
                {(p?.business_name ?? "A").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-navy text-sm">{p?.business_name ?? "Your Agency"}</p>
                <p className="text-xs text-gray-400">{p?.brand_tagline ?? "Your tagline appears here"}</p>
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" variant="teal" size="md">Save brand settings</Button>
      </form>
    </div>
  );
}
