// Preset vertical searches for B2B connectors

export interface VerticalPreset {
    label: string;
    keyword?: string;
    taxonomy?: string;
    category: string;
    description?: string;
    // Google Places fields
    location?: string;
    // NPI Registry fields
    providerName?: string;
    // FMCSA fields
    companyName?: string;
    dotNumber?: string;
    mcNumber?: string;
}

export const VERTICAL_PRESETS = {
    google_places: [
        {
            label: "Restaurants",
            keyword: "restaurant",
            category: "Food & Dining",
            description: "Cafes, diners, fast food, fine dining"
        },
        {
            label: "Dental Clinics",
            keyword: "dentist",
            category: "Healthcare",
            description: "Dental offices and orthodontists"
        },
        {
            label: "Law Firms",
            keyword: "lawyer",
            category: "Legal",
            description: "Attorneys and legal services"
        },
        {
            label: "Real Estate Agents",
            keyword: "real estate agent",
            category: "Real Estate",
            description: "Residential and commercial real estate"
        },
        {
            label: "Auto Repair",
            keyword: "auto repair",
            category: "Automotive",
            description: "Car repair and maintenance shops"
        },
        {
            label: "Salons & Spas",
            keyword: "hair salon",
            category: "Beauty",
            description: "Hair salons, barbershops, and spas"
        },
        {
            label: "Gyms & Fitness",
            keyword: "gym",
            category: "Fitness",
            description: "Fitness centers and yoga studios"
        },
        {
            label: "Plumbers",
            keyword: "plumber",
            category: "Home Services",
            description: "Plumbing services and contractors"
        },
        {
            label: "Electricians",
            keyword: "electrician",
            category: "Home Services",
            description: "Electrical contractors and services"
        },
        {
            label: "Accountants",
            keyword: "accountant",
            category: "Professional Services",
            description: "CPA firms and tax services"
        },
        {
            label: "Pet Stores",
            keyword: "pet store",
            category: "Retail",
            description: "Pet supplies and grooming"
        },
        {
            label: "Florists",
            keyword: "florist",
            category: "Retail",
            description: "Flower shops and floral design"
        }
    ] as VerticalPreset[],

    npi_registry: [
        {
            label: "Dentists",
            taxonomy: "Dentist",
            category: "Healthcare - Dental",
            description: "General dentistry practices"
        },
        {
            label: "General Physicians",
            taxonomy: "Family Medicine",
            category: "Healthcare - Primary Care",
            description: "Family medicine and general practice"
        },
        {
            label: "Chiropractors",
            taxonomy: "Chiropractor",
            category: "Healthcare - Alternative Medicine",
            description: "Chiropractic care providers"
        },
        {
            label: "Physical Therapists",
            taxonomy: "Physical Therapist",
            category: "Healthcare - Therapy",
            description: "Physical therapy and rehabilitation"
        },
        {
            label: "Psychiatrists",
            taxonomy: "Psychiatry",
            category: "Healthcare - Mental Health",
            description: "Mental health physicians"
        },
        {
            label: "Cardiologists",
            taxonomy: "Cardiovascular Disease",
            category: "Healthcare - Specialty",
            description: "Heart and cardiovascular specialists"
        },
        {
            label: "Dermatologists",
            taxonomy: "Dermatology",
            category: "Healthcare - Specialty",
            description: "Skin care specialists"
        },
        {
            label: "Optometrists",
            taxonomy: "Optometrist",
            category: "Healthcare - Vision",
            description: "Eye care and vision services"
        },
        {
            label: "Pharmacies",
            taxonomy: "Community/Retail Pharmacy",
            category: "Healthcare - Pharmacy",
            description: "Community and retail pharmacies"
        },
        {
            label: "Pediatricians",
            taxonomy: "Pediatrics",
            category: "Healthcare - Pediatrics",
            description: "Children's healthcare providers"
        }
    ] as VerticalPreset[],

    fmcsa: [
        {
            label: "General Freight",
            category: "Trucking - Freight",
            description: "Long haul freight carriers"
        },
        {
            label: "Refrigerated Transport",
            category: "Trucking - Cold Chain",
            description: "Temperature-controlled shipping"
        },
        {
            label: "Moving Companies",
            category: "Trucking - Household Goods",
            description: "Residential and commercial moving"
        },
        {
            label: "Container Shipping",
            category: "Trucking - Intermodal",
            description: "Container transport and logistics"
        },
        {
            label: "Flatbed Carriers",
            category: "Trucking - Specialized",
            description: "Heavy equipment and oversized loads"
        },
        {
            label: "Auto Transport",
            category: "Trucking - Vehicle",
            description: "Car and vehicle hauling"
        },
        {
            label: "Dump Truck Services",
            category: "Trucking - Construction",
            description: "Construction material hauling"
        },
        {
            label: "LTL Carriers",
            category: "Trucking - Less Than Truckload",
            description: "Partial load shipping services"
        }
    ] as VerticalPreset[],
};

// Helper to get presets by source
export function getPresetsForSource(source: 'google_places' | 'npi_registry' | 'fmcsa'): VerticalPreset[] {
    return VERTICAL_PRESETS[source] || [];
}
