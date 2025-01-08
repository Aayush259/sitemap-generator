"use server";
import puppeteer from "puppeteer-core";

export async function isAllowedScrapping(baseUrl: string) {

    // Launch a headless browser.
    const browser = await puppeteer.launch({
        executablePath: process.env.CHROME_BIN || "/usr/bin/chromium-browser",
        headless: true
    });
    const page = await browser.newPage();   // Create a new page.
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );  // Set a user agent to mimic a browser.

    try {
        // Navigate to the robots.txt file.
        const robotsUrl = new URL("/robots.txt", baseUrl).href;

        await page.goto(robotsUrl, { waitUntil: "networkidle2" });

        // Extract the content of the robots.txt file.
        const robotsTxt = await page.evaluate(() => document.body.innerText);
        await browser.close();  // Close the browser.

        // Parse the robots.txt content.
        const lines = robotsTxt.split("\n");
        let isAllowed = true;
        let appliesToUserAgent = false;

        // Check if the user agent is allowed.
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("User-agent:")) {
                appliesToUserAgent = trimmedLine.includes("*");
            } else if (appliesToUserAgent && trimmedLine.startsWith("Disallow:")) {
                console.log(trimmedLine);
                const disallowedPath = trimmedLine.split(":")[1]?.trim();
                if (baseUrl.includes(disallowedPath)) {
                    isAllowed = false;
                    break;
                }
            }
        }

        return isAllowed;
    } catch (error) {
        console.log("Error checking robots.txt:", error);
        return false;   // Assuming no permission on error.
    }
};
