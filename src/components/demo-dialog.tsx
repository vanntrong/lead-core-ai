"use client";

import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
  CustomDialogTrigger
} from "@/components/ui/custom-dialog";

interface DemoDialogProps {
  children: React.ReactNode;
}

export function DemoDialog({ children }: DemoDialogProps) {
  return (
    <CustomDialog>
      <CustomDialogTrigger asChild>
        {children}
      </CustomDialogTrigger>
      <CustomDialogContent widthClass="max-w-4xl p-0 bg-black">
        <CustomDialogHeader className="p-6 pb-0">
          <CustomDialogTitle className="text-white text-xl font-semibold">
            LeadCore AI Demo
          </CustomDialogTitle>
        </CustomDialogHeader>
        <div className="aspect-video w-full flex items-center justify-center">
          <video
            controls
            muted
            className="w-full h-full rounded-b-lg bg-black"
          >
            <source src="/videos/demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </CustomDialogContent>
    </CustomDialog>
  );
}
