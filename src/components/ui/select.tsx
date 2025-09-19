"use client";

// biome-ignore lint/performance/noNamespaceImport: Radix UI requires namespace import
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Select({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
	return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
	return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
	return (
		<SelectPrimitive.Trigger
			className={cn(
				// Base styles following Stripe-inspired design system
				"flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm shadow-sm transition-colors",
				// Focus states with indigo theme
				"focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
				// Hover states
				"hover:border-gray-400",
				// Disabled states
				"disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50",
				// Placeholder styling
				"data-[placeholder]:text-gray-500",
				// Error states
				"aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
				// Icon styling
				"[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-gray-400",
				className
			)}
			data-slot="select-trigger"
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDownIcon className="size-4 text-gray-400" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	position = "popper",
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				className={cn(
					// Base styles with Stripe-inspired design system
					"relative z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-900 shadow-lg",
					// Animation states
					"data-[state=closed]:animate-out data-[state=open]:animate-in",
					"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
					"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
					// Slide animations
					"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
					"data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
					// Popper positioning
					position === "popper" &&
						"data-[side=left]:-translate-x-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1",
					className
				)}
				data-slot="select-content"
				position={position}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={cn(
						"p-2",
						position === "popper" &&
							"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			className={cn(
				"px-3 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wide",
				className
			)}
			data-slot="select-label"
			{...props}
		/>
	);
}

function SelectItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			className={cn(
				// Base styles with Stripe-inspired design
				"relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-gray-900 text-sm outline-none transition-colors",
				// Focus and hover states
				"focus:bg-indigo-50 focus:text-indigo-900",
				"hover:bg-gray-50",
				// Disabled states
				"data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
				// Icon styling
				"[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
				className
			)}
			data-slot="select-item"
			{...props}
		>
			<SelectPrimitive.ItemText className="flex-1">
				{children}
			</SelectPrimitive.ItemText>
			<span className="flex size-4 items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<CheckIcon className="size-4 text-indigo-600" />
				</SelectPrimitive.ItemIndicator>
			</span>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			className={cn(
				"-mx-1 pointer-events-none my-1 h-px bg-gray-200",
				className
			)}
			data-slot="select-separator"
			{...props}
		/>
	);
}

function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
	return (
		<SelectPrimitive.ScrollUpButton
			className={cn(
				"flex cursor-default items-center justify-center py-2 text-gray-400 hover:text-gray-600",
				className
			)}
			data-slot="select-scroll-up-button"
			{...props}
		>
			<ChevronUpIcon className="size-4" />
		</SelectPrimitive.ScrollUpButton>
	);
}

function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
	return (
		<SelectPrimitive.ScrollDownButton
			className={cn(
				"flex cursor-default items-center justify-center py-2 text-gray-400 hover:text-gray-600",
				className
			)}
			data-slot="select-scroll-down-button"
			{...props}
		>
			<ChevronDownIcon className="size-4" />
		</SelectPrimitive.ScrollDownButton>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
