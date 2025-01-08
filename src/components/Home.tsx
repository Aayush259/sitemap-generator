"use client";
import { ISitemapLink } from "@/lib/interfaces";
import scrapeData from "@/utils/scraper";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import UrlRow from "./UrlRow";

export default function Home() {

    const [data, action, isPending] = useActionState(scrapeData, null);

    const [sitemapLinks, setSitemapLinks] = useState<ISitemapLink[]>([]);
    const [brokenLinks, setBrokenLinks] = useState<ISitemapLink[]>([]);

    useEffect(() => {
        if (data?.success && data?.sitemap) {
            console.log(data);
            setSitemapLinks(data.sitemap.filter(link => !link.data.broken));
            setBrokenLinks(data.sitemap.filter(link => link.data.broken));
        } else {
            console.log(data);
        }
    }, [data]);

    return (
        <main className="overflow-hidden font-[family-name:var(--font-geist-sans)] text-neutral-300 py-20">

            <p className="mx-auto w-[600px] max-w-[95vw] text-lg my-1 flex items-end justify-between gap-4">
                <span>{"Page Url"}</span>

                {
                    (!data?.success && !isPending && data?.message) && <span className="text-xs tracking-wider text-red-500">{data?.message}{"*"}</span>
                }
            </p>

            <form className="w-[600px] max-w-[95vw] mx-auto flex items-center justify-center" action={action}>

                <label htmlFor="url" className="flex-grow">
                    <input
                        type="text"
                        name="url"
                        id="url"
                        className="w-full outline-none border border-neutral-300 rounded-l-sm px-4 py-1 bg-transparent focus:border-blue-600"
                        defaultValue={data?.fieldData?.url}
                    />
                </label>

                <button type="submit" className="rounded-r-sm bg-blue-600 px-4 py-[5px] flex items-center justify-center border border-blue-600 disabled:opacity-30 disabled:hover:opacity-30 hover:opacity-70 duration-300" disabled={isPending}>
                    <FaArrowRight size={24} />
                </button>
            </form>

            <div className="w-[620px] max-w-[95vw] mx-auto overflow-auto">
                {
                    isPending && <div className="w-[400px] max-w-[85vw] h-2 mx-auto my-10 bg-white/10 rounded-full relative overflow-hidden before:absolute before:top-0 before:h-full before:bg-blue-600 before:rounded-full before:animate-progress-bar" />
                }

                <div className="min-w-[620px] w-[620px] max-w-[95vw] mx-auto my-8 px-4">
                    {
                        sitemapLinks.length > 0 && <p className="text-xl mb-2 font-semibold">{"URL:"}</p>
                    }

                    {
                        sitemapLinks.map((link, index) => <UrlRow key={index} link={link} />)
                    }
                </div>

                <div className="min-w-[620px] w-[620px] max-w-[95vw] mx-auto my-8 px-4">
                    {
                        brokenLinks.length > 0 && <p className="text-xl mb-2 font-semibold">{"Broken Links:"}</p>
                    }

                    {
                        brokenLinks.map((link, index) => <UrlRow key={index} link={link} />)
                    }
                </div>
            </div>
        </main>
    );
};
