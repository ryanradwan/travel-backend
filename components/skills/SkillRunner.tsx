"use client";

import { useState } from "react";
import { Wand2, Loader2, Copy, CheckCheck, RotateCcw, AlertTriangle } from "lucide-react";

interface SkillRunnerProps {
  skillId: string;
  skillName: string;
  inputs: Record<string, string>;
  outputDescription?: string;
}

export default function SkillRunner({ skillId, skillName, inputs, outputDescription }: SkillRunnerProps) {
  const inputKeys = Object.keys(inputs);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(inputKeys.map((k) => [k, ""]))
  );
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function runSkill() {
    setPhase("running");
    setOutput("");
    setError(null);

    try {
      const res = await fetch("/api/skills/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId, inputs: values }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Skill failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") { setPhase("done"); break; }
          try {
            const json = JSON.parse(payload);
            if (json.error) throw new Error(json.error);
            if (json.text) {
              result += json.text;
              setOutput(result);
            }
          } catch (e) {
            if (e instanceof Error && e.message !== "Unexpected end of JSON input") throw e;
          }
        }
      }
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase("idle");
    }
  }

  function reset() {
    setPhase("idle");
    setOutput("");
    setError(null);
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const canRun = inputKeys.every((k) => !inputs[k] || values[k]?.trim());

  return (
    <div className="space-y-5">
      {/* Input fields */}
      {inputKeys.length > 0 && (
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-navy">Fill in the details</h3>
          {inputKeys.map((key) => (
            <div key={key}>
              <label className="label capitalize">{key.replace(/_/g, " ")}</label>
              {inputs[key] && (
                <p className="text-xs text-gray-400 mb-1">{inputs[key]}</p>
              )}
              <textarea
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="input mt-0.5 resize-none"
                rows={2}
                placeholder={`Enter ${key.replace(/_/g, " ")}…`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Run button */}
      {phase === "idle" && (
        <button
          onClick={runSkill}
          disabled={!canRun}
          className="flex items-center gap-2 bg-teal text-white text-sm font-semibold px-5 py-2.5 rounded hover:bg-teal/90 disabled:opacity-50 transition-colors"
        >
          <Wand2 size={15} />
          Run {skillName}
        </button>
      )}

      {/* Output */}
      {(phase === "running" || phase === "done") && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy flex items-center gap-2">
              {phase === "running" && <Loader2 size={14} className="animate-spin text-teal" />}
              {outputDescription || "Output"}
            </h3>
            <div className="flex items-center gap-2">
              {phase === "done" && (
                <>
                  <button
                    onClick={copyOutput}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy transition-colors"
                  >
                    {copied ? <CheckCheck size={13} className="text-teal" /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy transition-colors ml-2"
                  >
                    <RotateCcw size={13} />
                    Run again
                  </button>
                </>
              )}
            </div>
          </div>

          {!output && phase === "running" && (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
              <Loader2 size={15} className="animate-spin" />
              Running…
            </div>
          )}

          {output && (
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed border-t border-border pt-3">
              {output}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
