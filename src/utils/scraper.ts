import puppeteer from "puppeteer";
import { isAllowedScrapping } from "./isAllowedScraping";

/**
 * Scrapes a given URL and extracts data.
 * @param {string} baseUrl - The URL to scrape.
 * @param {Set<string>} visited - A set of already visited URLs to avoid duplicates.
 * @returns {Object} - The scraped data.
*/

export async function scrapeData(baseUrl: string, visited = new Set<string>()) {

    // Check if the URL is allowed to be scraped.
    const isAllowed = await isAllowedScrapping(baseUrl);

    // If not allowed, return a message.
    if (!isAllowed) {
        return "Not allowed to scrape this website.";
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
        const sitemap = new Set();    // To store unique links within same domain.

        // While there are URLs to visit.
        while (urlsToVisit.length > 0) {
            // Get the next URL to visit.
            const currentUrl = urlsToVisit.pop();

            if (!currentUrl) break;     // Exit if no URL is found.

            // Check if the URL has already been visited.
            if (visited.has(currentUrl)) continue;

            visited.add(currentUrl);    // Mark as visited.

            // Navigate to current URL.
            await page.goto(currentUrl, { waitUntil: "networkidle2" });

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
                sitemap.add(cleanLink);
            }
        }

        return Array.from(sitemap);
    } catch (error) {
        console.log("Error scraping data:", error);
        return null;
    } finally {
        await browser.close();
    }
}
