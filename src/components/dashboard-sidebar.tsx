"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { authService } from "@/services/auth.service";
import { useRouter } from "@bprogress/next/app";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Crown,
	Globe,
	Home,
	LogOut,
	ScrollText,
	Server,
	Truck
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
	name: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	badge?: string;
	description?: string;
}

interface NavigationSection {
	title: string;
	items: NavigationItem[];
}

const navigationSections: NavigationSection[] = [
	{
		title: "Overview",
		items: [
			{
				name: "Dashboard",
				href: "/dashboard",
				icon: Home,
				description: "Main dashboard overview",
			},
			{
				name: "Lead Board",
				href: "/dashboard/leads",
				icon: Globe,
				description: "Enrich and manage leads",
			},
		],
	},
	{
		title: "Plan Usage & Billing",
		items: [
			{
				name: "Usage & Billing",
				href: "/dashboard/usage-invoices",
				icon: Crown,
				description: "Monitor usage and invoices",
			},
		],
	},
];

const navigationAdminSections: NavigationSection[] = [
	{
		title: "Admin Console",
		items: [
			{
				name: "Scraper Logs",
				href: "/admin/dashboard/scraper-logs",
				icon: ScrollText,
				description: "Monitor scraper logs",
			},
			{
				name: "Proxies",
				href: "/admin/dashboard/proxies",
				icon: Server,
				description: "Monitor proxies logs",
			},
			{
				name: "Lead Moderation",
				href: "/admin/dashboard/lead-moderation",
				icon: Crown,
				description: "Monitor lead moderation",
			},
		],
	},
];
interface DashboardSidebarProps {
	userName?: string;
	isAdmin?: boolean;
	planName?: string;
	isCollapsed?: boolean;
	onToggleCollapse?: () => void;
}

export function DashboardSidebar({
	userName = "User Name",
	isAdmin = false,
	planName,
	isCollapsed = false,
	onToggleCollapse,
}: DashboardSidebarProps) {
	const pathname = usePathname();
	const router = useRouter()

	const handleSignOut = async () => {
		await authService.signOut();
		router.push("/");
	};

	return (
		<div
			className={`flex h-screen flex-col border-gray-200 border-r bg-white transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"
				}`}
		>
			{/* Header */}
			<div className="flex h-16 items-center justify-between border-gray-200 border-b px-4">
				{!isCollapsed && (
					<div className="flex items-center space-x-3">
						<div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2">
							<Globe className="h-6 w-6 text-white" />
						</div>
						<div className="min-w-0 flex-1">
							<h1 className="truncate font-bold text-gray-900 text-lg">
								LeadCore AI
							</h1>
							<p className="truncate text-gray-600 text-xs">{userName}</p>
						</div>
					</div>
				)}
				{isCollapsed && (
					<div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2">
						<Truck className="h-6 w-6 text-white" />
					</div>
				)}
				{onToggleCollapse && (
					<Button
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						className="h-8 w-8 rounded-lg border border-gray-200 bg-white p-0 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
						onClick={onToggleCollapse}
						size="sm"
						variant="ghost"
					>
						{isCollapsed ? (
							<ChevronRight className="h-4 w-4" />
						) : (
							<ChevronLeft className="h-4 w-4" />
						)}
					</Button>
				)}
			</div>

			{/* Navigation */}
			<div className="flex-1 overflow-y-auto px-3 py-4">
				<nav className="space-y-6">
					{((isAdmin ? navigationAdminSections : navigationSections)).map((section) => (
						<div key={section.title}>
							{!isCollapsed && (
								<h3 className="mb-3 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
									{section.title}
								</h3>
							)}
							<ul className="space-y-1">
								{section.items.map((item) => {
									// Highlight if current path is the item route or a subroute, but avoid /dashboard matching /dashboard/leads
									let isActive = false;
									if (pathname === item.href) {
										isActive = true;
									} else if (pathname.startsWith(item.href + "/")) {
										// Only match subroutes if item.href is not /dashboard
										isActive = item.href !== "/dashboard";
									}
									return (
										<li key={item.name}>
											<Link
												className={`group relative flex items-center rounded-xl px-3 py-2.5 font-medium text-sm transition-all hover:bg-gray-50 ${isActive
													? "bg-indigo-50 text-indigo-700"
													: "text-gray-700 hover:text-gray-900"
													} ${isCollapsed ? "justify-center" : ""}`}
												href={item.href}
												title={
													isCollapsed
														? `${item.name}${item.description ? ` - ${item.description}` : ""}`
														: undefined
												}
											>
												<item.icon
													className={`h-5 w-5 flex-shrink-0 ${isActive
														? "text-indigo-600"
														: "text-gray-400 group-hover:text-gray-500"
														} ${isCollapsed ? "" : "mr-3"}`}
												/>
												{!isCollapsed && (
													<>
														<span className="flex-1 truncate">{item.name}</span>
														{item.badge && (
															<Badge
																className="ml-2 h-5 px-2 text-xs"
																variant={
																	item.badge === "New" ? "default" : "secondary"
																}
															>
																{item.badge}
															</Badge>
														)}
													</>
												)}
												{isCollapsed && item.badge && (
													<div className="-right-1 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white text-xs">
														{item.badge === "New" ? "!" : item.badge}
													</div>
												)}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</nav>
			</div>

			{/* User Profile Section */}
			<div className="border-gray-200 border-t p-4">
				{!isCollapsed ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="h-auto w-full justify-between px-3 py-2"
								variant="ghost"
							>
								<div className="flex items-center space-x-3">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
										<span className="font-semibold text-indigo-600 text-sm">
											{userName.charAt(0).toUpperCase()}
										</span>
									</div>
									<div className="min-w-0 flex-1 text-left">
										<p className="truncate font-medium text-gray-900 text-sm">
											{userName}
										</p>
										{planName && (
											<p className="truncate text-gray-500 text-xs">
												{planName}
											</p>
										)}
									</div>
								</div>
								<ChevronDown className="h-4 w-4 text-gray-400" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuItem
								className="text-red-600"
								onClick={handleSignOut}
							>
								<LogOut className="mr-2 h-4 w-4" />
								Sign Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<div className="flex justify-center">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
							<span className="font-semibold text-indigo-600 text-sm">
								{userName.charAt(0).toUpperCase()}
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
