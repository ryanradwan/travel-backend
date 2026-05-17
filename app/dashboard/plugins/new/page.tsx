import { savePlugin } from "@/app/dashboard/plugins/actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface PageProps {
  searchParams: { error?: string };
}

export default function NewPluginPage({ searchParams }: PageProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/plugins" className="text-sm text-gray-400 hover:text-navy">← Custom plugins</Link>
        <h1 className="text-2xl font-bold text-navy mt-2">Add Custom Plugin</h1>
        <p className="text-gray-500 text-sm mt-1">
          Connect any external API to TravelBackend. Your API key is encrypted before storage.
        </p>
      </div>

      {searchParams.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}

      <form action={savePlugin} className="card space-y-5">
        <Input
          label="Plugin name"
          name="name"
          required
          placeholder="e.g. My Booking System"
          hint="A short name to identify this plugin in your skill library."
        />

        <Input
          label="API base URL"
          name="api_base_url"
          type="url"
          required
          placeholder="https://api.yoursystem.com/v1"
          hint="The root URL for the API. TravelBackend will make requests to endpoints under this URL."
        />

        <Input
          label="API key or token"
          name="api_key"
          type="password"
          placeholder="sk_live_..."
          hint="Encrypted before storage. Leave blank if the API is public."
        />

        <div>
          <label className="label">Permissions (optional)</label>
          <input
            type="text"
            name="permissions"
            className="input"
            placeholder="read:bookings, create:reservations, read:availability"
          />
          <p className="text-xs text-gray-400 mt-1">
            Comma-separated list of what TravelBackend is allowed to do with this plugin.
            Helps TravelBackend understand when to use it.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="teal" size="md">Save plugin</Button>
          <Link href="/dashboard/plugins">
            <Button variant="outline" size="md" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
