import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!req.auth) {
    if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/calendario") || pathname.startsWith("/matches/")) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = req.auth.user?.role;

  if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register")) {
    let dest = "/dashboard";
    if (role === "COACH" || role === "SUPER_ADMIN") dest = "/coach";
    if (role === "SUPER_ADMIN") dest = "/admin";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/coach") && role !== "COACH" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
