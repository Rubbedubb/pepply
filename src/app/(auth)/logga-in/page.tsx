import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Logga in" };

export default function LoginPage() {
  return (
    <Card className="shadow-soft w-full max-w-md p-6 sm:p-8">
      <p className="text-sm font-semibold text-brand-strong">Välkommen tillbaka</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Din minut väntar.</h1>
      <p className="mt-3 leading-7 text-muted">Logga in när du vill landa för kvällen.</p>
      <AuthForm mode="login" />
    </Card>
  );
}
