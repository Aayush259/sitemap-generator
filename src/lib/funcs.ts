import { ISitemapLink } from "./interfaces";

// Function to generate sitemap XML.
export const generateSitemapXML = (links: ISitemapLink[]) => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const xmlOpenTag = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const xmlCloseTag = '</urlset>';

    const xmlLinks = links.map(link => {
        return `
        <url>
            <loc>${link.url}</loc>
            <priority>${link.data.priority}</priority>
            <lastmod>${link.data.lastmod}</lastmod>
        </url>`;
    }).join('\n');

    const xmlContent = xmlHeader + xmlOpenTag + xmlLinks + '\n' + xmlCloseTag;
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sitemap.xml';
    link.click();
    URL.revokeObjectURL(link.href);
};
