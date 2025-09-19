/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
import { authService } from "@/services/auth.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useCurrentUser = () => {
	return useQuery({
		queryKey: ["auth", "currentUser"],
		queryFn: () => authService.getCurrentUser(),
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			router.push("/dashboard/leads");
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
