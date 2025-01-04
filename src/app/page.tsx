import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sitemap Generator",
    description: "Generate a sitemap for your website",
};

export default function Page() {
    return (
        <Home />
    );
};
