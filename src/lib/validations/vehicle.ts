import { z } from "zod";
import { VehicleFuelTypeEnum } from "@/types/vehicle";

// Constants for validation
const MAX_MAKE_LENGTH = 50;
const MAX_MODEL_LENGTH = 50;
const MIN_YEAR = 1900;
const MAX_VIN_LENGTH = 17;
const MAX_LICENSE_PLATE_LENGTH = 20;
const MAX_WEIGHT_LBS = 200_000;
const MAX_MPG = 100;

// Vehicle form validation schema
export const addVehicleSchema = z.object({
	type: z
		.enum(["truck", "trailer", "van"])
		.refine((val) => ["truck", "trailer", "van"].includes(val), {
			message: "Please select a valid vehicle type",
		}),

	// Optional vehicle details
	make: z
		.string()
		.max(MAX_MAKE_LENGTH, "Make must be less than 50 characters")
		.optional()
		.or(z.literal("")),

	model: z
		.string()
		.max(MAX_MODEL_LENGTH, "Model must be less than 50 characters")
		.optional()
		.or(z.literal("")),

	year: z
		.number()
		.int("Year must be a whole number")
		.min(MIN_YEAR, "Year must be 1900 or later")
		.max(
			new Date().getFullYear() + 1,
			`Year cannot be later than ${new Date().getFullYear() + 1}`
		)
		.optional()
		.or(z.nan()),

	vin: z
		.string()
		.max(MAX_VIN_LENGTH, "VIN must be 17 characters or less")
		.regex(/^[A-HJ-NPR-Z0-9]*$/i, "VIN contains invalid characters")
		.optional()
		.or(z.literal("")),

	license_plate: z
		.string()
		.max(
			MAX_LICENSE_PLATE_LENGTH,
			"License plate must be less than 20 characters"
		)
		.optional()
		.or(z.literal("")),

	fuel_type: z.nativeEnum(VehicleFuelTypeEnum).optional().or(z.literal("")),

	max_weight_lbs: z
		.number()
		.positive("Weight must be greater than 0")
		.max(MAX_WEIGHT_LBS, "Weight cannot exceed 200,000 lbs")
		.optional()
		.or(z.nan()),

	mpg_rating: z
		.number()
		.positive("MPG must be greater than 0")
		.max(MAX_MPG, "MPG cannot exceed 100")
		.optional()
		.or(z.nan()),
});

export type AddVehicleFormData = z.infer<typeof addVehicleSchema>;

// Update vehicle validation schema (similar to add but with id)
export const updateVehicleSchema = addVehicleSchema.extend({
	id: z.string().uuid("Invalid vehicle ID"),
});

export type UpdateVehicleFormData = z.infer<typeof updateVehicleSchema>;

// Transform form data to API format
export const transformVehicleFormData = (data: AddVehicleFormData) => {
	return {
		type: data.type,
		make: data.make || undefined,
		model: data.model || undefined,
		year: Number.isNaN(data.year) ? undefined : data.year,
		vin: data.vin || undefined,
		license_plate: data.license_plate || undefined,
		fuel_type: data.fuel_type || undefined,
		max_weight_lbs: Number.isNaN(data.max_weight_lbs)
			? undefined
			: data.max_weight_lbs,
		mpg_rating: Number.isNaN(data.mpg_rating) ? undefined : data.mpg_rating,
	};
};

// Transform update form data to API format
export const transformUpdateVehicleFormData = (data: UpdateVehicleFormData) => {
	return {
		id: data.id,
		type: data.type,
		make: data.make || undefined,
		model: data.model || undefined,
		year: Number.isNaN(data.year) ? undefined : data.year,
		vin: data.vin || undefined,
		license_plate: data.license_plate || undefined,
		fuel_type: data.fuel_type || undefined,
		max_weight_lbs: Number.isNaN(data.max_weight_lbs)
			? undefined
			: data.max_weight_lbs,
		mpg_rating: Number.isNaN(data.mpg_rating) ? undefined : data.mpg_rating,
	};
};

// Vehicle type options for select component
export const vehicleTypeOptions = [
	{ value: "truck", label: "Truck" },
	{ value: "trailer", label: "Trailer" },
	{ value: "van", label: "Van" },
] as const;

// Common fuel type options
export const fuelTypeOptions = [
	{ value: "diesel", label: "Diesel" },
	{ value: "gasoline", label: "Gasoline" },
	{ value: "electric", label: "Electric" },
	{ value: "hybrid", label: "Hybrid" },
	{ value: "propane", label: "Propane" },
	{ value: "natural_gas", label: "Natural Gas" },
] as const;
