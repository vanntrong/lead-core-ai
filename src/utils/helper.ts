const SECONDS_IN_MILLISECONDS = 1000;

export const fromSecondsToMilliseconds = (seconds: number) => {
	return seconds * SECONDS_IN_MILLISECONDS;
};

export const formatDuration = (ms?: number | null) => {
	if (typeof ms !== "number" || Number.isNaN(ms)) { return "-"; }
	return `${(ms / 1000).toFixed(2)}s`;
};

export const getAdminEmails = (): string[] => {
	return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
		.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
};

export const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};
