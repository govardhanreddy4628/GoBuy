import "react-inner-image-zoom/lib/styles.min.css";
import "swiper/css";
import "swiper/css/navigation";

import InnerImageZoom from "react-inner-image-zoom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

import { FaRegHeart } from "react-icons/fa";
import { GoGitCompare } from "react-icons/go";
import { LiaShippingFastSolid } from "react-icons/lia";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

import { getCloudinaryImage } from "../utils/imgTransformation";
import { useCart } from "../context/cartContext";
import { useWishlist } from "../context/wishlistContext";
import { useAuth } from "../context/authContext";
import ProductInfo from "./productInfo";
import RatingStats from "./ratingStats";
import ReviewList from "./reviewList";
import ProductQA from "./productQA";
import { POST } from "../api/api_utility";

/* ================= TYPES ================= */

interface Stats {
    averageRating: number;
    totalReviews: number;
    breakdown: Array<{ _id: number; count: number }>;
}

interface Specification {
    key: string;
    value: string;
    unit?: string;
    group?: string;
}

interface Variant {
    color: string;
    size?: string;
    price: number;
    stock: number;
    sku: string;
    images: string[];
    specifications?: Specification[];
}

interface ProductImage {
    url: string;
    role: string;
}

interface IProduct {
    _id: string;
    name: string;
    listedPrice: number;
    finalPrice: number;
    quantityInStock: number;
    discountPercentage: number;
    rating: number;
    brand: string;
    shortDescription: string;
    category: string;
    images: string[];
    specifications: Specification[];
    variants: Variant[];
}

/* ================= COMPONENT ================= */

const ProductDetails2 = () => {
    const { id } = useParams<{ id: string }>();

    const [product, setProduct] = useState<IProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    // const [selectedColor, setSelectedColor] = useState("");
    // const [selectedSize, setSelectedSize] = useState<undefined | string>("");
    // const [currentVariant, setCurrentVariant] = useState<Variant | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);

    const { addToCart } = useCart();
    const { wishlist, toggleWishlist } = useWishlist();

    const { isAuthenticated } = useAuth();

    /* ================= FETCH ================= */

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL_LOCAL}/api/v1/product/getproductdetails/${id}`
                );

                if (res.data?.success && res.data?.data) {
                    setProduct(res.data.data);
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);


    useEffect(() => {
        fetch(`http://localhost:8080/api/v1/reviews?productId=${id}`)
            .then(res => res.json())
            .then(data => setStats(data.stats));
    }, [id]);


     useEffect(() => {
            const trackView = async () => {
                if (!id) return;
                try {
                    await POST(`api/v1/analytics/product-view/${id}`);
                } catch (error) {
                    console.error("View tracking failed:", error);
                }
            };
            trackView();
        }, [id]);


    useEffect(() => {
        if (!product?._id) return;

        // ✅ 1. LOCAL STORAGE (FAST + GUEST SUPPORT)
        const stored = localStorage.getItem("recentlyViewed");
        let items: string[] = stored ? JSON.parse(stored) : [];

        // remove duplicate
        items = items.filter((id) => id !== product._id);

        // add latest on top
        items.unshift(product._id);

        // limit to 10
        if (items.length > 10) items = items.slice(0, 10);

        localStorage.setItem("recentlyViewed", JSON.stringify(items));

        // ✅ 2. BACKEND SYNC (COOKIE BASED AUTH)
        // OPTIONAL: only if logged in
        if (isAuthenticated !== false) {
            fetch(
                `${import.meta.env.VITE_BACKEND_URL_LOCAL}/api/v1/product/add-recently-viewed/${product._id}`,
                {
                    method: "POST",
                    credentials: "include", // 🔥 REQUIRED for cookies
                }
            ).catch(() => {
                // silently ignore
            });
        }
    }, [product?._id]);

    const handleIncrease = () => {
        setQuantity(prev => prev + 1);
    };
    const handleDecrease = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    if (loading) return <div className="p-10">Loading...</div>;
    if (!product) return null;

    /* ================= IMAGES ================= */
    const images = product.images?.map((img) => img.url) || [];

    /* ================= RENDER ================= */
    return (
        <section className="max-w-9xl rounded-lg shadow-lg bg-gray-200 dark:bg-gray-800">
            <div className="flex w-[95%] mx-auto bg-gray-50 pl-5 dark:bg-gray-900">

                {/* ================= IMAGE COLUMN (UNCHANGED) ================= */}
                <div className="flex items-center gap-4 w-[45%]">
                    {/* Thumbs */}
                    <div className="col1 w-24 h-[460px] lg:h-[500px]">
                        <Swiper
                            direction="vertical"
                            navigation
                            spaceBetween={15}
                            slidesPerView="auto"
                            freeMode
                            onSwiper={setThumbsSwiper}
                            modules={[FreeMode, Navigation, Thumbs]}
                            className="verticalSwiper h-full"
                        >
                            {images.map((src, i) => (
                                <SwiperSlide
                                    key={i}
                                    className="!w-full !h-[80px] p-1 opacity-70 cursor-pointer group rounded-md overflow-hidden"
                                >
                                    <img
                                        src={getCloudinaryImage(src, {
                                            width: 100,
                                            height: 100,
                                        })}
                                        alt={`Slide ${i + 1}`}
                                        className="w-full h-full object-cover transition-all group-hover:scale-105 rounded-sm"
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Main Image */}
                    <div className="col2 w-[72%] h-[95%] ml-4 flex items-center justify-center">
                        <Swiper
                            spaceBetween={0}
                            slidesPerView={1}
                            navigation
                            thumbs={{ swiper: thumbsSwiper }}
                            modules={[FreeMode, Navigation, Thumbs]}
                            className="mySwiper2 overflow-x-hidden rounded-lg w-full h-full  flex-1"
                        >
                            {images.map((src) => (
                                <SwiperSlide key={src} className="!flex items-center justify-center"
                                >
                                    <InnerImageZoom
                                        src={src}
                                        zoomType="hover"
                                        zoomPreload
                                        className="object-cover w-full h-full align-middle"
                                        alt="Primary product image"
                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = 'https://i5.walmartimages.com/asr/d37e7bbd-6700-46a…ad.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF' }}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>

                {/* ================= PRODUCT INFO (UNCHANGED) ================= */}
                <div className="product-content w-full lg:w-[45%] p-4 lg:pr-10 lg:pl-0 text-black flex">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold mb-2">
                            {product.name}
                        </h1>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-gray-600">
                            <span>Brand: <strong className="text-black">{product.brand}</strong></span>
                            <div className="flex items-center text-yellow-500" aria-label="Rating: 5 out of 5">
                                <div className="text-yellow-400 text-[16px]">
                                    {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
                                </div>
                                <span className="text-sm text-gray-500 ml-2">({product.rating} / 5)</span>
                            </div>
                            <span className=" cursor-pointer text-gray-600">Review (10)</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 line-through text-lg">₹{product.listedPrice}</span>
                                <span className="text-red-600 text-lg font-bold">₹{product.finalPrice}</span>
                            </div>
                            <div>
                                <span>In Stock: <span className="text-green-600 font-bold"> {product.quantityInStock} Items</span></span>
                            </div>
                        </div>

                        <p className="mt-4 text-gray-700">
                            {product.shortDescription}
                        </p>

                        <p className="text-md text-gray-800 mt-5 mb-2 flex items-center gap-2">
                            <LiaShippingFastSolid className='text-lg' /> <span>Free Shipping (Est. Delivery: 2-3 Days)</span>
                        </p>

                        <div className="flex items-center gap-4 py-4">
                            <div className="w-20 relative">
                                <input type="number" className="w-full h-10 pl-3  border rounded focus:outline-none" value={quantity} min={1} onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val > 0) setQuantity(val);
                                }} />
                                <div className="absolute inset-y-0 right-0 flex flex-col justify-between">
                                    <button type="button" className="h-5 text-xs text-gray-600 hover:text-black px-2 hover:bg-gray-200 rounded-sm animate-pulse" onClick={handleIncrease}><IoChevronUp className='hover:scale-110 hover:font-bold' /></button>
                                    <button type="button" className="h-5 text-xs text-gray-600 hover:text-black px-2 hover:bg-gray-200 rounded-sm" onClick={handleDecrease}><IoChevronDown className='hover:scale-110 hover:font-bold' /></button>
                                </div>
                            </div>

                            <button className="flex items-center gap-2 bg-red-500 text-white hover:bg-black px-6 py-2 rounded transition-all" onClick={() => addToCart(product._id, quantity)}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7 17h12v-2H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03L20.88 4H5.21l-.94-2H1v2h2l3.6 7.59L5.27 14.6c-.48.89.17 1.9 1.15 1.9z" /></svg>
                                Add to Cart
                            </button>
                        </div>

                        {/* ✅ Wishlist */}
                        <div className="flex gap-4 mt-2">
                            <button
                                className={`flex items-center gap-2 ${wishlist.includes(product._id) ? "text-red-500" : "text-gray-600"}`}
                                onClick={() => toggleWishlist(product._id)}
                            >
                                <FaRegHeart /> Wishlist
                            </button>

                            <button className="flex items-center gap-2">
                                <GoGitCompare /> Compare
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <section className='w-[95%] mx-auto'>
                <ProductInfo />
                <div className='flex bg-white w-full flex-col lg:flex-row '>
                    {stats && (
                        <RatingStats
                            average={stats.averageRating}
                            totalReviews={stats.totalReviews}
                            breakdown={
                                stats.breakdown.reduce((acc: any, item: any) => {
                                    acc[item._id] = item.count;
                                    return acc;
                                }, {})
                            }
                            productId={id || ""}

                        />
                    )}
                    <div className='w-full'>
                        <ReviewList productId={id || ""} />
                    </div>
                </div>
                <div>
                    <ProductQA productId={id || ""} />
                </div>
            </section>
        </section>
    );
};

export default ProductDetails2;
