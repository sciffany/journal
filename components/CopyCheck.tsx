"use client";

import { useState } from "react";

const CHECK = "✅";

export function CopyCheck() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CHECK);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied check mark" : "Copy check mark"}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-neutral-200 bg-transparent px-3 text-sm transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-neutral-800 dark:hover:bg-neutral-900 dark:focus-visible:ring-neutral-600"
    >
      <span className="select-all text-base leading-none">{CHECK}</span>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
