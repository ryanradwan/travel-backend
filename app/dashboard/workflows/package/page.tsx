import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WorkflowRunner from "@/components/workflows/WorkflowRunner";

export default async function PackageWorkflowPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <WorkflowRunner workflowId="package" />;
}
