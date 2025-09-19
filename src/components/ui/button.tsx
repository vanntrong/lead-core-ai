import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500/20",
				destructive:
					"bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/20",
				outline:
					"border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-indigo-500/20",
				secondary:
					"bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:ring-gray-500/20",
				ghost:
					"hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500/20",
				link: "h-auto p-0 text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline focus-visible:ring-0",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 px-3 text-xs",
				lg: "h-11 px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			data-slot="button"
			{...props}
		/>
	);
}

export { Button, buttonVariants };
