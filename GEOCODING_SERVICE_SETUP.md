# Location Geocoding Service Setup

## Overview
This service uses **OpenCage Geocoding API** to provide accurate location parsing and normalization. It replaces the hardcoded city and state mappings with a real-time geocoding solution.

## Why OpenCage?

### Free Tier Benefits:
- ✅ **2,500 free requests per day** (generous for most use cases)
- ✅ Global coverage (worldwide locations)
- ✅ Handles typos and variations automatically
- ✅ Returns structured data (city, state, country, lat/lng)
- ✅ No credit card required for free tier
- ✅ Rate limit info in API responses

### Paid Tier (if needed):
- $50/month for 10,000 requests
- $150/month for 50,000 requests
- Much cheaper than Google Geocoding ($5 per 1,000 requests)

## Setup Instructions

### 1. Get API Key

1. Go to [OpenCage Data](https://opencagedata.com/)
2. Click **"Sign up for free"**
3. Create an account (no credit card required)
4. Go to your dashboard
5. Copy your API key

### 2. Add to Environment Variables

Add to your `.env.local` file:

```bash
OPENCAGE_API_KEY=your_api_key_here
```

### 3. Verify Setup

The service will log a warning if the API key is not configured:
```
OPENCAGE_API_KEY not configured - location geocoding will be limited
```

If you see this warning but the application still works, it means it's using the fallback basic parsing.

## How It Works

### With API Key (Recommended):
```typescript
// Input: "LA" or "Austin, TX" or "Los Angeles, California"
const result = await locationGeocodingService.geocodeLocation("LA");

// Output:
{
  city: "Los Angeles",
  state: "California",
  state_code: "CA",
  country: "United States",
  country_code: "US",
  formatted: "Los Angeles, California, United States",
  latitude: 34.0522,
  longitude: -118.2437,
  confidence: 9 // 0-10 scale
}
```

### Without API Key (Fallback):
```typescript
// Falls back to basic string parsing
// Less accurate but still functional
const result = await locationGeocodingService.geocodeLocation("LA");

// Output:
{
  city: "LA", // Not normalized
  formatted: "LA",
  confidence: 1 // Low confidence
}
```

## Features

### 1. Smart Caching
- Results are cached in memory
- Reduces API calls for repeated locations
- Automatic cache cleanup (max 1,000 entries)

### 2. Rate Limit Monitoring
- Logs remaining API calls
- Helps track usage
- Example log: `OpenCage rate limit: 2450/2500 remaining`

### 3. Graceful Fallback
- If API fails or unavailable → basic parsing
- If API key missing → basic parsing
- Application never breaks

### 4. Batch Processing
```typescript
// Process multiple locations with rate limiting
const locations = ["Austin, TX", "New York", "Los Angeles"];
const results = await locationGeocodingService.geocodeLocations(locations);
```

### 5. Location Validation
```typescript
// Check if a location is valid and get confidence score
const validation = await locationGeocodingService.validateLocation("Austni, TX"); // typo

// Output:
{
  valid: true,
  confidence: 8,
  suggestion: "Austin, Travis County, Texas, United States"
}
```

## Usage in Lead Creation

When creating a lead with location data:

1. **User enters location**: "HRT clinics in Austin"
2. **System extracts location**: "Austin"
3. **Geocoding service normalizes**: 
   - City: "Austin"
   - State: "TX"
   - Country: "United States"
   - Full: "Austin, Travis County, Texas, United States"
4. **Stored in database** with normalized data
5. **Searchable** with variations (Austin, ATX, Austin TX, etc.)

## Performance Considerations

### API Call Optimization:
- ✅ Results cached for 24 hours
- ✅ Only geocode when creating/updating leads
- ✅ Frontend uses cached results
- ✅ Batch processing for multiple locations

### Rate Limit Management:
With 2,500 free requests per day:
- Creating 100 leads with locations = 100 API calls
- Can handle ~25 leads/hour continuously
- Cache reduces actual API calls significantly

### Cost Projection:
| Daily Leads | API Calls | Cost |
|------------|-----------|------|
| 0-100 | 0-100 | FREE |
| 100-250 | 100-250 | FREE |
| 250-2,500 | 250-2,500 | FREE |
| 2,500+ | 2,500+ | $50/month for 10k |

## Monitoring Usage

### Check Rate Limits:
The service logs rate limit info on each request:
```
OpenCage rate limit: 1234/2500 remaining
```

### Dashboard:
1. Go to [OpenCage Dashboard](https://opencagedata.com/dashboard)
2. View daily usage stats
3. Monitor remaining quota

## Troubleshooting

### Issue: "OPENCAGE_API_KEY not configured"
**Solution**: Add the API key to `.env.local`

### Issue: Rate limit exceeded
**Solution**: 
1. Check dashboard usage
2. Upgrade to paid tier if needed
3. Implement request throttling

### Issue: Inaccurate results
**Solution**:
1. Check confidence score (should be > 5)
2. Use more specific location queries
3. Include state/country in query

### Issue: Slow performance
**Solution**:
1. Check cache hit rate
2. Verify network connectivity
3. Consider batch processing for multiple locations

## Alternative Services (If Needed)

If you need more requests or different features:

### 1. Google Geocoding API
- **Free**: 1,000 requests/day
- **Paid**: $5 per 1,000 requests
- Most accurate, but more expensive

### 2. Mapbox Geocoding
- **Free**: 100,000 requests/month
- **Paid**: $0.50 per 1,000 requests
- Good for high-volume applications

### 3. LocationIQ
- **Free**: 5,000 requests/day
- **Paid**: Similar pricing to OpenCage
- Alternative to OpenCage

## Testing

### Manual Testing:
```bash
# Test the geocoding service
npm run test:geocoding

# Or create a test lead with location
```

### Test Cases:
- ✅ "Austin, TX" → Full normalization
- ✅ "LA" → Los Angeles
- ✅ "NYC" → New York
- ✅ "London" → London, UK
- ✅ "Invalid Location" → Fallback parsing

## Migration from Old System

### Before (Hardcoded Maps):
```typescript
// Limited coverage
const cityAliases = {
  la: "Los Angeles",
  nyc: "New York",
  // ... only ~10 cities
};
```

### After (Geocoding Service):
```typescript
// Unlimited coverage
const result = await locationGeocodingService.geocodeLocation("any city worldwide");
// Handles all cities, typos, variations
```

### Benefits:
1. ✅ No manual maintenance
2. ✅ Global coverage
3. ✅ Handles typos automatically
4. ✅ Returns lat/lng for future map features
5. ✅ Confidence scores for quality control

## Future Enhancements

With geocoding service in place, you can add:

1. **Map Visualization**: Use lat/lng to show leads on a map
2. **Distance Search**: "Find leads within 50 miles of Austin"
3. **Geo-targeting**: Automatically suggest locations based on user
4. **Location Analytics**: Most searched cities/states
5. **Address Autocomplete**: Real-time location suggestions

## Summary

The OpenCage Geocoding Service provides:
- ✅ **Free tier**: 2,500 requests/day
- ✅ **Global coverage**: Any location worldwide
- ✅ **Automatic normalization**: No manual mapping needed
- ✅ **Graceful fallback**: Still works without API key
- ✅ **Future-proof**: Supports advanced location features

**Recommended**: Sign up for the free tier and add the API key to get the best location parsing experience.
