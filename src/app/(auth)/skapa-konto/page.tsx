import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Skapa konto" };

export default function SignupPage() {
  return (
    <Card className="shadow-soft w-full max-w-md p-6 sm:p-8">
      <p className="text-sm font-semibold text-brand-strong">Ungefär två minuter</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Gör Pepply till ditt.</h1>
      <p className="mt-3 leading-7 text-muted">
        Skapa kontot först. Sedan väljer du ton, teman och när din lugna minut passar.
      </p>
      <AuthForm mode="signup" />
      <p className="mt-6 text-center text-xs leading-5 text-muted">
        Genom att skapa ett konto godkänner du våra{" "}
        <Link href="/villkor" className="underline underline-offset-3">villkor</Link> och bekräftar att du läst vår{" "}
        <Link href="/integritet" className="underline underline-offset-3">integritetspolicy</Link>.
      </p>
    </Card>
  );
}
