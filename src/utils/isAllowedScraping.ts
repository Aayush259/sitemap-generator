"use server";
import chromium from '@sparticuz/chromium-min';
import puppeteer, { type Browser } from 'puppeteer';
import puppeteerCore, { type Browser as BrowserCore } from 'puppeteer-core';

export async function isAllowedScrapping(baseUrl: string) {

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
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );  // Set a user agent to mimic a browser.

    try {
        // Navigate to the robots.txt file.
        const robotsUrl = new URL("/robots.txt", baseUrl).href;

        await page.goto(robotsUrl, { waitUntil: "networkidle2" });

        // Extract the content of the robots.txt file.
        const robotsTxt = await (page.evaluate as unknown as <T>(fn: () => T) => Promise<T>)(() => {
            return document.body?.innerText || '';
        });
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
                if (disallowedPath && baseUrl.includes(disallowedPath)) {
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