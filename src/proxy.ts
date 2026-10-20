import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

// Fast redirect to the login page for signed-out visitors. Every admin page, action and
// download still checks the session against the database (src/lib/admin.ts).
const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname, search } = request.nextUrl;
  const signedIn = Boolean(request.auth?.user);

  // The login page decides itself (a cookie of a removed account must still reach it).
  if (pathname === "/admin/login") return NextResponse.next();
  if (!signedIn) {
    const login = new URL("/admin/login", request.nextUrl);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
