"use client";

import { AlertCircle, Check, Copy, DollarSign, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAffiliate } from "@/hooks/use-affiliate";
import type { AffiliateReferral } from "@/types/affiliate";

interface AffiliateDashboardProps {
    userId: string;
    email: string;
    fullName: string;
    affiliateData: AffiliateReferral | null;
}

export function AffiliateDashboard({
    userId,
    email,
    fullName,
    affiliateData,
}: AffiliateDashboardProps) {
    const [copied, setCopied] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [alternativeEmail, setAlternativeEmail] = useState("");
    const [creationError, setCreationError] = useState<string | null>(null);
    const createAffiliate = useCreateAffiliate();

    const handleCopyLink = async () => {
        if (affiliateData?.rewardful_link) {
            await navigator.clipboard.writeText(affiliateData.rewardful_link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCreateAffiliate = (emailToUse?: string) => {
        const names = fullName.split(" ");
        const first_name = names[0] || "";
        const last_name = names.slice(1).join(" ") || "";

        setCreationError(null);

        createAffiliate.mutate({
            user_id: userId,
            email: emailToUse || email,
            first_name,
            last_name,
        }, {
            onError: (error: any) => {
                const errorMessage = error instanceof Error ? error.message : "Failed to create affiliate account";
                setCreationError(errorMessage);
                setShowEmailInput(true);
            },
            onSuccess: (result) => {
                if (!result.success && result.error) {
                    setCreationError(result.error);
                    setShowEmailInput(true);
                } else {
                    setShowEmailInput(false);
                    setCreationError(null);
                    setAlternativeEmail("");
                }
            }
        });
    };

    const handleRetryWithNewEmail = () => {
        if (alternativeEmail?.trim()) {
            handleCreateAffiliate(alternativeEmail.trim());
        }
    };

    if (!affiliateData) {
        return (
            <div className="space-y-6">
                {/* Hero Section */}
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white shadow-lg">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-4 font-bold text-3xl">
                            Join Our Affiliate Program
                        </h2>
                        <p className="mb-6 text-indigo-100 text-lg">
                            Earn lifetime commissions by sharing LeadCore AI with your
                            network. Get paid for every successful referral!
                        </p>

                        {/* Error Alert */}
                        {creationError && (
                            <Alert className="mb-6 border-red-200 bg-red-50 text-left">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    {creationError}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Alternative Email Input */}
                        {showEmailInput ? (
                            <div className="mx-auto max-w-md space-y-4">
                                <div className="rounded-lg bg-white/10 p-6 text-left backdrop-blur-sm">
                                    <Label className="mb-2 block font-medium text-sm text-white">
                                        Try with a different email address
                                    </Label>
                                    <Input
                                        className="mb-4 border-white/20 bg-white/10 text-white placeholder:text-white/60"
                                        onChange={(e) => setAlternativeEmail(e.target.value)}
                                        placeholder="Enter alternative email"
                                        type="email"
                                        value={alternativeEmail}
                                    />
                                    <div className="flex gap-3">
                                        <Button
                                            className="flex-1 border-white/20 bg-white/10 font-semibold text-white hover:bg-white/20"
                                            disabled={!alternativeEmail.trim() || createAffiliate.isPending}
                                            onClick={handleRetryWithNewEmail}
                                            size="lg"
                                        >
                                            {createAffiliate.isPending ? "Creating..." : "Retry"}
                                        </Button>
                                        <Button
                                            className="flex-1 border-white/20 bg-white/5 font-semibold text-white hover:bg-white/10"
                                            onClick={() => {
                                                setShowEmailInput(false);
                                                setCreationError(null);
                                                setAlternativeEmail("");
                                            }}
                                            size="lg"
                                            variant="outline"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm text-white/80">
                                    Your account email: <span className="font-semibold">{email}</span>
                                </p>
                            </div>
                        ) : (
                            <Button
                                className="h-12 bg-white px-8 font-semibold text-indigo-600 hover:bg-gray-50"
                                disabled={createAffiliate.isPending}
                                onClick={() => handleCreateAffiliate()}
                                size="lg"
                            >
                                {createAffiliate.isPending
                                    ? "Creating Account..."
                                    : "Become an Affiliate"}
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Benefits Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="p-6">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="mb-2 font-bold text-gray-900 text-xl">
                            Lifetime Commissions
                        </h3>
                        <p className="text-gray-600">
                            Earn 30% recurring commissions for the lifetime of your referrals.
                            Get paid every month!
                        </p>
                    </Card>

                    <Card className="p-6">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="mb-2 font-bold text-gray-900 text-xl">
                            Easy to Share
                        </h3>
                        <p className="text-gray-600">
                            Get your unique referral link and share it anywhere - social
                            media, blog, email, or website.
                        </p>
                    </Card>

                    <Card className="p-6">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="mb-2 font-bold text-gray-900 text-xl">
                            Real-Time Tracking
                        </h3>
                        <p className="text-gray-600">
                            Monitor your referrals, conversions, and earnings in real-time
                            through the Rewardful portal.
                        </p>
                    </Card>
                </div>

                {/* How It Works */}
                <Card className="p-8">
                    <h3 className="mb-6 font-bold text-2xl text-gray-900">
                        How It Works
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                                1
                            </div>
                            <div>
                                <h4 className="mb-1 font-semibold text-gray-900">
                                    Sign Up as an Affiliate
                                </h4>
                                <p className="text-gray-600">
                                    Click the button above to create your affiliate account and get
                                    your unique referral link.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600">
                                2
                            </div>
                            <div>
                                <h4 className="mb-1 font-semibold text-gray-900">
                                    Share Your Link
                                </h4>
                                <p className="text-gray-600">
                                    Promote LeadCore AI using your referral link across your
                                    channels, blog, or network.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-bold text-green-600">
                                3
                            </div>
                            <div>
                                <h4 className="mb-1 font-semibold text-gray-900">
                                    Earn Commissions
                                </h4>
                                <p className="text-gray-600">
                                    Get 30% recurring commissions every month when your referrals
                                    subscribe to any paid plan.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Affiliate Stats Hero */}
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white shadow-lg">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="mb-2 font-bold text-3xl">Your Referral Link</h2>
                            <p className="text-indigo-100 text-lg">
                                Share this link to start earning commissions
                            </p>
                        </div>
                        <Badge className="border-green-300 bg-green-500 px-4 py-2 text-white">
                            Active Affiliate
                        </Badge>
                    </div>

                    <div className="flex items-center space-x-3 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate font-mono text-white">
                                {affiliateData.rewardful_link}
                            </p>
                        </div>
                        <Button
                            className="h-10 shrink-0 border-white/20 bg-white/10 font-semibold text-white hover:bg-white/20"
                            onClick={handleCopyLink}
                            size="sm"
                            variant="outline"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Link
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Rewardful Portal Info */}
            <Card className="p-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                            <TrendingUp className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h3 className="mb-3 font-bold text-2xl text-gray-900">
                        Track Your Performance
                    </h3>
                    <p className="mb-6 text-gray-600 text-lg">
                        Access your detailed affiliate dashboard to view referrals,
                        conversions, and earnings in real-time.
                    </p>
                    <Button
                        asChild
                        className="h-12 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 font-semibold text-white hover:from-indigo-700 hover:to-purple-700"
                        size="lg"
                    >
                        <a
                            href="https://leadcoreai.getrewardful.com/affiliates/sign_in"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Open Rewardful Portal
                        </a>
                    </Button>
                </div>
            </Card>

            {/* Commission Details */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                        <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 font-bold text-gray-900 text-xl">
                        Commission Structure
                    </h3>
                    <div className="space-y-2 text-gray-600">
                        <p>• 30% recurring commission on all plans</p>
                        <p>• Lifetime earnings from your referrals</p>
                        <p>• Monthly payouts via PayPal or Stripe</p>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 font-bold text-gray-900 text-xl">
                        Marketing Resources
                    </h3>
                    <div className="space-y-2 text-gray-600">
                        <p>• Pre-made email templates</p>
                        <p>• Social media graphics</p>
                        <p>• Integration guides & tutorials</p>
                    </div>
                </Card>
            </div>

            {/* Tips for Success */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8">
                <h3 className="mb-4 font-bold text-gray-900 text-xl">
                    Tips for Success
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start space-x-3">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                        <p className="text-gray-700">
                            Share your link in relevant communities and forums
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-600" />
                        <p className="text-gray-700">
                            Write blog posts or tutorials about lead generation
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                        <p className="text-gray-700">
                            Create YouTube videos showcasing LeadCore AI features
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-600" />
                        <p className="text-gray-700">
                            Engage with your audience and provide value first
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

