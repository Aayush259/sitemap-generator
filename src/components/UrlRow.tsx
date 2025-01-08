import { ISitemapLink } from "@/lib/interfaces";
import Link from "next/link";

const UrlRow: React.FC<{ link: ISitemapLink }> = ({ link }) => {

    return (
        <div className="grid [grid-template-columns:60%_30%_10%] text-sm border border-neutral-400">
            <Link href={link.url} target="_blank" className="duration-300 flex items-center w-full h-full p-1 border-r border-neutral-400 hover:opacity-80">
                {link.url}
            </Link>

            <span className="p-1 border-r border-neutral-400 flex items-center w-full h-full">
                {link.data.lastmod}
            </span>

            <span className="p-1 flex items-center justify-center w-full h-full">
                {link.data.priority.toFixed(1)}
            </span>
        </div>
    );
};

export default UrlRow;
