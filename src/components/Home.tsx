"use client";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";

export default function Home() {

    const [url, setUrl] = useState<string>("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    return (
        <main className="overflow-hidden font-[family-name:var(--font-geist-sans)] text-neutral-300 py-20">

            <p className="mx-auto w-[600px] max-w-[95vw] text-lg my-1">
                {"Page Url"}
            </p>

            <form className="w-[600px] max-w-[95vw] mx-auto flex items-center justify-center" onSubmit={handleSubmit}>

                <label htmlFor="url" className="flex-grow">
                    <input
                        type="text"
                        name="url"
                        id="url"
                        className="w-full outline-none border border-neutral-300 rounded-l-sm px-4 py-1 bg-transparent focus:border-blue-600"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </label>

                <button type="submit" className="rounded-r-sm bg-blue-600 px-4 py-[5px] flex items-center justify-center border border-blue-600 hover:opacity-70 duration-300">
                    <FaArrowRight size={24} />
                </button>
            </form>
        </main>
    );
};
