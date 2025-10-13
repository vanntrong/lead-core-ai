"use client";

import { MapPin, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PresetSearchProps {
    onSearch: (businessType: string, location: string) => void;
}

// Popular preset searches
const PRESET_SEARCHES = [
    { label: "HRT Clinics in Austin", businessType: "HRT clinic", location: "Austin, TX" },
    { label: "Dentists in London", businessType: "dentist", location: "London" },
    { label: "Plumbers in Denver", businessType: "plumber", location: "Denver, CO" },
    { label: "Trucking Companies in Ohio", businessType: "trucking company", location: "Ohio" },
    { label: "Restaurants in NYC", businessType: "restaurant", location: "New York, NY" },
    { label: "Law Firms in LA", businessType: "law firm", location: "Los Angeles, CA" },
];

const BUSINESS_TYPES = [
    "HRT clinic",
    "dentist",
    "doctor",
    "plumber",
    "electrician",
    "trucking company",
    "restaurant",
    "retail store",
    "law firm",
    "accountant",
    "real estate",
    "gym",
    "salon",
    "spa",
    "auto repair",
    "veterinarian",
];

export function PresetSearch({ onSearch }: PresetSearchProps) {
    const [businessType, setBusinessType] = useState("");
    const [location, setLocation] = useState("");
    const [customBusinessType, setCustomBusinessType] = useState("");

    const handleSearch = () => {
        const finalBusinessType = businessType === "custom" ? customBusinessType : businessType;
        if (finalBusinessType && location) {
            onSearch(finalBusinessType, location);
        }
    };

    const isSearchDisabled = () => {
        const hasNoBusinessType = !businessType;
        const hasNoLocation = !location;
        if (hasNoBusinessType) {
            return true;
        }
        if (hasNoLocation) {
            return true;
        }
        if (businessType === "custom" && !customBusinessType) {
            return true;
        }
        return false;
    };

    const handlePresetClick = (preset: typeof PRESET_SEARCHES[0]) => {
        setBusinessType(preset.businessType);
        setLocation(preset.location);
        // Auto-search when clicking preset
        onSearch(preset.businessType, preset.location);
    };

    return (
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Search className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Preset Search</h3>
                        <p className="text-gray-600 text-sm">
                            Find leads by business type and location
                        </p>
                    </div>
                </div>
                <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>

            {/* Quick Presets */}
            <div>
                <div className="mb-2 font-medium text-gray-700 text-sm">
                    Popular Searches
                </div>
                <div className="flex flex-wrap gap-2">
                    {PRESET_SEARCHES.map((preset) => (
                        <Button
                            className="h-8 text-xs"
                            key={preset.label}
                            onClick={() => handlePresetClick(preset)}
                            size="sm"
                            type="button"
                            variant="outline"
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Custom Search Form */}
            <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h4 className="font-medium text-gray-900 text-sm">Custom Search</h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Business Type Selector */}
                    <div className="space-y-2">
                        <div className="font-medium text-gray-700 text-sm">
                            Business Type
                        </div>
                        <Select
                            onValueChange={(value) => {
                                setBusinessType(value);
                                if (value !== "custom") {
                                    setCustomBusinessType("");
                                }
                            }}
                            value={businessType}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                                {BUSINESS_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </SelectItem>
                                ))}
                                <SelectItem value="custom">Custom...</SelectItem>
                            </SelectContent>
                        </Select>

                        {businessType === "custom" && (
                            <Input
                                className="h-10"
                                onChange={(e) => setCustomBusinessType(e.target.value)}
                                placeholder="Enter custom business type"
                                value={customBusinessType}
                            />
                        )}
                    </div>

                    {/* Location Input */}
                    <div className="space-y-2">
                        <div className="font-medium text-gray-700 text-sm">
                            Location
                        </div>
                        <div className="relative">
                            <MapPin className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
                            <Input
                                className="h-10 pl-10"
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="City, State, or Country"
                                value={location}
                            />
                        </div>
                        <p className="text-gray-500 text-xs">
                            Examples: "Austin", "LA", "Texas", "Denver, CO"
                        </p>
                    </div>
                </div>

                {/* Search Button */}
                <Button
                    className="w-full"
                    disabled={isSearchDisabled()}
                    onClick={handleSearch}
                    size="lg"
                    type="button"
                >
                    <Search className="mr-2 h-4 w-4" />
                    Search Leads
                </Button>
            </div>

            {/* Help Text */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-blue-900 text-sm">
                    <strong>💡 Tip:</strong> We support flexible location searches. Try "LA", "Los Angeles",
                    "Denver", "Austin, TX", or even just a state like "Ohio" or "California".
                </p>
            </div>
        </div>
    );
}
