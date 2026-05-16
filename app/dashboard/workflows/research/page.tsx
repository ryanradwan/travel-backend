import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WorkflowRunner from "@/components/workflows/WorkflowRunner";

interface PageProps { searchParams: { destination?: string } }

export default async function ResearchWorkflowPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <WorkflowRunner workflowId="research" prefillInput={searchParams.destination} />;
}
