import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const { auth } = await import("@/services/auth");
  const session = await auth();

  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z]+$).*)"],
};
