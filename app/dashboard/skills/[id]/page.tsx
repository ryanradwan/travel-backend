import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { saveSkill, deleteSkill } from "@/app/dashboard/skills/actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default async function EditSkillPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("custom_skills")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!data) notFound();

  const skill = data as {
    id: string; name: string; description: string;
    prompt_template: string; inputs: Record<string, string>;
    outputs: Record<string, string>;
  };

  const inputFieldsText = Object.entries(skill.inputs)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const outputDescription = skill.outputs?.result ?? "";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard/skills" className="text-sm text-gray-400 hover:text-navy">← Custom skills</Link>
          <h1 className="text-2xl font-bold text-navy mt-2">{skill.name}</h1>
        </div>
        <Link href={`/dashboard/chat?skill=${skill.id}`} className="btn-teal text-sm px-4 py-2 rounded">
          Run skill →
        </Link>
      </div>

      <form action={saveSkill} className="card space-y-5">
        <input type="hidden" name="skill_id" value={skill.id} />

        <Input label="Skill name" name="name" required defaultValue={skill.name} />
        <Input label="What does this skill do?" name="description" required defaultValue={skill.description} />

        <div>
          <label className="label">Input fields</label>
          <textarea
            name="input_fields"
            className="input resize-none"
            rows={4}
            defaultValue={inputFieldsText}
          />
          <p className="text-xs text-gray-400 mt-1">
            One per line: <code className="bg-gray-100 px-1 rounded">field_name: description</code>
          </p>
        </div>

        <div>
          <label className="label">Prompt template</label>
          <textarea
            name="prompt_template"
            className="input resize-none font-mono text-sm"
            rows={8}
            required
            defaultValue={skill.prompt_template}
          />
        </div>

        <Input
          label="Output description (optional)"
          name="output_description"
          defaultValue={outputDescription}
        />

        <div className="flex items-center justify-between pt-2">
          <Button type="submit" variant="teal" size="md">Save changes</Button>
          <form action={deleteSkill}>
            <input type="hidden" name="skill_id" value={skill.id} />
            <Button type="submit" variant="danger" size="sm">Delete skill</Button>
          </form>
        </div>
      </form>
    </div>
  );
}
