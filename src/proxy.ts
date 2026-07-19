import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = [
  "/hem",
  "/ritual",
  "/ai-chatt",
  "/mal",
  "/historik",
  "/utforska",
  "/bidra",
  "/premium",
  "/konto",
  "/installningar",
  "/admin",
];

const DEMO_USER_COOKIE = "pepply_demo_id";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const demoMode = process.env.PEPPLY_DEMO_MODE === "true";

  if (demoMode || !url || !key) {
    const existingId = request.cookies.get(DEMO_USER_COOKIE)?.value;
    if (!existingId || !UUID_PATTERN.test(existingId)) {
      const demoId = crypto.randomUUID();
      request.cookies.set(DEMO_USER_COOKIE, demoId);
      const demoResponse = NextResponse.next({ request });
      demoResponse.cookies.set(DEMO_USER_COOKIE, demoId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      return demoResponse;
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) =>
    path.startsWith(prefix),
  );

  if (isProtected && !user) {
    const login = new URL("/logga-in", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
