import { scrapeData } from "@/utils/scraper";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    };

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, message: "URL is required" });
    };

    try {
        const data = await scrapeData(url);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    };
};
