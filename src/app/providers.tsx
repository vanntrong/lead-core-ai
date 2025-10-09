"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { usePathname } from "next/navigation";

const Providers = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();

	return (
		<ProgressProvider
			key={pathname}
			height="5px"
			color="#818cf8"
			options={{ showSpinner: false }}
		>
			<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
				{children}
			</GoogleOAuthProvider>
		</ProgressProvider>
	);
};

export default Providers;
