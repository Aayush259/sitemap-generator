"use server";

/**
 * Calculate priority for a given URL based on the number of slashes.
 * 
 * @param url - The URL to calculate priority for.
 * @returns Priority value ranging from 1.0 to 0.1.
 */

export default async function calculatePriority(url: string) {
    // Remove trailing slash (if any) to ensure consistent calculation.
    const cleanUrl = url.endsWith("/") ? url.slice(0, -1) : url;

    // Count the number of slashes after the protocol (https:// or http://).
    const pathSegments = cleanUrl.replace(/^https?:\/\//, "").split("/").slice(1).length;

    // Calculate priority: 1.0 for no slashes, decreasing by 0.1 per additional slash.
    const priority = Math.max(1.0 - pathSegments * 0.1, 0.1);

    return priority;
};
