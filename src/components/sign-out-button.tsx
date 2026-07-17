"use client";

import { LogOut, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  canUseSupabaseInBrowser,
  createClient,
} from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);

    if (canUseSupabaseInBrowser()) {
      await createClient().auth.signOut();
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="mt-5 text-muted"
      onClick={signOut}
      disabled={pending}
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
      ) : (
        <LogOut aria-hidden="true" size={18} />
      )}
      {pending ? "Loggar ut…" : "Logga ut"}
    </Button>
  );
}
