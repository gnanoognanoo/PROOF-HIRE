import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public assets and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Allow public unauthenticated routes
  const publicRoutes = ["/login", "/signup", "/feed"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Check for auth cookie (standard Supabase cookie or demo session)
  const hasAuth = request.cookies.get("sb-access-token") ||
    request.cookies.get("proofhire_auth") ||
    request.headers.get("authorization");

  // In production with live Supabase credentials, redirect unauthenticated users:
  // if (!hasAuth && pathname !== "/login" && pathname !== "/signup") {
  //   const loginUrl = new URL("/login", request.url);
  //   return NextResponse.redirect(loginUrl);
  // }

  // 4. Role-based route guard for /recruiter
  if (pathname.startsWith("/recruiter")) {
    const roleCookie = request.cookies.get("proofhire_role")?.value;
    // Allow access if role is recruiter or if in demo mode
    if (roleCookie && roleCookie !== "recruiter" && roleCookie !== "developer") {
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
