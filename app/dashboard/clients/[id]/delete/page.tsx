import { deleteClientAction } from "@/app/dashboard/clients/actions";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function DeleteClientPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="card text-center">
        <h2 className="text-lg font-bold text-navy mb-2">Delete this client?</h2>
        <p className="text-gray-500 text-sm mb-6">
          This cannot be undone. All data for this client will be permanently removed.
        </p>
        <div className="flex gap-3 justify-center">
          <form action={deleteClientAction}>
            <input type="hidden" name="client_id" value={params.id} />
            <Button type="submit" variant="danger" size="md">Yes, delete</Button>
          </form>
          <Link href={"/dashboard/clients/" + params.id}>
            <Button variant="outline" size="md" type="button">Cancel</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
