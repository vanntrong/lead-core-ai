"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Valid email is required"),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
    defaultName?: string;
    defaultEmail?: string;
}

export default function ContactForm({
    defaultName = "",
    defaultEmail = "",
}: ContactFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: defaultName,
            email: defaultEmail,
        },
    });

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to send message");
            }

            setSubmitSuccess(true);
            reset({
                name: defaultName,
                email: defaultEmail,
                subject: "",
                message: "",
            });
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : "Failed to send message"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border-0 shadow-2xl">
            <CardHeader>
                <CardTitle className="text-2xl text-gray-900">
                    Send us a message
                </CardTitle>
                <CardDescription>
                    Fill out the form below and we'll get back to you shortly
                </CardDescription>
            </CardHeader>
            <CardContent>
                {submitSuccess && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">
                            Message sent successfully!
                        </AlertTitle>
                        <AlertDescription className="text-green-700">
                            Thank you for contacting us. We've sent a confirmation email and
                            will respond to your inquiry within 24-48 hours.
                        </AlertDescription>
                    </Alert>
                )}

                {submitError && (
                    <Alert className="mb-6" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                )}

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label
                                className="font-medium text-gray-700 text-sm"
                                htmlFor="name"
                            >
                                Name
                            </Label>
                            <Input
                                className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                id="name"
                                placeholder="Your full name"
                                {...register("name")}
                                errorMessage={errors.name?.message}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                className="font-medium text-gray-700 text-sm"
                                htmlFor="email"
                            >
                                Email
                            </Label>
                            <Input
                                className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                id="email"
                                placeholder="your.email@example.com"
                                type="email"
                                {...register("email")}
                                errorMessage={errors.email?.message}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            className="font-medium text-gray-700 text-sm"
                            htmlFor="subject"
                        >
                            Subject
                        </Label>
                        <Input
                            className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            id="subject"
                            placeholder="What is this regarding?"
                            {...register("subject")}
                            errorMessage={errors.subject?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label
                            className="font-medium text-gray-700 text-sm"
                            htmlFor="message"
                        >
                            Message
                        </Label>
                        <Textarea
                            className="min-h-[150px] border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            id="message"
                            placeholder="Tell us more about your inquiry..."
                            {...register("message")}
                        />
                        {errors.message && (
                            <p className="text-red-500 text-sm">{errors.message.message}</p>
                        )}
                    </div>

                    <Button
                        className="h-12 w-full transform bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-lg text-white shadow-lg transition-all hover:scale-105 hover:from-indigo-700 hover:to-purple-700 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Sending message...
                            </>
                        ) : (
                            <>
                                Send Message
                                <Send className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
