"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const SKILL_LIMITS: Record<string, number> = {
  starter: 3,
  professional: 10,
  agency: Infinity,
  enterprise: Infinity,
};

const skillSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().min(10, "Description must be at least 10 characters").max(200),
  prompt_template: z.string().min(20, "Prompt template must be at least 20 characters"),
  input_fields: z.string().optional(),
  output_description: z.string().optional(),
});

async function checkSkillLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const supabase = createClient();

  const [userResult, countResult] = await Promise.all([
    supabase.from("users").select("subscription_tier").eq("id", userId).single(),
    supabase.from("custom_skills").select("id", { count: "exact" }).eq("user_id", userId),
  ]);

  const tier = (userResult.data as { subscription_tier: string } | null)?.subscription_tier ?? "starter";
  const used = countResult.count ?? 0;
  const limit = SKILL_LIMITS[tier] ?? 3;

  return { allowed: limit === Infinity || used < limit, used, limit };
}

export async function saveSkill(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const skillId = formData.get("skill_id") as string | null;

  // Only check limit when creating new skills
  if (!skillId) {
    const { allowed, limit } = await checkSkillLimit(user.id);
    if (!allowed) {
      redirect(`/dashboard/skills?error=limit&limit=${limit}`);
    }
  }

  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    prompt_template: formData.get("prompt_template"),
    input_fields: formData.get("input_fields") || undefined,
    output_description: formData.get("output_description") || undefined,
  };

  const parsed = skillSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/dashboard/skills/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  // Parse input fields JSON
  let inputs: Record<string, string> = {};
  if (parsed.data.input_fields) {
    try {
      const fields = parsed.data.input_fields.split("\n").filter(Boolean);
      fields.forEach((f) => {
        const [key, ...desc] = f.split(":");
        if (key) inputs[key.trim()] = desc.join(":").trim() || key.trim();
      });
    } catch {
      inputs = {};
    }
  }

  if (skillId) {
    await supabase.from("custom_skills").update({
      name: parsed.data.name,
      description: parsed.data.description,
      prompt_template: parsed.data.prompt_template,
      inputs,
      outputs: parsed.data.output_description ? { result: parsed.data.output_description } : {},
    }).eq("id", skillId).eq("user_id", user.id);
  } else {
    await supabase.from("custom_skills").insert({
      user_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      prompt_template: parsed.data.prompt_template,
      inputs,
      outputs: parsed.data.output_description ? { result: parsed.data.output_description } : {},
    });
  }

  redirect("/dashboard/skills");
}

export async function deleteSkill(formData: FormData): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const skillId = formData.get("skill_id") as string;
  if (!skillId) redirect("/dashboard/skills");

  await supabase.from("custom_skills").delete().eq("id", skillId).eq("user_id", user.id);
  redirect("/dashboard/skills");
}
