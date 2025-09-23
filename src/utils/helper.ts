const SECONDS_IN_MILLISECONDS = 1000;

export const fromSecondsToMilliseconds = (seconds: number) => {
	return seconds * SECONDS_IN_MILLISECONDS;
};