import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must call getUser() not getSession() to avoid stale data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/auth");
  const isInviteRoute = pathname.startsWith("/invite");
  // Public link-resolver routes — must never be auth-gated. `/join/[code]` is
  // the open household-join landing page (tapped by people without the app);
  // `/.well-known/*` serves the iOS/Android app-link verification files.
  const isJoinRoute = pathname.startsWith("/join");
  const isWellKnownRoute = pathname.startsWith("/.well-known");

  if (!user && !isAuthRoute && !isInviteRoute && !isJoinRoute && !isWellKnownRoute) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (user && isAuthRoute) {
    // Preserve redirect param so post-auth lands on the right page
    const redirect = request.nextUrl.searchParams.get("redirect");
    const target = redirect && redirect.startsWith("/") ? redirect : "/home";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2|woff|ttf|otf)$).*)",
  ],
};
