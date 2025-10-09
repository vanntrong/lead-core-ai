"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";
import Link from "next/link";

export default function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const { data: user, isLoading } = useCurrentUser();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="text-muted-foreground">
						Please wait while we load your dashboard.
					</p>
				</div>
			</div>
		);
	}

	if (!(isLoading || user?.is_admin)) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<h1 className="mb-4 font-bold text-2xl">Access Denied</h1>
					<p className="mb-6 text-muted-foreground">
						You do not have permission to access this page.
					</p>
					<Button>
						<Link href="/">Back to Home</Link>
					</Button>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
