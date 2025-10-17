import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async headers() {
		return await [
			{
				source: "/:path*",
				headers: [
					{
						key: "Cross-Origin-Opener-Policy",
						value: "same-origin-allow-popups",
					},
				],
			},
		];
	},
};

export default nextConfig;
