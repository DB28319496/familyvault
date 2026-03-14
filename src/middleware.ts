import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip all auth middleware when Supabase isn't configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
    return NextResponse.next();
  }

  // Only import and run Supabase middleware when configured
  const { updateSession } = await import("@/lib/supabase/middleware");
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
