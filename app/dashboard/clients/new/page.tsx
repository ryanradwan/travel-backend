import { saveClient } from "@/app/dashboard/clients/actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/clients" className="text-sm text-gray-400 hover:text-navy">← Back to clients</Link>
        <h1 className="text-2xl font-bold text-navy mt-2">Add New Client</h1>
      </div>

      <form action={saveClient} className="card space-y-4">
        <Input label="Full name" name="name" required placeholder="Sarah Johnson" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Email" name="email" type="email" placeholder="sarah@email.com" />
          <Input label="Phone" name="phone" type="tel" placeholder="+1 (305) 000-0000" />
        </div>
        <Input
          label="Nationality / Passport"
          name="nationality"
          placeholder="US (American)"
          hint="Used for visa requirement checks"
        />
        <div>
          <label className="label">Travel preferences</label>
          <textarea
            name="preferences"
            className="input resize-none"
            rows={3}
            placeholder="Loves luxury hotels, prefers direct flights, allergic to shellfish, travels with 2 kids aged 8 and 11…"
          />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            name="notes"
            className="input resize-none"
            rows={2}
            placeholder="Referred by John Smith. Birthday in March…"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="teal" size="md">Save client</Button>
          <Link href="/dashboard/clients">
            <Button variant="outline" size="md" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
