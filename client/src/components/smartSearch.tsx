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

export default function SearchBar() {
    const [trending, setTrending] = useState<TrendingItem[]>([]);
    const [query, setQuery] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false)

    const [trendIndex, setTrendIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null); const controllerRef = useRef<AbortController | null>(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => { setIsMobile(window.innerWidth < 768) };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // -------------------------
    // ✅ PERFECT TYPING ANIMATION (Flipkart-like)
    // -------------------------
    useEffect(() => {
        if (query) return;

        const activeTrending = trending.length > 0 ? trending : fallbackTrending;
        const word = activeTrending[trendIndex]?.value || "";

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                setPlaceholder(word.substring(0, charIndex + 1));
                setCharIndex((prev) => prev + 1);
                if (charIndex === word.length) setIsDeleting(true);
            } else {
                setPlaceholder(word.substring(0, charIndex - 1));
                setCharIndex((prev) => prev - 1);
                if (charIndex === 0) {
                    setIsDeleting(false);
                    setTrendIndex((prev) => (prev + 1) % activeTrending.length);
                }
            }
        }, isDeleting ? 120 : 160);

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, trendIndex, query, trending]);

    // -------------------------
    // Hybrid search (debounce + abort)
    // -------------------------
    const fetchResults = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults(null);
            return;
        }

        // if (controllerRef.current) {
        //     controllerRef.current.abort();
        // }
        //or
        controllerRef.current?.abort();
        controllerRef.current = new AbortController();

        try {
            const res = await GET(`/api/v1/searchbar/search?q=${searchQuery}`, {
                signal: controllerRef.current.signal
            });

            setResults(res.data.data);
            setShowDropdown(true);
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== "CanceledError") {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            if (query) fetchResults(query);
            else setResults(null);
        }, 200);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);


    // -------------------------
    // Highlight matched text
    // -------------------------
    // const highlight = (text: string) => {
    //     if (!query) return text;

    //     const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    //     return text.replace(
    //         new RegExp(`(${safeQuery})`, "gi"),
    //         "<span class='font-semibold'>$1</span>"
    //     );
    // };

    const highlight = (text: string) => {
        if (!query) return text;

        const parts = text.split(new RegExp(`(${query})`, "gi"));

        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={i} className="font-semibold">{part}</span>
                : part
        );
    };

    const suggestions = results
        ? [...(results.products || []), ...(results.categories || [])]
        : [];

    // -------------------------
    // Keyboard navigation
    // -------------------------

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (!suggestions.length && e.key !== "Enter") return;

        if (e.key === "ArrowDown") {
            setHighlightIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        }

        if (e.key === "ArrowUp") {
            setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }

        if (e.key === "Enter") {
            e.preventDefault();

            // If suggestion selected
            if (highlightIndex >= 0) {
                const selected = suggestions[highlightIndex];

                POST("/api/v1/searchbar/search/record", {
                    term: selected.name
                }).catch(() => { });;

                window.location.href = `/search?q=${selected.name}`;
            }

            // If manual search
            else if (query.trim()) {

                POST("/api/v1/searchbar/search/record", {
                    term: query.trim()
                }).catch(() => { });;

                window.location.href = `/search?q=${query}`;
            }
        }
    };

    // -------------------------
    // Dropdown visibility
    // -------------------------
    useEffect(() => {
        if (isFocused) setShowDropdown(true);
        else setTimeout(() => setShowDropdown(false), 150);
    }, [isFocused]);

    const handleTrendingClick = (item: TrendingItem) => {
        if (item.type === "category") {
            window.location.href = `/products?catId=${item.id}`;
        } else if (item.type === "product") {
            window.location.href = `/productdetails/${item.id}`;
        } else if (item.type === "brand") {
            window.location.href = `/search?q=${item.value}`;
        }
    };

    // -------------------------
    // Fetch trending searches
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


    return (
        <div className="relative w-full max-w-xl">
            {/* INPUT */}
            <input
                ref={inputRef}
                value={query}
                placeholder={`search for ${placeholder}`}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlightIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full border px-4 py-2 rounded-md focus:outline-none"
            />

            {/* -------------------------
          ✅ DESKTOP DROPDOWN
      ------------------------- */}
            {!isMobile && showDropdown && (
                <div className="absolute w-full bg-white shadow-lg mt-1 rounded-md z-50 max-h-96 overflow-y-auto">

                    {/* Trending */}
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

                    {/* Suggestions */}
                    {query &&
                        suggestions.map((item, index) => (
                            <div
                                key={item._id || index}
                                className={`px-4 py-2 cursor-pointer ${index === highlightIndex ? "bg-gray-200" : ""}`}
                                onMouseEnter={() => setHighlightIndex(index)}
                                onClick={() => {
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

            {/* -------------------------
          ✅ MOBILE FULLSCREEN (ONLY MOBILE)
      ------------------------- */}
            {isMobile && showDropdown && (
                <div className="fixed inset-0 bg-white z-50 p-4">
                    <button onClick={() => setShowDropdown(false)} className="cursor-pointer">Back</button>

                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full border px-4 py-2 mt-2 rounded"
                    />

                    {!query && (
                        <>
                            <h3 className="mt-4 text-gray-600">Trending</h3>
                            {trending.map((item, i) => (
                                <div
                                    key={i}
                                    className="py-2 cursor-pointer"
                                    onMouseDown={() => handleTrendingClick(item)}
                                >
                                    {item.label}
                                </div>
                            ))}
                        </>
                    )}

                    {query &&
                        suggestions.map((item, i) => (
                            <div
                                key={item._id || i}
                                className="py-2 border-b cursor-pointer"
                                onClick={() => {
                                    POST("/api/v1/searchbar/search/record", {
                                        term: item.name
                                    }).catch(() => { });

                                    window.location.href = `/search?q=${item.name}`;
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: highlight(item.name),
                                }}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}