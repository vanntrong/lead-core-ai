/* eslint-disable @next/next/no-before-interactive-script-outside-document */
"use client";

import Script from "next/script";

const RewardfulScript: React.FC = () => {
	return (
		<>
			<Script id="rewardful-queue" strategy="beforeInteractive">
				{`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
			</Script>
			<Script
				src="https://r.wdfl.co/rw.js"
				data-rewardful="d1ae6e"
				strategy="afterInteractive"
			/>
		</>
	);
};

export default RewardfulScript;
