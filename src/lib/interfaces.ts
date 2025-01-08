
export interface ISitemapLink {
    url: string;
    data: {
        broken: boolean;
        priority: number;
        lastmod: string;
    };
};
