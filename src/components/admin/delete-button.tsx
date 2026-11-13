"use client";

import { useTransition } from "react";
import { dangerButton } from "./ui";

/** Asks for confirmation, then runs a server action that deletes the item and redirects. */
export function DeleteButton({ label, confirmText, action }: { label: string; confirmText: string; action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={dangerButton}
      onClick={() => {
        if (window.confirm(confirmText)) startTransition(() => action());
      }}
    >
      {pending ? "Siliniyor…" : label}
    </button>
  );
}
