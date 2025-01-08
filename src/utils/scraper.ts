"use server";
import puppeteer from "puppeteer";
import { isAllowedScrapping } from "./isAllowedScraping";

export default async function scrapeData(previousState: unknown, formData: FormData) {

    // Extract the URL from the form data.
    const baseUrl = formData.get("url") as string;

    // Validate the URL.
    if (!baseUrl) {
        return {
            success: false,
            message: "URL is required",
            fieldData: {
                url: baseUrl,
            }
        };
    }

    // Create a set to keep track of visited URLs.
    const visited = new Set<string>();

    // Check if the URL is allowed to be scraped.
    const isAllowed = await isAllowedScrapping(baseUrl);

    // If not allowed, return a message.
    if (!isAllowed) {
        return {
            success: false,
            message: "Not allowed to scrape this website.",
            fieldData: {
                url: baseUrl,
            }
        };
    }

    // Launch a headless browser.
    const browser = await puppeteer.launch({
        headless: true,   // Ensure headless mode for server environments.
        args: ["--no-sandbox", "--disable-setuid-sandbox"],    // Add flags for server compatibility.
    });

    const page = await browser.newPage();   // Create a new page.

    try {
        // Initialize an array to store URLs to visit.
        const urlsToVisit = [baseUrl];
        const sitemap = new Map<string, boolean>();    // To store unique links within same domain.

        // While there are URLs to visit.
        while (urlsToVisit.length > 0) {
            // Get the next URL to visit.
            const currentUrl = urlsToVisit.pop();

            if (!currentUrl) break;     // Exit if no URL is found.

            // Check if the URL has already been visited.
            if (visited.has(currentUrl)) continue;

            visited.add(currentUrl);    // Mark as visited.

            try {
                // Navigate to current URL and capture the response.
                const response = await page.goto(currentUrl, { waitUntil: "networkidle2" });

                // Check the HTTP status code to determine if the link is broken.
                if (!response || response.status() >= 400) {
                    sitemap.set(currentUrl, true); // Mark as broken if status is 400 or higher.
                    continue;
                }

                sitemap.set(currentUrl, false);     // URL is not broken.
            } catch (error) {
                // If an error occurs, mark the URL as broken.
                sitemap.set(currentUrl, true);
                continue;
            };

            // Extract all links on the current page.
            const links = await page.evaluate(() =>
                Array.from(document.querySelectorAll("a"))
                    .map(link => link.href)
                    .filter(href => href.startsWith(location.origin))
            );

            // Add unvisited links to the queue.
            for (const link of links) {
                const cleanLink = link.split("#")[0]; // Remove anchors.
                if (!visited.has(cleanLink)) {
                    urlsToVisit.push(cleanLink);
                }
            }
        }

        return {
            success: true,
            sitemap: Array.from(sitemap.entries()).map(([url, broken]) => ({ url, broken })),
            fieldData: {
                url: baseUrl,
            }
        };
    } catch (error) {
        console.log("Error scraping data:", error);
        return {
            success: false,
            message: "An error occurred while scraping data.",
            fieldData: {
                url: baseUrl,
            }
        };
    } finally {
        await browser.close();
    }
}
