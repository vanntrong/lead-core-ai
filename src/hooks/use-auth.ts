/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
import { authService } from "@/services/auth.service";
import { getAdminEmails } from "@/utils/helper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@bprogress/next/app";

export const useCurrentUser = () => {
	return useQuery({
		queryKey: ["auth", "currentUser"],
		queryFn: async () => {
			const user = await authService.getCurrentUser();
			return {
				...user,
				is_admin: user?.email ? getAdminEmails().includes(user.email.toLowerCase()) : false
			}
		},
		staleTime: 60 * 60 * 1000, // 1 hour
	});
};

export const useSignUp = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			email: string;
			password: string;
			firstName: string;
			lastName: string;
		}) =>
			authService.signUp(data.email, data.password, {
				firstName: data.firstName,
				lastName: data.lastName,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["auth"] });
		},
	});
};

export const useSignIn = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (data: { email: string; password: string }) =>
			authService.signIn(data.email, data.password),
		onSuccess: (_result, variables) => {
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			const email = variables?.email?.toLowerCase();
			if (email && getAdminEmails().includes(email)) {
				router.push("/admin/dashboard/scraper-logs");
			} else {
				router.push("/dashboard/leads");
			}
		},
	});
};


export const useSignOut = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: () => authService.signOut(),
		onSuccess: () => {
			queryClient.clear();
			router.push("/");
		},
	});
};

export const useForgotPassword = () => {
	return useMutation({
		mutationFn: (email: string) => authService.forgotPassword(email),
	});
};

export const useResetPassword = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (newPassword: string) => authService.resetPassword(newPassword),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			router.push("/login");
		},
	});
};
