import { saveSkill } from "@/app/dashboard/skills/actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface PageProps {
  searchParams: { error?: string };
}

export default function NewSkillPage({ searchParams }: PageProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/skills" className="text-sm text-gray-400 hover:text-navy">← Custom skills</Link>
        <h1 className="text-2xl font-bold text-navy mt-2">New Custom Skill</h1>
        <p className="text-gray-500 text-sm mt-1">
          A skill is a reusable AI prompt tailored to a specific task your business does repeatedly.
        </p>
      </div>

      {searchParams.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}

      <form action={saveSkill} className="card space-y-5">
        <Input
          label="Skill name"
          name="name"
          required
          placeholder="e.g. Write luxury honeymoon proposal"
          hint="Short and action-oriented — this is what you'll see in your skill library."
        />

        <Input
          label="What does this skill do?"
          name="description"
          required
          placeholder="e.g. Writes a high-end honeymoon proposal in our brand voice with romantic language and luxury hotel suggestions."
          hint="1-2 sentences. Helps you remember what this skill is for."
        />

        <div>
          <label className="label">Input fields</label>
          <textarea
            name="input_fields"
            className="input resize-none"
            rows={4}
            placeholder={`client_name: Full name of the client\ndestination: Where they want to go\nbudget: Their total budget in USD\nduration: Number of nights`}
          />
          <p className="text-xs text-gray-400 mt-1">
            One per line in format: <code className="bg-gray-100 px-1 rounded">field_name: description</code>.
            These become the variables TripDesk fills in when running this skill.
          </p>
        </div>

        <div>
          <label className="label">Prompt template</label>
          <textarea
            name="prompt_template"
            className="input resize-none font-mono text-sm"
            rows={8}
            required
            placeholder={`You are a luxury travel advisor writing a honeymoon proposal for {{client_name}}.

Destination: {{destination}}
Budget: {{budget}}
Duration: {{duration}} nights

Write a romantic, aspirational proposal that:
- Opens with an emotional hook about the destination
- Recommends 2-3 luxury hotels with specific reasons
- Includes a day-by-day highlights overview
- Closes with next steps and a payment deposit request

Use warm, elevated language. Sign off as their dedicated travel advisor.`}
          />
          <p className="text-xs text-gray-400 mt-1">
            Use <code className="bg-gray-100 px-1 rounded">{`{{field_name}}`}</code> to reference your input fields.
          </p>
        </div>

        <Input
          label="Output description (optional)"
          name="output_description"
          placeholder="e.g. A complete luxury honeymoon proposal ready to send to the client."
          hint="Describes what this skill produces — shown in your skill library."
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="teal" size="md">Save skill</Button>
          <Link href="/dashboard/skills">
            <Button variant="outline" size="md" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
