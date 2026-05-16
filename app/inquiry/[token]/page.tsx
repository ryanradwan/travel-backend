import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import InquiryForm from "@/components/inbox/InquiryForm";

interface PageProps { params: { token: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("business_profiles")
    .select("business_name")
    .eq("inquiry_token", params.token)
    .single();

  const name = (data as { business_name: string } | null)?.business_name ?? "Travel Inquiry";
  return { title: `Travel Inquiry — ${name}` };
}

export default async function InquiryPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("business_name, brand_color, brand_logo_url, brand_tagline")
    .eq("inquiry_token", params.token)
    .single();

  if (!profile) notFound();

  const p = profile as {
    business_name: string;
    brand_color: string | null;
    brand_logo_url: string | null;
    brand_tagline: string | null;
  };

  const accent = p.brand_color ?? "#0E7C7B";
  const navy = "#0B2D56";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ backgroundColor: navy }} className="py-8 px-4 text-center">
        {p.brand_logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.brand_logo_url} alt={p.business_name} className="h-12 mx-auto mb-3 object-contain" />
        ) : (
          <p className="text-white text-2xl font-bold">{p.business_name}</p>
        )}
        {p.brand_tagline && (
          <p className="text-blue-300 text-sm mt-1">{p.brand_tagline}</p>
        )}
      </div>

      {/* Form card */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Plan your next trip</h1>
          <p className="text-gray-500 text-sm mb-6">
            Fill in as much or as little as you know — we will take it from there.
          </p>
          <InquiryForm
            token={params.token}
            businessName={p.business_name}
            brandColor={accent}
          />
        </div>
      </div>
    </div>
  );
}
