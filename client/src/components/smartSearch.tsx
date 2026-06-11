import { useEffect, useRef, useState } from "react";
import { GET, POST } from "../api/api_utility";

type Product = {
    _id: string;
    name: string;
    brand: string;
    price: number;
    image: string | null;
    slug: string;
    type: "product";
};

type Category = {
    _id: string;
    name: string;
    slug: string;
    type: "category";
};

type SearchResponse = {
    products: Product[];
    categories: Category[];
    didYouMean?: string | null;
};

type TrendingItem = {
    label: string;
    value: string;
    type: "product" | "category" | "brand";
    id: string;
};

const fallbackTrending: TrendingItem[] = [
    { label: "iPhone 15", type: "product", value: "iphone 15", id: "1" },
    { label: "Nike Shoes", type: "brand", value: "nike", id: "2" },
    { label: "Laptop", type: "category", value: "laptop", id: "3" },
    { label: "Headphones", type: "category", value: "headphones", id: "4" }
];

export default function SearchBar({
    autoFocus = false,
    closeSearch
}: {
    autoFocus?: boolean;
    closeSearch?: () => void;
}) {
    const [trending, setTrending] = useState<TrendingItem[]>([]);
    const [query, setQuery] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // -------------------------
    // Resize
    // -------------------------
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // -------------------------
    // 🔥 CRITICAL FIX (NO FLICKER)
    // -------------------------
    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (!wrapperRef.current) return;

            // if click inside → ignore
            if (wrapperRef.current.contains(e.target as Node)) return;

            setShowDropdown(false);
            setIsFocused(false);
        };

        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
    }, []);

    // -------------------------
    // Typing animation
    // -------------------------
    const [trendIndex, setTrendIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (query) return;

        const activeTrending = trending.length ? trending : fallbackTrending;
        const word = activeTrending[trendIndex]?.value || "";

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                setPlaceholder(word.substring(0, charIndex + 1));
                setCharIndex((p) => p + 1);
                if (charIndex === word.length) setIsDeleting(true);
            } else {
                setPlaceholder(word.substring(0, charIndex - 1));
                setCharIndex((p) => p - 1);
                if (charIndex === 0) {
                    setIsDeleting(false);
                    setTrendIndex((p) => (p + 1) % activeTrending.length);
                }
            }
        }, isDeleting ? 100 : 140);

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, trendIndex, query, trending]);

    // -------------------------
    // Search API
    // -------------------------
    const fetchResults = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults(null);
            return;
        }

        controllerRef.current?.abort();
        controllerRef.current = new AbortController();

        try {
            const res = await GET(`/api/v1/searchbar/search?q=${searchQuery}`, {
                signal: controllerRef.current.signal
            });

            setResults(res.data.data);
            setShowDropdown(true);
        } catch (err: any) {
            if (err.name !== "CanceledError") console.error(err);
        }
    };

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            if (query) fetchResults(query);
            else setResults(null);
        }, 200);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    // -------------------------
    // Highlight
    // -------------------------
    const highlight = (text: string) => {
        if (!query) return text;

        return text.split(new RegExp(`(${query})`, "gi")).map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={i} className="font-semibold">{part}</span>
                : part
        );
    };

    const suggestions = results
        ? [...(results.products || []), ...(results.categories || [])]
        : [];

    // -------------------------
    // Keyboard
    // -------------------------
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!suggestions.length && e.key !== "Enter") return;

        if (e.key === "ArrowDown") {
            setHighlightIndex((p) => Math.min(p + 1, suggestions.length - 1));
        }

        if (e.key === "ArrowUp") {
            setHighlightIndex((p) => Math.max(p - 1, 0));
        }

        if (e.key === "Enter") {
            e.preventDefault();

            const selected = suggestions[highlightIndex];

            const term = selected ? selected.name : query;

            if (!term) return;

            POST("/api/v1/searchbar/search/record", { term }).catch(() => { });

            window.location.href = `/search?q=${term}`;
        }
    };

    // -------------------------
    // Trending click
    // -------------------------
    const handleTrendingClick = (item: TrendingItem) => {
        if (item.type === "category") {
            window.location.href = `/products?catId=${item.id}`;
        } else if (item.type === "product") {
            window.location.href = `/productdetails/${item.id}`;
        } else {
            window.location.href = `/search?q=${item.value}`;
        }
    };

    // -------------------------
    // Fetch trending
    // -------------------------
    useEffect(() => {
        GET("/api/v1/searchbar/search/trending")
            .then((res) => {
                if (res.data?.data?.length) {
                    setTrending(res.data.data);
                }
            })
            .catch(console.error);
    }, []);

    // -------------------------
    // RENDER
    // -------------------------
    return (
        <div ref={wrapperRef} className="relative w-full">

            <input
                ref={inputRef}
                autoFocus={autoFocus}
                value={query}
                placeholder={`search for ${placeholder}`}
                onFocus={() => {
                    setIsFocused(true);
                    setShowDropdown(true);
                }}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlightIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full border px-4 py-2 rounded-md text-sm sm:text-base bg-white text-black border-gray-300 
                dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:outline-none"
            />

            {/* DESKTOP */}
            {!isMobile && showDropdown && (
                <div className="absolute w-full bg-white shadow-lg mt-1 rounded-md z-50 max-h-96 overflow-y-auto dark:bg-gray-900">

                    {!query && (
                        <>
                            <div className="px-4 py-2 text-gray-500">Trending</div>
                            {(trending.length ? trending : fallbackTrending).map((item, i) => (
                                <div
                                    key={i}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onMouseDown={() => handleTrendingClick(item)}
                                >
                                    {item.label}
                                </div>
                            ))}
                        </>
                    )}

                    {query && suggestions.map((item, i) => (
                        <div
                            key={item._id || i}
                            className={`px-4 py-2 cursor-pointer ${i === highlightIndex ? "bg-gray-200" : ""}`}
                            onMouseEnter={() => setHighlightIndex(i)}
                            onMouseDown={() => {
                                POST("/api/v1/searchbar/search/record", {
                                    term: item.name
                                }).catch(() => { });

                                window.location.href = `/search?q=${item.name}`;
                            }}
                        >
                            {highlight(item.name)}
                        </div>
                    ))}
                </div>
            )}

            {/* MOBILE */}
            {isMobile && showDropdown && (
                <div className="fixed inset-0 z-[999] bg-white dark:bg-gray-950 flex flex-col">

                    {/* 🔝 TOP BAR */}
                    <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
                        <button
                            onClick={() => {
                                setShowDropdown(false);
                                closeSearch?.();
                            }}
                            className="text-lg px-2 py-1 text-bold"
                        >
                            ←
                        </button>

                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search products..."
                            className="flex-1 border px-4 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800 dark:text-white outline-none"
                        />
                    </div>

                    {/* 📜 CONTENT */}
                    <div className="flex-1 overflow-y-auto">

                        {/* TRENDING */}
                        {!query && (
                            <>
                                <h3 className="px-4 pt-4 pb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    Trending Searches
                                </h3>

                                {(trending.length ? trending : fallbackTrending).map((item, i) => (
                                    <div
                                        key={i}
                                        className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 active:bg-gray-100 dark:active:bg-gray-800 cursor-pointer"
                                        onMouseDown={() => handleTrendingClick(item)}
                                    >
                                        {item.label}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* RESULTS */}
                        {query && suggestions.map((item, i) => (
                            <div
                                key={item._id || i}
                                className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer 
                    ${i === highlightIndex ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                                onMouseEnter={() => setHighlightIndex(i)}
                                onMouseDown={() => {
                                    window.location.href = `/search?q=${item.name}`;
                                }}
                            >
                                {highlight(item.name)}
                            </div>
                        ))}

                    </div>
                </div>
            )}
        </div>
    );
}