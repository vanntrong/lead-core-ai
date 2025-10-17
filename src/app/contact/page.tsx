"use client";

import {
    Clock,
    Globe,
    Mail,
    MapPin,
    MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-auth";
import ContactForm from "./ContactForm";

export default function ContactPage() {
    const { data: currentUser } = useCurrentUser();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="border-gray-100 border-b bg-white/95 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2">
                                <Globe className="h-6 w-6 text-white" />
                            </div>
                            <Link className="font-bold text-gray-900 text-xl" href="/">
                                LeadCore AI
                            </Link>
                        </div>
                        <div className="flex items-center gap-x-3">
                            {!currentUser ? (
                                <>
                                    <Button
                                        asChild
                                        className="h-10 rounded-lg border border-gray-200 bg-white px-4 font-medium text-gray-900 text-sm shadow-sm hover:bg-gray-50"
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Link href="/login">Sign In</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        className="h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 font-medium text-sm text-white shadow-sm hover:from-indigo-700 hover:to-purple-700"
                                        size="sm"
                                    >
                                        <Link href="/signup">Get Started</Link>
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    asChild
                                    className="h-10 rounded-lg border border-gray-200 bg-white px-4 font-medium text-gray-900 text-sm shadow-sm hover:bg-gray-50"
                                    size="sm"
                                    variant="outline"
                                >
                                    <Link
                                        href={
                                            currentUser.is_admin
                                                ? "/admin/dashboard/scraper-logs"
                                                : "/dashboard"
                                        }
                                    >
                                        Dashboard
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="px-4 py-16">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 font-medium text-indigo-600 text-sm">
                            <MessageSquare className="h-4 w-4" />
                            We're here to help
                        </div>
                        <h1 className="mb-4 font-bold text-4xl text-gray-900 tracking-tight md:text-5xl">
                            Get in{" "}
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Touch
                            </span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-gray-600 text-xl">
                            Have a question or need support? We'd love to hear from you. Send
                            us a message and we'll respond as soon as possible.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Contact Information */}
                        <div className="space-y-6 lg:col-span-1">
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-gray-900">
                                        Contact Information
                                    </CardTitle>
                                    <CardDescription>
                                        Reach out to us through any of these channels
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                                            <Mail className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-gray-900 text-sm">
                                                Email
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                support@leadcoreai.com
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                            <Clock className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-gray-900 text-sm">
                                                Response Time
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                Within 24-48 hours
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                            <MapPin className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-gray-900 text-sm">
                                                Support Hours
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                Monday - Friday
                                                <br />
                                                9:00 AM - 6:00 PM EST
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <ContactForm

                            />
                        </div>
                    </div>
                </div>
            </div>

            <footer className="border-gray-100 border-t bg-white py-8">
                <p className="text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} LeadCore AI. Powered by $TOWN.
                </p>
            </footer>
        </div>
    );
}
