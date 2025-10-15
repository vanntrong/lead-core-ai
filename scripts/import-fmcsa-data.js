#!/usr/bin/env node

/**
 * FMCSA Data Import Script
 *
 * This script imports FMCSA company data from the JSON file into Supabase.
 *
 * Usage:
 *   node scripts/import-fmcsa-data.js
 *
 * Requirements:
 *   - SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable (for service role access)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BATCH_SIZE = 100; // Insert in batches to avoid timeout
const DATA_FILE_PATH = path.join(__dirname, "../data/fmcsa.json");

// Validate environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL) {
	console.error("❌ Error: Missing SUPABASE_URL environment variable");
	process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
	console.error(
		"❌ Error: Missing SUPABASE_SERVICE_ROLE_KEY environment variable"
	);
	process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

/**
 * Transform JSON data to match database schema
 */
function transformCompanyData(company) {
	return {
		legal_name: company.LegalName || company.legalName,
		dba_name: company.DBAName || company.dbaName || null,
		dot_number: company.USDOTNumber || company.dotNumber || null,
		mc_number: company.MCNumber || company.mcNumber || null,
		physical_address: company.PhysicalAddress || company.phyStreet || null,
		city: company.City || company.phyCity || null,
		state: company.State || company.phyState || null,
		zip_code: company.Zip || company.phyZipcode || null,
		country: company.Country || company.phyCountry || "US",
		telephone: company.Telephone || company.telephone || null,
		email_address: company.EmailAddress || company.emailAddress || null,
		entity_type: company.EntityType || company.entityType || null,
		operating_status:
			company.OperatingStatus || company.operatingStatus || null,
		carrier_operation:
			company.CarrierOperation || company.carrierOperation || null,
		total_drivers: company.TotalDrivers || company.totalDrivers || null,
		total_power_units:
			company.TotalPowerUnits || company.totalPowerUnits || null,
		safety_rating: company.SafetyRating || company.safetyRating || null,
		safety_rating_date:
			company.SafetyRatingDate || company.safetyRatingDate || null,
	};
}

/**
 * Insert data in batches
 */
async function insertBatch(batch, batchNumber, totalBatches) {
	console.log(
		`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`
	);

	const { data, error } = await supabase
		.from("fmcsa_companies")
		.insert(batch)
		.select("id");

	if (error) {
		console.error(`❌ Error inserting batch ${batchNumber}:`, error.message);
		throw error;
	}

	console.log(
		`✅ Successfully inserted batch ${batchNumber} (${data.length} records)`
	);
	return data.length;
}

/**
 * Main import function
 */
async function importData() {
	console.log("🚀 Starting FMCSA data import...\n");

	// Read the JSON file
	console.log(`📖 Reading data from: ${DATA_FILE_PATH}`);
	const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
	const companies = JSON.parse(fileContent);

	console.log(`📊 Found ${companies.length} companies to import\n`);

	// Transform data
	console.log("🔄 Transforming data...");
	const transformedData = companies.map(transformCompanyData);
	console.log("✅ Data transformation complete\n");

	// Check if table is empty
	console.log("🔍 Checking existing data...");
	const { count } = await supabase
		.from("fmcsa_companies")
		.select("*", { count: "exact", head: true });

	if (count && count > 0) {
		console.log(`⚠️  Warning: Table already contains ${count} records`);
		console.log(
			"   This script will add new records without checking for duplicates."
		);

		// Add a simple confirmation prompt
		const readline = await import("node:readline");
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		await new Promise((resolve) => {
			rl.question("   Continue? (y/N): ", (answer) => {
				rl.close();
				if (answer.toLowerCase() !== "y") {
					console.log("❌ Import cancelled");
					process.exit(0);
				}
				resolve();
			});
		});
	}

	// Split into batches
	const batches = [];
	for (let i = 0; i < transformedData.length; i += BATCH_SIZE) {
		batches.push(transformedData.slice(i, i + BATCH_SIZE));
	}

	console.log(
		`\n📦 Importing ${transformedData.length} records in ${batches.length} batches...\n`
	);

	// Insert batches
	let totalInserted = 0;
	const startTime = Date.now();

	for (let i = 0; i < batches.length; i++) {
		try {
			const inserted = await insertBatch(batches[i], i + 1, batches.length);
			totalInserted += inserted;
		} catch {
			console.error(`\n❌ Failed to import batch ${i + 1}. Stopping import.`);
			console.error(`   Total records imported before error: ${totalInserted}`);
			process.exit(1);
		}
	}

	const endTime = Date.now();
	const duration = ((endTime - startTime) / 1000).toFixed(2);

	console.log("\n✨ Import completed successfully!");
	console.log(`   Total records imported: ${totalInserted}`);
	console.log(`   Duration: ${duration} seconds`);
	console.log(
		`   Average: ${(totalInserted / Number.parseFloat(duration)).toFixed(2)} records/second\n`
	);

	// Verify the import
	console.log("🔍 Verifying import...");
	const { count: finalCount } = await supabase
		.from("fmcsa_companies")
		.select("*", { count: "exact", head: true });

	console.log(`   Total records in database: ${finalCount}`);
	console.log("\n🎉 Import process complete!");
}

// Run the import
importData()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 Fatal error:", error);
		process.exit(1);
	});
