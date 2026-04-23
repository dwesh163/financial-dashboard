import { type NextRequest, NextResponse } from "next/server";
import { isStale } from "@/lib/pin";
import { COOKIE_OPTS, LAST_ACTIVE_COOKIE, PIN_HASH_COOKIE } from "./constants/pin";

export default async function middleware(req: NextRequest) {
  const { auth } = await import("@/services/auth");
  const session = await auth();

  if (!session || session.error === "RefreshTokenError") {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(url);
  }

  const pinHash = req.cookies.get(PIN_HASH_COOKIE)?.value;

  if (req.nextUrl.pathname === "/lock") {
    if (!pinHash) return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    return NextResponse.next();
  }

  if (pinHash && isStale(req.cookies.get(LAST_ACTIVE_COOKIE)?.value)) {
    const url = new URL("/lock", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", new URL(req.nextUrl.href).pathname);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  if (pinHash) response.cookies.set(LAST_ACTIVE_COOKIE, Date.now().toString(), COOKIE_OPTS);
  return response;
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|images|favicon.ico|.*\\.[a-zA-Z]+$).*)"],
};
