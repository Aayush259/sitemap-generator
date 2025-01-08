import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sitemap Generator & Broken Links Checker",
    description: "Generate sitemaps and easily identify broken links on your website. Improve your site's SEO and ensure proper indexing by search engines.",
};

export default function Page() {
    return (
        <Home />
    );
};
