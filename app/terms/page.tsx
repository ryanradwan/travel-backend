import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Service — TripDesk.ai" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-navy font-bold text-xl">TripDesk<span className="text-teal">.ai</span></Link>

        <h1 className="text-3xl font-bold text-navy mt-8 mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: May 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-navy">1. Acceptance of Terms</h2>
            <p>By accessing or using TripDesk.ai (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. TripDesk.ai is operated by TripDesk LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">2. Description of Service</h2>
            <p>TripDesk.ai is an AI-powered business operations platform built for US travel businesses. The Service uses artificial intelligence to assist with itinerary creation, destination research, proposal writing, and other travel business tasks.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">3. Subscriptions and Billing</h2>
            <p>The Service is available on a subscription basis. By providing a payment method, you authorize us to charge the applicable fees. All subscriptions include a 7-day free trial. Your credit card is collected at the start of the trial but not charged until the trial ends.</p>
            <p className="mt-2">You may cancel at any time. Cancellation takes effect at the end of your current billing period. No refunds are provided for partial periods.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">4. AI-Generated Content</h2>
            <p>TripDesk.ai uses AI to generate content including itineraries, proposals, destination research, and other outputs. You acknowledge that:</p>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>All dynamic information (visa requirements, travel advisories, prices) must be independently verified before sharing with clients</li>
              <li>TripDesk.ai is not responsible for decisions made based on AI-generated content</li>
              <li>You are responsible for reviewing all outputs before use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">5. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li>Violate any applicable law or regulation</li>
              <li>Process or store sensitive personal data beyond what is necessary</li>
              <li>Reverse engineer or attempt to extract the underlying AI models</li>
              <li>Resell or sublicense the Service without written permission</li>
              <li>Generate content that is fraudulent, misleading, or harmful</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">6. Data and Privacy</h2>
            <p>Your use of the Service is also governed by our <Link href="/privacy" className="text-teal hover:underline">Privacy Policy</Link>. We do not sell your data to third parties. Client data you enter into TripDesk.ai remains yours.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, TripDesk LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">8. Changes to Terms</h2>
            <p>We may update these Terms at any time. We will notify you by email at least 14 days before material changes take effect. Continued use of the Service after that date constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy">9. Contact</h2>
            <p>Questions about these Terms? Email us at <a href="mailto:legal@tripdesk.ai" className="text-teal hover:underline">legal@tripdesk.ai</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
