"use client";

import { useState } from "react";

export function CopyCompanyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-paper" onClick={copy} type="button">
      {copied ? "Copiado" : "Copiar ID"}
    </button>
  );
}
