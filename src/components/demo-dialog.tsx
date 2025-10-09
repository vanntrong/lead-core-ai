"use client";

import {
	CustomDialog,
	CustomDialogContent,
	CustomDialogHeader,
	CustomDialogTitle,
	CustomDialogTrigger,
} from "@/components/ui/custom-dialog";

interface DemoDialogProps {
	children: React.ReactNode;
}

export function DemoDialog({ children }: DemoDialogProps) {
	return (
		<CustomDialog>
			<CustomDialogTrigger asChild>{children}</CustomDialogTrigger>
			<CustomDialogContent widthClass="max-w-4xl p-0 bg-black">
				<CustomDialogHeader className="p-6 pb-0">
					<CustomDialogTitle className="font-semibold text-white text-xl">
						LeadCore AI Demo
					</CustomDialogTitle>
				</CustomDialogHeader>
				<div className="flex aspect-video w-full items-center justify-center">
					<video controls muted className="h-full w-full rounded-b-lg bg-black">
						<source src="/videos/demo.mp4" type="video/mp4" />
						Your browser does not support the video tag.
					</video>
				</div>
			</CustomDialogContent>
		</CustomDialog>
	);
}
