"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlockWrapper({
  children,
  language,
  ...props
}: React.HTMLAttributes<HTMLPreElement> & { language?: string }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = preRef.current?.innerText ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border border-[#303A44] bg-[#0C1014]">
      <div className="flex items-center justify-between border-b border-[#242D37] bg-[#14191F] px-3.5 py-2">
        <span className="font-mono text-xs text-[#AAB4BE]">
          {language || "terminal"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code block"
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-[#AAB4BE] hover:bg-[#202831] hover:text-[#F3F4F6] transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#22C55E]" aria-hidden="true" />
              <span className="text-[#22C55E]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre
        ref={preRef}
        {...props}
        className="overflow-x-auto p-4 text-sm leading-relaxed text-[#E5E7EB]"
      >
        {children}
      </pre>
    </div>
  );
}
