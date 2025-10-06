// /middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Example: Protect a dashboard specific to cabinets
    if (pathname.startsWith("/cabinet-dashboard")) {
      if (token?.accountType !== "CABINET") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Example: Protect an admin-only area within a cabinet's space
    if (pathname.startsWith("/cabinet-dashboard/admin")) {
        if (token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
    }

    // Protect cabinet area: only cabinet accounts
    if (pathname.startsWith("/cabinet")) {
      if (token?.accountType !== "CABINET") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      // Admin-only invitations page
      if (pathname.startsWith("/cabinet/invitations")) {
        if (token?.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // User must be logged in to access any protected page
    },
  }
);

export const config = {
  // Add all routes you want to protect here
  matcher: ["/dashboard/:path*", "/cabinet-dashboard/:path*", "/cabinet/:path*"],
};