/**
 * Example usage and testing for Location Geocoding Service
 * 
 * To run tests:
 * 1. Set OPENCAGE_API_KEY in your .env.local
 * 2. Run: node -r esbuild-register src/services/__tests__/location-geocoding.example.ts
 * 
 * Or simply import and use in your code
 */

import { locationGeocodingService } from '../location-geocoding.service';

async function testGeocodingService() {
    console.log('🌍 Testing Location Geocoding Service\n');

    // Test 1: Common city abbreviation
    console.log('Test 1: City abbreviation');
    const la = await locationGeocodingService.geocodeLocation('LA');
    console.log('Input: "LA"');
    console.log('Result:', JSON.stringify(la, null, 2));
    console.log('---\n');

    // Test 2: City with state
    console.log('Test 2: City with state');
    const austin = await locationGeocodingService.geocodeLocation('Austin, TX');
    console.log('Input: "Austin, TX"');
    console.log('Result:', JSON.stringify(austin, null, 2));
    console.log('---\n');

    // Test 3: International city
    console.log('Test 3: International city');
    const london = await locationGeocodingService.geocodeLocation('London');
    console.log('Input: "London"');
    console.log('Result:', JSON.stringify(london, null, 2));
    console.log('---\n');

    // Test 4: Typo handling
    console.log('Test 4: Typo handling');
    const typo = await locationGeocodingService.geocodeLocation('Austni, TX');
    console.log('Input: "Austni, TX" (typo)');
    console.log('Result:', JSON.stringify(typo, null, 2));
    console.log('---\n');

    // Test 5: Location validation
    console.log('Test 5: Location validation');
    const validation = await locationGeocodingService.validateLocation('New York');
    console.log('Input: "New York"');
    console.log('Validation:', JSON.stringify(validation, null, 2));
    console.log('---\n');

    // Test 6: Batch processing
    console.log('Test 6: Batch processing');
    const locations = ['Austin, TX', 'New York', 'Los Angeles', 'Chicago'];
    const batchResults = await locationGeocodingService.geocodeLocations(locations);
    console.log('Input:', locations);
    console.log('Results:');
    for (const [query, result] of batchResults.entries()) {
        console.log(`  ${query}: ${result?.formatted || 'N/A'}`);
    }
    console.log('---\n');

    // Test 7: Invalid location
    console.log('Test 7: Invalid location');
    const invalid = await locationGeocodingService.geocodeLocation('XYZ123');
    console.log('Input: "XYZ123"');
    console.log('Result:', JSON.stringify(invalid, null, 2));
    console.log('---\n');

    console.log('✅ All tests complete!');
}

// Example usage in application code
async function exampleUsage() {
    // 1. Simple geocoding
    const result = await locationGeocodingService.geocodeLocation('Austin, TX');
    if (result) {
        console.log(`City: ${result.city}`);
        console.log(`State: ${result.state_code}`);
        console.log(`Country: ${result.country}`);
        console.log(`Confidence: ${result.confidence}/10`);
    }

    // 2. Validation before storing
    const validation = await locationGeocodingService.validateLocation('New York');
    if (validation.valid && validation.confidence >= 7) {
        // Store the normalized location
        console.log('Storing:', validation.normalized?.formatted);
    }

    // 3. Batch process user inputs
    const userInputs = ['LA', 'NYC', 'SF'];
    const geocoded = await locationGeocodingService.geocodeLocations(userInputs);
    for (const [input, result] of geocoded.entries()) {
        console.log(`${input} → ${result?.formatted}`);
    }
}

// Export for testing
export { testGeocodingService, exampleUsage };

// Run if executed directly
if (require.main === module) {
    testGeocodingService().catch(console.error);
}
