import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_COOKIE_NAME,
  DEMO_SESSION_TOKEN,
  createServerSupabaseClient,
  hasSupabaseEnv
} from "@/lib/supabase/client";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!hasSupabaseEnv()) {
    if (accessToken === DEMO_SESSION_TOKEN) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = createServerSupabaseClient(accessToken);

  if (!supabase) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
