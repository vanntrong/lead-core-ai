import { z } from "zod";

export const createDriverSchema = z.object({
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
	email: z.string().email("Valid email is required"),
	// biome-ignore lint/style/noMagicNumbers: password must be at least 6 characters
	password: z.string().min(6, "Password must be at least 6 characters"),
	license_number: z.string().min(1, "License number is required"),
	license_state: z
		.string({
			error: "License state is required",
		})
		.min(2, "License state is required"),
	license_expires: z.string().min(1, "License expiry date is required"),
	license_class: z.string().optional(),
	date_of_birth: z.string().optional(),
});

export const assignVehicleSchema = z.object({
	driverId: z.string().uuid("Invalid driver ID"),
	vehicleId: z.string().uuid("Invalid vehicle ID").nullable(),
});

export type CreateDriverFormData = z.infer<typeof createDriverSchema>;
export type AssignVehicleFormData = z.infer<typeof assignVehicleSchema>;
