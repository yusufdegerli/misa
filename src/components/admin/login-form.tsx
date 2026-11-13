"use client";

import { useActionState } from "react";
import { signIn, type FormState } from "@/lib/admin/actions";
import { Field, TextInput, primaryButton } from "./ui";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, {});
  return (
    <form action={action} className="flex flex-col gap-5">
      <Field label="E-posta">
        <TextInput name="email" type="email" autoComplete="username" required />
      </Field>
      <Field label="Şifre">
        <TextInput name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
