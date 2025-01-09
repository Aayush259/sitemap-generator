"use server";
import chromium from '@sparticuz/chromium-min';
import puppeteer, { type Browser } from 'puppeteer';
import puppeteerCore, { type Browser as BrowserCore } from 'puppeteer-core';
import { isAllowedScrapping } from "./isAllowedScraping";
import calculatePriority from "./calculatePriority";

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
    const visited = new Map<string, number>();

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

    let browser: Browser | BrowserCore;

    if (process.env.ENVIRONMENT === 'production') {
        const executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar')
        browser = await puppeteerCore.launch({
            executablePath,
            args: chromium.args,
            headless: chromium.headless,
            defaultViewport: chromium.defaultViewport,
        })
    } else {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
    }

    const page = await browser.newPage();   // Create a new page.

    try {
        // Initialize an array to store URLs to visit.
        const urlsToVisit: { url: string; depth: number }[] = [{ url: baseUrl, depth: 0 }];
        const sitemap = new Map<string, { broken: boolean; priority: number; lastmod: string }>();    // To store unique links within same domain.

        // While there are URLs to visit.
        while (urlsToVisit.length > 0) {
            // Get the next URL to visit.
            const { url: currentUrl, depth } = urlsToVisit.pop()!;

            // Check if the URL has already been visited.
            if (visited.has(currentUrl) && visited.get(currentUrl)! <= depth) continue;

            visited.set(currentUrl, depth);    // Mark as visited.
            const priority = await calculatePriority(currentUrl);

            try {
                // Navigate to current URL and capture the response.
                const response = await page.goto(currentUrl, { waitUntil: "networkidle2" });

                // Check the HTTP status code to determine if the link is broken.
                const isBroken = !response || response.status() >= 400;

                // Add the URL to the sitemap with its attributes.
                sitemap.set(currentUrl, {
                    broken: isBroken,
                    priority: priority,
                    lastmod: new Date().toISOString(), // Use current date as last modified.
                });

                if (isBroken) continue;
            } catch (error) {
                console.log(error);

                // Mark as broken if an error occurs during navigation.
                sitemap.set(currentUrl, {
                    broken: true,
                    priority: priority,
                    lastmod: new Date().toISOString(),
                });
                continue;
            };

            // Extract all links on the current page.
            const links = await (page.evaluate as unknown as <T>(fn: () => T) => Promise<T>)(() =>
                Array.from(document.querySelectorAll("a"))
                    .map(link => link.href)
                    .filter(href => href.startsWith(location.origin))
            );

            // Add unvisited links to the queue with incremented depth.
            for (const link of links) {
                const cleanLink = link.split("#")[0]; // Remove anchors.
                if (!visited.has(cleanLink)) {
                    const priority = await calculatePriority(cleanLink);
                    urlsToVisit.push({ url: cleanLink, depth: priority });
                }
            }
        }

        return {
            success: true,
            sitemap: Array.from(sitemap.entries()).map(([url, data]) => ({ url, data })),
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
