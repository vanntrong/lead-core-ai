import { CreditCard, MessageCircle, Send, Users } from "lucide-react";

export const EcosystemLinks = [
    {
        name: "LeadCore AI",
        description: "Find your next customer",
        href: "/",
        icon: <Users className="h-4 w-4" color="white" />,
        target: "_self",
    },
    {
        name: "TownSend",
        description: "Cold email outreach platform",
        href: "/townsend",
        icon: <Send className="h-4 w-4" color="white" />,
        target: "_blank",
    },
    {
        name: "TownEcho",
        description: "Social media management",
        href: "https://www.townecho.io/",
        icon: <MessageCircle className="h-4 w-4" color="white" />,
        target: "_blank",
    },
    {
        name: "TownPay",
        description: "Payment processing for agencies",
        href: "https://www.townpay.io/",
        icon: <CreditCard className="h-4 w-4" color="white" />,
        target: "_blank",
    },
];
