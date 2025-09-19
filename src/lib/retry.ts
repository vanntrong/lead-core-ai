// biome-ignore lint/suspicious/noExplicitAny: ok
export const withRetry = <TArgs extends any[], TResult>(
	fn: (...args: TArgs) => Promise<TResult>,
	retries: number
): ((...args: TArgs) => Promise<TResult>) => {
	return async (...args: TArgs): Promise<TResult> => {
		let attempt = 0;
		while (attempt <= retries) {
			try {
				return await fn(...args);
			} catch (error) {
				attempt++;
				if (attempt > retries) {
					throw error;
				}
				// Optionally, add a delay before retrying
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}

		return {} as TResult; // This line should never be reached
	};
};
