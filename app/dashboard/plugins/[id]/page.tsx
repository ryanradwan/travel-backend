import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { savePlugin, deletePlugin } from "@/app/dashboard/plugins/actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default async function EditPluginPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("custom_plugins")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!data) notFound();

  const plugin = data as {
    id: string; name: string; api_base_url: string;
    permissions: string[]; status: string;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/plugins" className="text-sm text-gray-400 hover:text-navy">← Custom plugins</Link>
        <h1 className="text-2xl font-bold text-navy mt-2">{plugin.name}</h1>
      </div>

      <form action={savePlugin} className="card space-y-5">
        <input type="hidden" name="plugin_id" value={plugin.id} />

        <Input label="Plugin name" name="name" required defaultValue={plugin.name} />
        <Input label="API base URL" name="api_base_url" type="url" required defaultValue={plugin.api_base_url} />
        <Input
          label="API key or token"
          name="api_key"
          type="password"
          placeholder="Leave blank to keep existing key"
          hint="Only enter a value to replace the existing key."
        />

        <div>
          <label className="label">Permissions</label>
          <input
            type="text"
            name="permissions"
            className="input"
            defaultValue={plugin.permissions.join(", ")}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button type="submit" variant="teal" size="md">Save changes</Button>
          <form action={deletePlugin}>
            <input type="hidden" name="plugin_id" value={plugin.id} />
            <Button type="submit" variant="danger" size="sm">Delete plugin</Button>
          </form>
        </div>
      </form>
    </div>
  );
}
