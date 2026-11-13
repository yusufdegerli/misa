import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/brand";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3">
          <Logo size="lg" />
          <p className="text-sm text-steel">Yönetim paneli</p>
        </div>
        <div className="rounded-2xl border border-hairline bg-tile p-7">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
