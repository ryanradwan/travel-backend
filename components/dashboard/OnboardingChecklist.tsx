"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X, Sparkles } from "lucide-react";

interface Step {
  id: string;
  label: string;
  desc: string;
  href: string;
  done: boolean;
}

interface OnboardingChecklistProps {
  steps: Step[];
}

const DISMISS_KEY = "tb_onboarding_dismissed";

export default function OnboardingChecklist({ steps }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const pct = Math.round((doneCount / steps.length) * 100);

  // Auto-dismiss when all steps complete (after a short delay to show 100%)
  useEffect(() => {
    if (allDone && mounted) {
      const t = setTimeout(() => {
        localStorage.setItem(DISMISS_KEY, "1");
        setDismissed(true);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [allDone, mounted]);

  if (!mounted || dismissed) return null;

  return (
    <div className="border border-teal/30 bg-gradient-to-r from-teal/5 to-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
            <Sparkles size={15} className="text-teal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-navy">
                {allDone ? "You're all set! 🎉" : "Get set up — 5 quick steps"}
              </p>
              {!allDone && (
                <span className="text-xs font-semibold text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                  {doneCount}/{steps.length} done
                </span>
              )}
            </div>
            {/* Progress bar */}
            <div className="mt-1.5 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 text-gray-400 hover:text-navy transition-colors rounded"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={() => {
              localStorage.setItem(DISMISS_KEY, "1");
              setDismissed(true);
            }}
            className="p-1.5 text-gray-400 hover:text-navy transition-colors rounded"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border-t border-teal/10 pt-4">
          {steps.map((step) => (
            <Link
              key={step.id}
              href={step.done ? "#" : step.href}
              onClick={step.done ? (e) => e.preventDefault() : undefined}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors group ${
                step.done
                  ? "opacity-60 cursor-default"
                  : "hover:bg-teal/5 cursor-pointer"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.done
                  ? <CheckCircle2 size={18} className="text-teal" />
                  : <Circle size={18} className="text-gray-300 group-hover:text-teal transition-colors" />
                }
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium leading-tight ${step.done ? "text-gray-400 line-through" : "text-navy group-hover:text-teal transition-colors"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
