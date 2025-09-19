import { z } from "zod";
import type { UpdateLoadData } from "@/types/load";
import { toMinorUnit } from "../utils";

// Constants for validation
const MAX_BROKER_NAME_LENGTH = 100;
const MAX_ADDRESS_LENGTH = 255;
const MAX_COMMODITY_LENGTH = 100;
const MAX_WEIGHT_LBS = 80_000;
const MAX_RATE_AMOUNT = 50_000;

// Load form validation schema
export const addLoadSchema = z.object({
	broker_name: z
		.string()
		.min(1, "Broker name is required")
		.max(
			MAX_BROKER_NAME_LENGTH,
			"Broker name must be less than 100 characters"
		),

	pickup_address: z
		.string()
		.min(1, "Pickup address is required")
		.max(MAX_ADDRESS_LENGTH, "Pickup address must be less than 255 characters"),

	delivery_address: z
		.string()
		.min(1, "Delivery address is required")
		.max(
			MAX_ADDRESS_LENGTH,
			"Delivery address must be less than 255 characters"
		),

	delivery_date: z
		.string()
		.min(1, "Delivery date is required")
		.refine((date) => {
			const pickupDate = new Date(date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return pickupDate >= today;
		}, "Delivery date cannot be in the past"),

	rate_amount: z
		.number()
		.positive("Rate must be greater than 0")
		.max(MAX_RATE_AMOUNT, "Rate cannot exceed $50,000"),

	weight_lbs: z
		.number()
		.positive("Weight must be greater than 0")
		.max(MAX_WEIGHT_LBS, "Weight cannot exceed 80,000 lbs"),

	commodity: z
		.string()
		.max(MAX_COMMODITY_LENGTH, "Commodity must be less than 100 characters")
		.optional()
		.or(z.literal("")),
});

export type AddLoadFormData = z.infer<typeof addLoadSchema>;

// Update load validation schema (similar to add but with id)
export const updateLoadSchema = addLoadSchema
	.safeExtend({
		id: z.string().uuid("Invalid load ID"),
	})
	.partial()
	.extend({
		id: z.string().uuid("Invalid load ID"),
	});

export type UpdateLoadFormData = z.infer<typeof updateLoadSchema>;

// Transform form data to API format
export const transformLoadFormData = (data: AddLoadFormData) => {
	return {
		broker_name: data.broker_name,
		pickup_address: data.pickup_address,
		delivery_address: data.delivery_address,
		delivery_date: data.delivery_date,
		rate_amount: toMinorUnit(data.rate_amount), // Convert to cents
		weight_lbs: data.weight_lbs,
		commodity: data.commodity || undefined,
	};
};

// Transform update form data to API format
export const transformUpdateLoadFormData = (
	data: UpdateLoadFormData
): UpdateLoadData => {
	const { id, ...updateData } = data;

	// Convert rate_amount to cents if it exists
	const transformedData: Record<string, unknown> = {
		...Object.fromEntries(
			Object.entries(updateData).filter(([_, value]) => value !== undefined)
		),
	};

	if (typeof transformedData.rate_amount === "number") {
		transformedData.rate_amount = Math.round(transformedData.rate_amount * 100);
	}

	return {
		id,
		...transformedData,
	} as UpdateLoadData;
};

// Common commodity options for autocomplete/suggestions
export const commonCommodities = [
	"Electronics",
	"Automotive Parts",
	"Consumer Goods",
	"Building Materials",
	"Food Products",
	"Pharmaceuticals",
	"Machinery",
	"Textiles",
	"Chemicals",
	"Paper Products",
	"Furniture",
	"Appliances",
	"Steel/Metal",
	"Lumber",
	"Plastics",
	"Agricultural Products",
	"Medical Equipment",
	"Hazardous Materials",
	"Frozen Goods",
	"General Freight",
] as const;

// Load status options
export const loadStatusOptions = [
	{ value: "pending", label: "Available" },
	{ value: "assigned", label: "Assigned" },
	{ value: "in_transit", label: "In Transit" },
	{ value: "delivered", label: "Delivered" },
	{ value: "canceled", label: "Canceled" },
] as const;
