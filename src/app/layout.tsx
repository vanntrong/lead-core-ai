import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/lib/react-query";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "LeadCore AI - AI Lead Engine",
	description:
		"The most trusted signal-powered SaaS for trucking and logistics companies",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="mdl-js">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ReactQueryProvider>
					{children}
				</ReactQueryProvider>
				<Toaster />
			</body>
		</html>
	);
}
