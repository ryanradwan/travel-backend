import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wand2, Plus, Lock } from "lucide-react";

const SKILL_LIMITS: Record<string, number> = {
  starter: 3, professional: 10, agency: Infinity, enterprise: Infinity,
};

interface PageProps {
  searchParams: { error?: string; limit?: string };
}

export default async function SkillsPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [userResult, skillsResult] = await Promise.all([
    supabase.from("users").select("subscription_tier").eq("id", user.id).single(),
    supabase.from("custom_skills").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const tier = (userResult.data as { subscription_tier: string } | null)?.subscription_tier ?? "starter";
  const skills = (skillsResult.data ?? []) as {
    id: string; name: string; description: string;
    prompt_template: string; inputs: Record<string, string>;
    created_at: string;
  }[];

  const limit = SKILL_LIMITS[tier] ?? 3;
  const isUnlimited = limit === Infinity;
  const atLimit = !isUnlimited && skills.length >= limit;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Custom Skills</h1>
          <p className="text-gray-500 text-sm mt-1">
            Build reusable AI skills tailored to your travel business.
            {!isUnlimited && (
              <span className="ml-1 text-gray-400">
                {skills.length} of {limit} used.
              </span>
            )}
          </p>
        </div>
        {atLimit ? (
          <Link
            href="/dashboard/settings/billing"
            className="flex items-center gap-2 text-sm border border-border rounded px-4 py-2 text-gray-400 hover:text-navy transition-colors"
          >
            <Lock size={14} />
            Upgrade for more
          </Link>
        ) : (
          <Link
            href="/dashboard/skills/new"
            className="btn-teal flex items-center gap-2 text-sm px-4 py-2 rounded"
          >
            <Plus size={16} />
            New skill
          </Link>
        )}
      </div>

      {searchParams.error === "limit" && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700">
          You&apos;ve reached the {searchParams.limit}-skill limit on your current plan.{" "}
          <Link href="/dashboard/settings/billing" className="underline font-medium">Upgrade to add more.</Link>
        </div>
      )}

      {skills.length === 0 ? (
        <div className="card text-center py-12">
          <Wand2 size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No custom skills yet</p>
          <p className="text-gray-400 text-xs mt-1 mb-4 max-w-sm mx-auto">
            Custom skills are reusable prompts built around your business — like a
            &quot;Write a luxury proposal&quot; skill or a &quot;Check visa requirements for my clients&quot; shortcut.
          </p>
          <Link href="/dashboard/skills/new" className="btn-teal text-sm px-4 py-2 rounded inline-block">
            Build your first skill
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <Link
              key={skill.id}
              href={`/dashboard/skills/${skill.id}`}
              className="card hover:border-teal hover:shadow-card-hover transition-all group"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <Wand2 size={16} className="text-teal" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-navy group-hover:text-teal transition-colors truncate">
                    {skill.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{skill.description}</p>
                </div>
              </div>
              {Object.keys(skill.inputs).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.keys(skill.inputs).slice(0, 3).map((k) => (
                    <span key={k} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      {k}
                    </span>
                  ))}
                  {Object.keys(skill.inputs).length > 3 && (
                    <span className="text-xs text-gray-400">+{Object.keys(skill.inputs).length - 3} more</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-400">
          {tier === "starter" && "Starter: 3 custom skills · "}
          {tier === "professional" && "Professional: 10 custom skills · "}
          <Link href="/dashboard/settings/billing" className="text-teal hover:underline">
            {tier === "agency" || tier === "enterprise" ? "Unlimited on Agency" : "Upgrade for more"}
          </Link>
        </p>
      </div>
    </div>
  );
}
