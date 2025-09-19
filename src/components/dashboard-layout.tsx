"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCurrentUser } from "@/hooks/use-auth";
import { Menu } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";

interface DashboardLayoutProps {
	children: React.ReactNode;
	planName?: string;
}

export function DashboardLayout({ children, planName }: DashboardLayoutProps) {
	const { data: user } = useCurrentUser();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const toggleSidebarCollapse = useCallback(() => {
		const newState = !sidebarCollapsed;
		setSidebarCollapsed(newState);
		localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
	}, [sidebarCollapsed]);

	// Load sidebar collapse state from localStorage on mount
	useEffect(() => {
		const savedState = localStorage.getItem("sidebar-collapsed");
		if (savedState !== null) {
			setSidebarCollapsed(JSON.parse(savedState));
		}
	}, []);

	// Add keyboard shortcut for toggling sidebar (Ctrl/Cmd + B)
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "b") {
				event.preventDefault();
				toggleSidebarCollapse();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [toggleSidebarCollapse]);

	const userName = `${user?.user_metadata?.first_name || ""} ${user?.user_metadata?.last_name || ""
		}`.trim();

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Desktop Sidebar */}
			<div className="hidden lg:flex">
				<DashboardSidebar
					userName={userName}
					isCollapsed={sidebarCollapsed}
					onToggleCollapse={toggleSidebarCollapse}
					planName={planName}
				/>
			</div>

			{/* Mobile Sidebar */}
			<Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
				<SheetContent className="w-64 p-0" side="left">
					<DashboardSidebar userName={userName} planName={planName} />
				</SheetContent>
			</Sheet>

			{/* Main Content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Mobile Header */}
				<div className="flex h-16 items-center justify-between border-gray-200 border-b bg-white px-4 lg:hidden">
					<div className="flex items-center space-x-3">
						<Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
							<SheetTrigger asChild>
								<Button size="sm" variant="ghost">
									<Menu className="h-5 w-5" />
								</Button>
							</SheetTrigger>
						</Sheet>
						<div className="flex items-center space-x-2">
							<div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5">
								<svg
									aria-label="LeadCore AI Logo"
									className="h-4 w-4 text-white"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<title>LeadCore AI Logo</title>
									<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
									<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
								</svg>
							</div>
							<span className="font-bold text-gray-900 text-lg">
								LeadCore AI
							</span>
						</div>
					</div>
				</div>

				{/* Main Content Area */}
				<main className="flex-1 overflow-y-auto bg-white">
					<div className="h-full">{children}</div>
				</main>
			</div>
		</div>
	);
}
