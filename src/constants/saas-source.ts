export const saasSource = {
	shopify: "Shopify",
	woocommerce: "WooCommerce",
	etsy: "Etsy",
	g2: "G2",
	google_places: "Google Places",
	npi_registry: "NPI Registry",
	fmcsa: "FMCSA",
};

export const sourceTypes = Object.keys(saasSource);

export const leadSourceColorConfig: Record<
	string,
	{ label: string; badge: string }
> = {
	shopify: {
		label: "Shopify",
		badge: "bg-green-100 text-green-800 border-green-200", // Shopify: green
	},
	etsy: {
		label: "Etsy",
		badge: "bg-orange-100 text-orange-800 border-orange-200", // Etsy: orange
	},
	g2: {
		label: "G2",
		badge: "bg-red-100 text-red-800 border-red-200", // G2: red
	},
	woocommerce: {
		label: "WooCommerce",
		badge: "bg-indigo-100 text-indigo-800 border-indigo-200", // WooCommerce: indigo
	},
	google_places: {
		label: "Google Places",
		badge: "bg-blue-100 text-blue-800 border-blue-200", // Google Places: blue
	},
	npi_registry: {
		label: "NPI Registry",
		badge: "bg-teal-100 text-teal-800 border-teal-200", // NPI Registry: teal
	},
	fmcsa: {
		label: "FMCSA",
		badge: "bg-amber-100 text-amber-800 border-amber-200", // FMCSA: amber
	},
};
