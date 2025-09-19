import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

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
			},
		});
		if (error) throw error;
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
}

export const authService = new AuthService();
