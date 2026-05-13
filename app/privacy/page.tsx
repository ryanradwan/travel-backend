import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy — TripDesk.ai" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-navy font-bold text-xl">TripDesk<span className="text-teal">.ai</span></Link>

        <h1 className="text-3xl font-bold text-navy mt-8 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: May 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-navy">1. Information We Collect</h2>
            <p>We collect information you provide directly:</p>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li><strong>Account data:</strong> Email address, business name, and business profile information</li>
              <li><strong>Client data:</strong> Client names, email addresses, and travel preferences you enter into the platform</li>
              <li><strong>Task data:</strong> Your inputs to the AI agent and the outputs generated</li>
              <li><strong>Payment data:</strong> Processed by Stripe — we do not store card numbers</li>
              <li><strong>Usage data:</strong> How you use the Service, features accessed, and task counts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">2. How We Use Your Information</h2>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li>To provide and improve the Service</li>
              <li>To personalise AI responses using your business profile and history</li>
              <li>To send transactional emails (confirmations, receipts, trial reminders)</li>
              <li>To send product update emails (you can opt out at any time)</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">3. AI and Your Data</h2>
            <p>Your inputs to TripDesk.ai are sent to Anthropic's Claude API to generate responses. Anthropic's use of this data is governed by their privacy policy. We do not use your data to train AI models without your explicit consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">4. Data Sharing</h2>
            <p>We do not sell your data. We share data only with:</p>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li><strong>Anthropic</strong> — to power AI responses</li>
              <li><strong>Supabase</strong> — database and authentication infrastructure</li>
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Vercel</strong> — hosting and infrastructure</li>
            </ul>
            <p className="mt-2">All sub-processors are GDPR-compliant and operate under data processing agreements.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">5. Data Retention</h2>
            <p>We retain your account and task data for as long as your account is active. If you cancel, we retain your data for 30 days before deletion. You may request immediate deletion by contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">6. Security</h2>
            <p>We encrypt sensitive data (OAuth tokens, API credentials) before storage. All data is transmitted over HTTPS. Row-level security ensures users can only access their own data.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">7. Your Rights</h2>
            <p>You have the right to access, correct, export, or delete your data at any time. Contact us at <a href="mailto:privacy@tripdesk.ai" className="text-teal hover:underline">privacy@tripdesk.ai</a> to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">8. Cookies</h2>
            <p>We use essential cookies for authentication only. We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">9. Contact</h2>
            <p>Privacy questions: <a href="mailto:privacy@tripdesk.ai" className="text-teal hover:underline">privacy@tripdesk.ai</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
