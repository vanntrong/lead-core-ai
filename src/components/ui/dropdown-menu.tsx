"use client";

// biome-ignore lint/performance/noNamespaceImport: this is a react component
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

function DropdownMenu({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
	return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
	return (
		<DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
	);
}

function DropdownMenuTrigger({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
	return (
		<DropdownMenuPrimitive.Trigger
			data-slot="dropdown-menu-trigger"
			{...props}
		/>
	);
}

function DropdownMenuContent({
	className,
	sideOffset = 4,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				className={cn(
					"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[12rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 bg-white p-2 text-gray-900 shadow-lg data-[state=closed]:animate-out data-[state=open]:animate-in",
					className
				)}
				data-slot="dropdown-menu-content"
				sideOffset={sideOffset}
				{...props}
			/>
		</DropdownMenuPrimitive.Portal>
	);
}

function DropdownMenuGroup({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
	return (
		<DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
	);
}

function DropdownMenuItem({
	className,
	inset,
	variant = "default",
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
	inset?: boolean;
	variant?: "default" | "destructive";
}) {
	return (
		<DropdownMenuPrimitive.Item
			className={cn(
				"relative flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-gray-700 text-sm outline-hidden transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-indigo-50 focus:text-indigo-700 data-[disabled]:pointer-events-none data-[inset]:pl-10 data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-gray-500",
				variant === "destructive" &&
					"text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 [&_svg]:text-red-600",
				className
			)}
			data-inset={inset}
			data-slot="dropdown-menu-item"
			data-variant={variant}
			{...props}
		/>
	);
}

function DropdownMenuCheckboxItem({
	className,
	children,
	checked,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
	return (
		<DropdownMenuPrimitive.CheckboxItem
			checked={checked}
			className={cn(
				"relative flex cursor-pointer select-none items-center gap-3 rounded-lg py-2.5 pr-3 pl-10 font-medium text-gray-700 text-sm outline-hidden transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-indigo-50 focus:text-indigo-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			data-slot="dropdown-menu-checkbox-item"
			{...props}
		>
			<span className="pointer-events-none absolute left-3 flex size-4 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<CheckIcon className="size-4 text-indigo-600" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.CheckboxItem>
	);
}

function DropdownMenuRadioGroup({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
	return (
		<DropdownMenuPrimitive.RadioGroup
			data-slot="dropdown-menu-radio-group"
			{...props}
		/>
	);
}

function DropdownMenuRadioItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
	return (
		<DropdownMenuPrimitive.RadioItem
			className={cn(
				"relative flex cursor-pointer select-none items-center gap-3 rounded-lg py-2.5 pr-3 pl-10 font-medium text-gray-700 text-sm outline-hidden transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-indigo-50 focus:text-indigo-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			data-slot="dropdown-menu-radio-item"
			{...props}
		>
			<span className="pointer-events-none absolute left-3 flex size-4 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<CircleIcon className="size-2 fill-indigo-600 text-indigo-600" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.RadioItem>
	);
}

function DropdownMenuLabel({
	className,
	inset,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
	inset?: boolean;
}) {
	return (
		<DropdownMenuPrimitive.Label
			className={cn(
				"px-3 py-2 font-semibold text-gray-500 text-xs uppercase tracking-wider data-[inset]:pl-10",
				className
			)}
			data-inset={inset}
			data-slot="dropdown-menu-label"
			{...props}
		/>
	);
}

function DropdownMenuSeparator({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
	return (
		<DropdownMenuPrimitive.Separator
			className={cn("-mx-1 my-2 h-px bg-gray-200", className)}
			data-slot="dropdown-menu-separator"
			{...props}
		/>
	);
}

function DropdownMenuShortcut({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"ml-auto font-medium text-gray-400 text-xs tracking-wider",
				className
			)}
			data-slot="dropdown-menu-shortcut"
			{...props}
		/>
	);
}

function DropdownMenuSub({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
	return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
	inset?: boolean;
}) {
	return (
		<DropdownMenuPrimitive.SubTrigger
			className={cn(
				"flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-gray-700 text-sm outline-hidden transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-indigo-50 focus:text-indigo-700 data-[state=open]:bg-indigo-50 data-[inset]:pl-10 data-[state=open]:text-indigo-700",
				className
			)}
			data-inset={inset}
			data-slot="dropdown-menu-sub-trigger"
			{...props}
		>
			{children}
			<ChevronRightIcon className="ml-auto size-4 text-gray-400" />
		</DropdownMenuPrimitive.SubTrigger>
	);
}

function DropdownMenuSubContent({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
	return (
		<DropdownMenuPrimitive.SubContent
			className={cn(
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-lg border border-gray-200 bg-white p-2 text-gray-900 shadow-lg data-[state=closed]:animate-out data-[state=open]:animate-in",
				className
			)}
			data-slot="dropdown-menu-sub-content"
			{...props}
		/>
	);
}

export {
	DropdownMenu,
	DropdownMenuPortal,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
};
