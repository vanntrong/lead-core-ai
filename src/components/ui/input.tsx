import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({
	className,
	type,
	errorMessage,
	...props
}: React.ComponentProps<"input"> & { errorMessage?: string }) {
	return (
		<>
			<input
				className={cn(
					// Base styles following Stripe-inspired design system
					"flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm shadow-sm transition-colors",
					// Focus states with indigo theme
					"focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
					// Hover states
					"hover:border-gray-400",
					// Placeholder styling
					"placeholder:text-gray-500",
					// Disabled states
					"disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50",
					// Error states
					"aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
					// File input styling
					"file:border-0 file:bg-transparent file:font-medium file:text-gray-900 file:text-sm",
					className
				)}
				data-slot="input"
				type={type}
				{...props}
			/>
			{errorMessage && (
				<p className="mt-1 text-red-600 text-sm" role="alert">
					{errorMessage}
				</p>
			)}
		</>
	);
}

export { Input };
