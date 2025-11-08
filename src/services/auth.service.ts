import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

export class AuthService {
	private readonly supabase = createClient();

	async getCurrentUser(): Promise<User | null> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();
		if (!user) {
			return null;
		}

		return user;
	}

	async signUp(
		email: string,
		password: string,
		profile: {
			firstName: string;
			lastName: string;
		}
	) {
		const { data, error } = await this.supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					first_name: profile.firstName,
					last_name: profile.lastName,
				},
				emailRedirectTo:
					typeof window !== "undefined"
						? `${window.location.origin}/auth/confirm`
						: undefined,
			},
		});
		if (error) {
			throw error;
		}
		return data;
	}

	async signIn(email: string, password: string) {
		const { data, error } = await this.supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			throw error;
		}
		return data;
	}

	async signOut() {
		const { error } = await this.supabase.auth.signOut();
		if (error) {
			throw error;
		}
	}

	async forgotPassword(email: string) {
		const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
			redirectTo:
				typeof window !== "undefined"
					? `${window.location.origin}/reset-password`
					: undefined,
		});
		if (error) {
			throw error;
		}
		return true;
	}

	async resetPassword(newPassword: string) {
		const { error } = await this.supabase.auth.updateUser({
			password: newPassword,
		});
		if (error) {
			throw error;
		}
		return true;
	}

	async signInWithGoogle() {
		const { data, error } = await this.supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo:
					typeof window !== "undefined"
						? `${window.location.origin}/auth/callback`
						: undefined,
				queryParams: {
					access_type: "offline",
					prompt: "select_account",
				},
			},
		});

		if (error) {
			throw error;
		}
		return data;
	}
}

export const authService = new AuthService();
