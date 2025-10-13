"use client";

import { Filter, MapPin, Search, Sparkles, TrendingUp, X } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LeadFilters, LeadSource, LeadStatus } from "@/types/lead";

interface UnifiedLeadFiltersProps {
    filters: LeadFilters;
    onFiltersChange: (filters: LeadFilters) => void;
    totalCount: number;
    filteredCount: number;
}

// Popular preset searches
const PRESET_SEARCHES = [
    {
        label: "HRT Clinics in Austin",
        businessType: "HRT clinic",
        location: "Austin, TX",
    },
    { label: "Dentists in London", businessType: "dentist", location: "London" },
    {
        label: "Plumbers in Denver",
        businessType: "plumber",
        location: "Denver, CO",
    },
    {
        label: "Trucking in Ohio",
        businessType: "trucking company",
        location: "Ohio",
    },
    {
        label: "Restaurants in NYC",
        businessType: "restaurant",
        location: "New York, NY",
    },
    {
        label: "Law Firms in LA",
        businessType: "law firm",
        location: "Los Angeles, CA",
    },
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

export function UnifiedLeadFilters({
    filters,
    onFiltersChange,
    totalCount,
    filteredCount,
}: UnifiedLeadFiltersProps) {
    const [activeTab, setActiveTab] = useState<"quick" | "advanced">("quick");
    const [customBusinessType, setCustomBusinessType] = useState("");
    const [businessType, setBusinessType] = useState("");

    const handleFilterChange = (key: keyof LeadFilters, value: unknown) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

    const handlePresetClick = (preset: (typeof PRESET_SEARCHES)[0]) => {
        onFiltersChange({
            ...filters,
            business_type: preset.businessType,
            location: preset.location,
        });
    };

    const clearAllFilters = () => {
        onFiltersChange({});
        setBusinessType("");
        setCustomBusinessType("");
    };

    const hasActiveFilters = Object.keys(filters).length > 0;
    const activeFilterCount = Object.keys(filters).filter(
        (key) => !["page", "limit"].includes(key)
    ).length;

    return (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-gray-200 border-b p-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                            <Filter className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-base text-gray-900">
                            Search & Filter
                        </span>
                        {activeFilterCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 text-xs">
                                {activeFilterCount}
                            </span>
                        )}
                    </div>
                    <div className="hidden text-gray-600 text-sm md:block">
                        {filteredCount} of {totalCount} leads
                    </div>
                </div>

                {hasActiveFilters && (
                    <Button
                        className="h-8 gap-1 px-3 text-xs"
                        onClick={clearAllFilters}
                        size="sm"
                        variant="outline"
                    >
                        <X className="h-3 w-3" />
                        Clear All
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs
                className="px-4 pb-4"
                defaultValue="quick"
                onValueChange={(value: string) =>
                    setActiveTab(value as "quick" | "advanced")
                }
                value={activeTab}
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger className="gap-2" value="quick">
                        <Sparkles className="h-4 w-4" />
                        Quick Search
                    </TabsTrigger>
                    <TabsTrigger className="gap-2" value="advanced">
                        <Filter className="h-4 w-4" />
                        Advanced Filters
                    </TabsTrigger>
                </TabsList>

                {/* Quick Search Tab */}
                <TabsContent className="mt-4 space-y-4" value="quick">
                    {/* Preset Buttons */}
                    <div>
                        <div className="mb-3 flex items-center gap-2 text-gray-700 text-sm">
                            <TrendingUp className="h-4 w-4 text-indigo-600" />
                            <span className="font-medium">Popular Searches</span>
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

                    {/* Quick Search Inputs */}
                    <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 sm:grid-cols-2">
                        {/* Business Type */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-700 text-sm">
                                <Search className="h-3.5 w-3.5" />
                                <span className="font-medium">Business Type</span>
                            </div>
                            <Select
                                onValueChange={(value) => {
                                    setBusinessType(value);
                                    if (value !== "custom") {
                                        setCustomBusinessType("");
                                        handleFilterChange("business_type", value);
                                    }
                                }}
                                value={businessType || filters.business_type || ""}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select type..." />
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
                                    onChange={(e) => {
                                        setCustomBusinessType(e.target.value);
                                        handleFilterChange(
                                            "business_type",
                                            e.target.value || undefined
                                        );
                                    }}
                                    placeholder="Enter custom type"
                                    value={customBusinessType}
                                />
                            )}
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-700 text-sm">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="font-medium">Location</span>
                            </div>
                            <Input
                                className="h-10"
                                onChange={(e) =>
                                    handleFilterChange("location", e.target.value || undefined)
                                }
                                placeholder="City, State, or Country"
                                value={filters.location || ""}
                            />
                            <p className="text-gray-500 text-xs">
                                e.g., "Austin", "LA", "Texas", "Denver, CO"
                            </p>
                        </div>
                    </div>

                    {/* Tip */}
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                        <p className="text-blue-900 text-sm">
                            <strong>💡 Tip:</strong> Use preset buttons for instant results,
                            or customize your search above.
                        </p>
                    </div>
                </TabsContent>

                {/* Advanced Filters Tab */}
                <TabsContent className="mt-4 space-y-4" value="advanced">
                    {/* Search */}
                    <div className="relative">
                        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
                        <Input
                            className="h-10 pl-10"
                            onChange={(e) =>
                                handleFilterChange("search", e.target.value || undefined)
                            }
                            placeholder="Search by URL, title, or description..."
                            value={filters.search || ""}
                        />
                    </div>

                    {/* Primary Filters Row */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {/* Source */}
                        <Select
                            onValueChange={(value) =>
                                handleFilterChange(
                                    "source",
                                    value === "all" ? undefined : (value as unknown as LeadSource)
                                )
                            }
                            value={
                                Array.isArray(filters.source)
                                    ? filters.source[0] || "all"
                                    : (filters.source ?? "all")
                            }
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="All Sources" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="shopify">Shopify</SelectItem>
                                <SelectItem value="etsy">Etsy</SelectItem>
                                <SelectItem value="g2">G2</SelectItem>
                                <SelectItem value="woocommerce">WooCommerce</SelectItem>
                                <SelectItem value="google_places">Google Places</SelectItem>
                                <SelectItem value="npi_registry">NPI Registry</SelectItem>
                                <SelectItem value="fmcsa">FMCSA</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Status */}
                        <Select
                            onValueChange={(value) =>
                                handleFilterChange(
                                    "status",
                                    value === "all" ? undefined : (value as unknown as LeadStatus)
                                )
                            }
                            value={
                                Array.isArray(filters.status)
                                    ? filters.status[0] || "all"
                                    : (filters.status ?? "all")
                            }
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="scraped">Scraped</SelectItem>
                                <SelectItem value="enriched">Enriched</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Email Status */}
                        <Select
                            onValueChange={(value) =>
                                handleFilterChange(
                                    "verify_email_status",
                                    value === "all" ? undefined : (value as unknown as LeadStatus)
                                )
                            }
                            value={
                                Array.isArray(filters.verify_email_status)
                                    ? filters.verify_email_status[0] || "all"
                                    : (filters.verify_email_status ?? "all")
                            }
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Email Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Email Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location Filters */}
                    <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                        <div className="font-medium text-gray-700 text-sm">
                            Location Filters
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Input
                                className="h-10"
                                onChange={(e) =>
                                    handleFilterChange("city", e.target.value || undefined)
                                }
                                placeholder="City"
                                value={filters.city || ""}
                            />
                            <Input
                                className="h-10"
                                onChange={(e) =>
                                    handleFilterChange("state", e.target.value || undefined)
                                }
                                placeholder="State (e.g., TX)"
                                value={filters.state || ""}
                            />
                            <Input
                                className="h-10"
                                onChange={(e) =>
                                    handleFilterChange("country", e.target.value || undefined)
                                }
                                placeholder="Country"
                                value={filters.country || ""}
                            />
                            <Input
                                className="h-10"
                                onChange={(e) =>
                                    handleFilterChange(
                                        "business_type",
                                        e.target.value || undefined
                                    )
                                }
                                placeholder="Business Type"
                                value={filters.business_type || ""}
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                        <div className="font-medium text-gray-700 text-sm">Date Range</div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <Input
                                    className="h-10"
                                    id="date-from"
                                    onChange={(e) => {
                                        const currentRange = filters.date_range || {
                                            start: "",
                                            end: "",
                                        };
                                        handleFilterChange("date_range", {
                                            ...currentRange,
                                            start: e.target.value,
                                        });
                                    }}
                                    placeholder="From"
                                    type="date"
                                    value={filters.date_range?.start || ""}
                                />
                            </div>
                            <div>
                                <Input
                                    className="h-10"
                                    id="date-to"
                                    onChange={(e) => {
                                        const currentRange = filters.date_range || {
                                            start: "",
                                            end: "",
                                        };
                                        handleFilterChange("date_range", {
                                            ...currentRange,
                                            end: e.target.value,
                                        });
                                    }}
                                    placeholder="To"
                                    type="date"
                                    value={filters.date_range?.end || ""}
                                />
                            </div>
                            <Button
                                className="h-10"
                                onClick={() => handleFilterChange("date_range", undefined)}
                                variant="outline"
                            >
                                Clear Dates
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
