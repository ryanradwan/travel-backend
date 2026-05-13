// Determines whether a user message is a billable task or a free question.
//
// Tasks produce a structured deliverable or execute an app action.
// Questions get a conversational answer — free and unlimited on all tiers.

const TASK_PHRASES = [
  // Itinerary / proposal
  "build", "create", "write", "draft", "make", "generate", "put together",
  "design", "plan", "prepare", "develop", "set up",
  // Research outputs
  "research", "compile", "produce", "pull together", "find me",
  // App actions
  "save to", "publish", "upload", "post to", "send", "add to",
  "open canva", "open wordpress", "update",
  // Document types that indicate deliverables
  "itinerary", "proposal", "invoice", "report", "package", "brochure",
  "email template", "social post", "announcement", "campaign",
];

const QUESTION_SIGNALS = [
  "what", "how", "why", "when", "where", "who", "which", "is ", "are ",
  "can you explain", "tell me", "do you know", "what's", "what is",
  "how do", "how does", "should i", "would you", "could you tell",
  "difference between", "best way to", "tips for", "advice on",
];

export function classifyIntent(input: string): "task" | "question" {
  const lower = input.toLowerCase().trim();

  // Very short inputs are almost always questions
  if (lower.split(" ").length < 6) return "question";

  // Strong task signals — check these first
  for (const phrase of TASK_PHRASES) {
    if (lower.includes(phrase)) return "task";
  }

  // If it starts with a question word or pattern, it's a question
  for (const signal of QUESTION_SIGNALS) {
    if (lower.startsWith(signal)) return "question";
  }

  // Ends with a question mark = question
  if (lower.endsWith("?")) return "question";

  // Longer structured requests without question signals default to task
  if (lower.split(" ").length > 15) return "task";

  return "question";
}
