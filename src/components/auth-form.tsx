"use client";

import { ArrowRight, LoaderCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { canUseSupabaseInBrowser, createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!canUseSupabaseInBrowser()) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      router.push(mode === "signup" ? "/onboarding" : "/hem");
      return;
    }

    const supabase = createClient();
    if (mode === "login") {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("Inloggningen misslyckades. Kontrollera e-post och lösenord.");
        setLoading(false);
        return;
      }
      router.push("/hem");
      router.refresh();
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/onboarding");
    } else {
      setMessage("Kontrollera din e-post och bekräfta kontot. Sedan fortsätter onboardingen.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <FormField label="E-post">
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="du@exempel.se"
          required
        />
      </FormField>
      <FormField
        label="Lösenord"
        hint={mode === "signup" ? "Minst 8 tecken. Använd gärna en lösenordshanterare." : undefined}
      >
        <Input
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </FormField>

      {error ? (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-danger dark:bg-red-950/30">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm leading-6">
          {message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <LoaderCircle className="animate-spin" aria-hidden="true" size={18} /> : <Mail aria-hidden="true" size={18} />}
        {loading ? "Ett ögonblick…" : mode === "login" ? "Logga in" : "Skapa konto"}
        {!loading ? <ArrowRight aria-hidden="true" size={18} /> : null}
      </Button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? "Har du inget konto?" : "Har du redan ett konto?"}{" "}
        <Link
          href={mode === "login" ? "/skapa-konto" : "/logga-in"}
          className="font-semibold text-foreground underline underline-offset-4"
        >
          {mode === "login" ? "Skapa ett" : "Logga in"}
        </Link>
      </p>
    </form>
  );
}
