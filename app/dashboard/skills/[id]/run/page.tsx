import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import SkillRunner from "@/components/skills/SkillRunner";

export default async function RunSkillPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("custom_skills")
    .select("id, name, description, inputs, outputs")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!data) notFound();

  const skill = data as {
    id: string;
    name: string;
    description: string;
    inputs: Record<string, string>;
    outputs: Record<string, string>;
  };

  const outputDescription = skill.outputs?.result ?? "";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/skills" className="text-sm text-gray-400 hover:text-navy">
            ← Custom skills
          </Link>
          <h1 className="text-2xl font-bold text-navy mt-2">{skill.name}</h1>
          {skill.description && (
            <p className="text-gray-500 text-sm mt-1">{skill.description}</p>
          )}
        </div>
        <Link
          href={`/dashboard/skills/${skill.id}`}
          className="shrink-0 text-sm text-gray-400 border border-border rounded px-3 py-1.5 hover:text-navy transition-colors"
        >
          Edit skill
        </Link>
      </div>

      <SkillRunner
        skillId={skill.id}
        skillName={skill.name}
        inputs={skill.inputs}
        outputDescription={outputDescription}
      />
    </div>
  );
}
