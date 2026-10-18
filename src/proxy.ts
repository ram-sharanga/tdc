import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/jwt";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const onLogin = req.nextUrl.pathname === "/login";

  if (!session && !onLogin)
    return NextResponse.redirect(new URL("/login", req.url));
  if (session && onLogin)
    return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}

// Skip API routes (they return 401 themselves), static files and images.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
