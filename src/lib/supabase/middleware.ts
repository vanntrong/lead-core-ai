import { createServerClient } from "@supabase/ssr";
import { Minimatch } from "minimatch";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "../../../database.types1";

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) => {
						request.cookies.set(name, value);
					});
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value, options }) => {
						supabaseResponse.cookies.set(name, value, options);
					});
				},
			},
		}
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { pathname } = request.nextUrl;

	const publicRoutes = [
		new Minimatch("/"),
		new Minimatch("/legal"),
		new Minimatch("/about"),
		new Minimatch("/terms"),
		new Minimatch("/privacy"),
		new Minimatch("/pricing"),
		new Minimatch("/checkout"),
		new Minimatch("/api/webhooks/stripe"),
	];
	const authRoutes = [
		new Minimatch("/login"),
		new Minimatch("/signup"),
		new Minimatch("/auth"),
	];

	// Check if current path is public
	const isPublicRoute = publicRoutes.some(
		(route) => route.match(pathname) || pathname.startsWith("/api/webhooks/")
	);
	const isAuthRoute = authRoutes.some((route) => route.match(pathname));

	// If user is not authenticated and trying to access protected route
	if (!(user || isPublicRoute || isAuthRoute)) {
		const homeUrl = new URL("/", request.url);
		homeUrl.searchParams.set("redirectTo", pathname);
		homeUrl.searchParams.set(
			"message",
			"Please sign in to access your fleet dashboard"
		);
		return NextResponse.redirect(homeUrl);
	}

	return supabaseResponse;
}
