import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/clients",
  "/contractors",
  "/timecard",
  "/reports",
  "/exports",
  "/settings",
  "/documents",
  "/admin",
  "/client-portal"
];
const authRoutes = ["/login", "/register", "/forgot-password"];
type CookieToSet = { name: string; value: string; options: CookieOptions };

function isSupabaseAuthCookie(name: string) {
  return name.startsWith("sb-") && (name.includes("auth-token") || name.includes("code-verifier"));
}

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies
    .getAll()
    .filter((cookie) => isSupabaseAuthCookie(cookie.name))
    .forEach((cookie) => {
      request.cookies.delete(cookie.name);
      response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
    });
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("redirectedFrom", pathname);
  const redirectResponse = NextResponse.redirect(redirectUrl);
  clearSupabaseAuthCookies(request, redirectResponse);
  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = pathname === "/" || authRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  }) as SupabaseClient<Database>;

  let user = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    clearSupabaseAuthCookies(request, response);
    if (isProtected) {
      return redirectToLogin(request, pathname);
    }
    return response;
  }

  if (!user && isProtected) {
    return redirectToLogin(request, pathname);
  }

  if (user && pathname.startsWith("/admin")) {
    let profile = null;
    try {
      const { data } = await supabase.from("profiles").select("role, user_type").eq("id", user.id).maybeSingle();
      profile = data;
    } catch {
      profile = null;
    }
    if (profile?.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && pathname.startsWith("/client-portal")) {
    let profile = null;
    try {
      const { data } = await supabase.from("profiles").select("role, user_type").eq("id", user.id).maybeSingle();
      profile = data;
    } catch {
      profile = null;
    }
    if (profile?.role !== "admin" && profile?.user_type !== "client_company" && profile?.user_type !== "both") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && pathname.startsWith("/contractors")) {
    let profile = null;
    try {
      const { data } = await supabase.from("profiles").select("role, user_type").eq("id", user.id).maybeSingle();
      profile = data;
    } catch {
      profile = null;
    }
    if (profile?.role !== "admin" && profile?.user_type === "client_company") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/client-portal/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && isProtected && !pathname.startsWith("/admin")) {
    let profile = null;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role, user_type, account_status, subscription_status")
        .eq("id", user.id)
        .maybeSingle();
      profile = data;
    } catch {
      profile = null;
    }
    const isAccountBlocked = profile?.account_status === "blocked" || profile?.account_status === "suspended";
    const isSubscriptionBlocked = profile?.subscription_status === "past_due" || profile?.subscription_status === "cancelled";

    if (profile?.role !== "admin" && (isAccountBlocked || isSubscriptionBlocked)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/account-blocked";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (profile?.role !== "admin" && profile?.user_type === "client_company" && !pathname.startsWith("/client-portal")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/client-portal/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|icon.svg|manifest.webmanifest).*)"]
};
