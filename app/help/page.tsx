import { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = { title: "Help & FAQ — TravelBackend.com" };

const FAQ = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "What is TravelBackend.com?",
        a: "TravelBackend.com is an AI-powered business operations platform built exclusively for US travel businesses. It helps travel agencies, independent advisors, and tour operators execute everyday tasks — from building client itineraries to publishing tour packages — through a conversational AI agent.",
      },
      {
        q: "How do I run my first task?",
        a: "Go to the Dashboard and click any Quick Action — 'Client Itinerary', 'Destination Report', or 'Tour Package'. Fill in the details and TravelBackend will work through each step, showing you progress in real time. You can also use 'Ask TravelBackend' for free-form questions.",
      },
      {
        q: "What's the difference between a question and a task?",
        a: "Questions are free and unlimited on all plans — ask anything conversational like 'What's the best time to visit Morocco?' or 'What does FIT mean?'. Tasks count against your monthly limit — these are actions that produce a structured deliverable (itinerary, proposal, report) or execute actions in connected apps.",
      },
    ],
  },
  {
    category: "Tasks & Workflows",
    questions: [
      {
        q: "How many tasks do I get per month?",
        a: "Starter: 30 tasks/month + 5 destination reports. Professional: 100 tasks/month + 15 destination reports. Agency: Unlimited tasks and reports. Tasks reset on the 1st of each month. If you run out, you can purchase top-up credits ($5 for 10 tasks on Starter, $4 on Professional) or upgrade your plan.",
      },
      {
        q: "What happens if a task fails?",
        a: "If a task fails before producing output, no task credit is deducted from your monthly limit. You'll see a plain-English explanation of what went wrong and suggested next steps. You can retry the task or contact support.",
      },
      {
        q: "Why did a workflow step get skipped?",
        a: "Workflow steps that require a connector (like saving to Google Drive) are automatically skipped if that connector isn't connected. You'll see a message explaining which connector is needed. Connect it in Settings → Connectors and re-run the workflow.",
      },
      {
        q: "Can I re-run a previous task?",
        a: "Yes. Go to Task History, find the task, and click 'View'. From there you can copy the output or start a new similar task. Full re-run automation is coming in a future update.",
      },
    ],
  },
  {
    category: "Connectors",
    questions: [
      {
        q: "How do connectors work?",
        a: "Connectors link TravelBackend to the apps you already use. Once connected, TravelBackend can take actions in those apps automatically — saving documents to Google Drive, drafting emails in Gmail, publishing pages to WordPress, and more.",
      },
      {
        q: "How many connectors do I get?",
        a: "Starter: 8 fixed connectors (Gmail, Google Drive, Google Calendar, Google Docs, WhatsApp, Canva, Skyscanner, Mailchimp). Professional: 8 fixed + choose any 12 from a library of 30 = 20 active. Agency: Unlimited across all connectors.",
      },
      {
        q: "A connector says it needs reconnecting — what do I do?",
        a: "Go to Settings → Connectors and click 'Reconnect' on the affected connector. This usually happens when an OAuth token expires (typically every 60 days for Google apps). It takes about 10 seconds to reconnect.",
      },
      {
        q: "Is my data safe when I connect an app?",
        a: "Yes. We use OAuth — TravelBackend never sees or stores your login passwords. Access tokens are encrypted before storage. You can disconnect any connector at any time and TravelBackend will immediately lose access to that app.",
      },
    ],
  },
  {
    category: "Billing & Plans",
    questions: [
      {
        q: "Do I need a credit card to start the trial?",
        a: "Yes, we collect your card at the start of the 7-day trial — but we do not charge it until the trial ends. You can cancel before the trial ends and pay nothing.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to Settings → Billing and click 'Manage billing'. This opens the Stripe billing portal where you can cancel. Your access continues until the end of your current billing period.",
      },
      {
        q: "Can I upgrade or downgrade my plan?",
        a: "Yes, at any time from Settings → Billing. Upgrades take effect immediately. Downgrades take effect at the start of the next billing period.",
      },
      {
        q: "What are top-up credits?",
        a: "If you run out of monthly tasks, you can buy additional credits without upgrading your plan. Starter: $5 for 10 tasks. Professional: $4 for 10 tasks. Agency plans include unlimited tasks so top-ups are not available.",
      },
    ],
  },
  {
    category: "AI & Accuracy",
    questions: [
      {
        q: "How accurate is the AI?",
        a: "TravelBackend is highly capable for travel industry tasks, but AI can make mistakes. All dynamic information — visa requirements, travel advisories, prices, availability — must be verified before sharing with clients. We include a compliance disclaimer on every travel-related output.",
      },
      {
        q: "Does TravelBackend learn from my business over time?",
        a: "Yes. TravelBackend builds an AI memory of your business — your preferred destinations, client types, workflow patterns, and past outputs. This memory is injected into every task so the AI gets smarter and more personalised the more you use it.",
      },
      {
        q: "Will TravelBackend book trips or process payments?",
        a: "No. TravelBackend researches, writes, and organises — it does not make actual bookings or process financial transactions on your behalf. All bookings and payments remain under your control.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-navy font-bold text-xl">
          TravelBackend<span className="text-teal">.ai</span>
        </Link>

        <div className="mt-8 mb-10 text-center">
          <h1 className="text-3xl font-bold text-navy">Help & FAQ</h1>
          <p className="text-gray-500 mt-2">Everything you need to get the most out of TravelBackend.com</p>
          <p className="text-sm text-gray-400 mt-2">
            Can&apos;t find your answer?{" "}
            <a href="mailto:support@travelbackend.com" className="text-teal hover:underline">
              Email support →
            </a>
          </p>
        </div>

        <div className="space-y-8">
          {FAQ.map((section) => (
            <div key={section.category}>
              <h2 className="text-base font-bold text-navy mb-3 pb-2 border-b border-border">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.questions.map(({ q, a }) => (
                  <details key={q} className="card group cursor-pointer">
                    <summary className="flex items-center justify-between list-none">
                      <span className="font-medium text-navy text-sm">{q}</span>
                      <ChevronDown
                        size={16}
                        className="text-gray-400 flex-shrink-0 ml-2 group-open:rotate-180 transition-transform"
                      />
                    </summary>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 card text-center">
          <p className="text-sm font-semibold text-navy mb-1">Still need help?</p>
          <p className="text-sm text-gray-500 mb-3">Our team responds within 48 hours on Starter, 24 hours on Professional, and same day on Agency.</p>
          <a
            href="mailto:support@travelbackend.com"
            className="btn-teal text-sm px-4 py-2 rounded inline-block"
          >
            Email support
          </a>
        </div>
      </div>
    </div>
  );
}
