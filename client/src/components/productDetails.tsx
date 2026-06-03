import 'react-inner-image-zoom/lib/styles.min.css';
import 'swiper/css';
import 'swiper/css/navigation';

import InnerImageZoom from 'react-inner-image-zoom'
import { useState, useEffect } from 'react';

import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';

import { FaRegHeart } from "react-icons/fa";
import { GoGitCompare } from "react-icons/go";
import { LiaShippingFastSolid } from "react-icons/lia";
import { IoChevronDown } from "react-icons/io5";
import { IoChevronUp } from "react-icons/io5";
import RatingStats from './ratingStats';
import FeedbackRating from './rating2';
import ProductQA from './productQA';
import ReviewList from './reviewList';
import ProductInfo from './productInfo';
import { useParams } from 'react-router-dom';
import { POST } from '../api/api_utility';

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

interface IProduct {
    _id: string;
    name: string;
    listedPrice: number;
    finalPrice: number;
    rating: number;
    brand: string;
    shortDescription: string;
    category: string;
    images: string[];
    specifications: Specification[];
    variants: Variant[];
}

const imageUrls = [
    'https://swiperjs.com/demos/images/nature-1.jpg',
    'https://swiperjs.com/demos/images/nature-2.jpg',
    'https://swiperjs.com/demos/images/nature-3.jpg',
    'https://i5.walmartimages.com/asr/6e5b81bf-8958-4e5c-b09e-d3f47dd9291a.e0ed1ecc7043ad3bb6159808524fa853.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF',
    'https://i5.walmartimages.com/asr/159b2507-a090-4ccc-8b98-4725fad3dc93.48369d55ea9a2d5f1c6b8b076f91439d.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF',
    'https://i5.walmartimages.com/asr/d37e7bbd-6700-46ac-9cd2-16bc8ff44dba.12b21c89aed89236c82f2e95fb6355ad.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF',
    'https://i5.walmartimages.com/seo/VIZIO-50-Class-4K-UHD-LED-HDR-Smart-TV-New-V4K50M-08_5f0d49fd-372f-41f3-96d9-f0566f682c44.6e5a7abe265b6a0764ab4ceade89d476.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF'
];
const imageUrls2 = [
    'https://swiperjs.com/demos/images/nature-1.jpg',
    'https://swiperjs.com/demos/images/nature-2.jpg',
    'https://swiperjs.com/demos/images/nature-3.jpg',
    'https://i5.walmartimages.com/asr/6e5b81bf-8958-4e5c-b09e-d3f47dd9291a.e0ed1ecc7043ad3bb6159808524fa853.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF',
    'https://i5.walmartimages.com/asr/159b2507-a090-4ccc-8b98-4725fad3dc93.48369d55ea9a2d5f1c6b8b076f91439d.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF',
    'https://i5.walmartimages.com/asr/d37e7bbd-6700-46ac-9cd2-16bc8ff44dba.12b21c89aed89236c82f2e95fb6355ad.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF',
    'https://i5.walmartimages.com/seo/VIZIO-50-Class-4K-UHD-LED-HDR-Smart-TV-New-V4K50M-08_5f0d49fd-372f-41f3-96d9-f0566f682c44.6e5a7abe265b6a0764ab4ceade89d476.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF'
];


const productData: IProduct = {
    _id: "1",
    name: " Men Comfort Cuban Collar Solid Polycotton Casual Shirt",
    listedPrice: 199.99,
    finalPrice: 149.99,
    rating: 4.5,
    brand: "Campus Sutra",
    shortDescription: "Premium quality cotton T-shirt designed for everyday comfort. Soft, breathable fabric with a regular fit, available in multiple colors and sizes to match your style.",
    category: "Clothing",
    images: [
        "https://example.com/images/tshirt-main.jpg"
    ],
    specifications: [
        { key: "Material", value: "Cotton" },
        { key: "Brand", value: "FashionCo" },
        { key: "Fit", value: "Regular" }
    ],
    variants: [
        {
            color: "Red",
            size: "M",
            price: 499,
            stock: 10,
            sku: "TSHIRT-RED-M",
            images: ["https://example.com/images/tshirt-red-m.jpg"],
            specifications: [
                { key: "Weight", value: "200", unit: "g" }
            ]
        },
        {
            color: "Red",
            size: "L",
            price: 549,
            stock: 5,
            sku: "TSHIRT-RED-L",
            images: ["https://example.com/images/tshirt-red-l.jpg"],
            specifications: [
                { key: "Weight", value: "250", unit: "g" }
            ]
        },
        {
            color: "Blue",
            size: "M",
            price: 499,
            stock: 8,
            sku: "TSHIRT-BLUE-M",
            images: ["https://example.com/images/tshirt-blue-m.jpg"],
            specifications: [
                { key: "Weight", value: "200", unit: "g" }
            ]
        }
    ]
};


const ProductDetails = () => {
    const [product, setProduct] = useState<IProduct | null>(null);
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState<undefined | string>("");
    const [currentVariant, setCurrentVariant] = useState<Variant | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);

    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        setProduct(productData)
    }, [])

    useEffect(() => {
        fetch(`http://localhost:8080/api/v1/reviews?productId=${id}`)
            .then(res => res.json())
            .then(data => setStats(data.stats));
    }, [id]);

    useEffect(() => {

        if (product) {
            const variant = product.variants.find(
                (v) =>
                    v.color === selectedColor && (selectedSize ? v.size === selectedSize : true)
            );
            setCurrentVariant(variant || null);
        }
    }, [selectedColor, selectedSize, product]);


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

    if (!product) return <div>Loading...</div>;

    const colors = Array.from(new Set(product.variants.map((v) => v.color))) as string[];
    const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));

    const specsToShow = currentVariant?.specifications?.length ? currentVariant.specifications : product.specifications || [];

    const handleIncrease = () => { };
    const handleDecrease = () => { };


    return (
        <section className="max-w-9xl rounded-lg shadow-lg bg-gray-200 dark:bg-gray-800">
            <div className="flex w-[95%] mx-auto bg-gray-50 dark:bg-gray-900 pl-5">

                <div className='flex items-center gap-4 w-[45%]'>
                    {/* vertical swiper */}
                    <div className='col1 w-24 lg:h-[500px] h-[460px]'>
                        <Swiper
                            direction='vertical'
                            navigation={true}
                            spaceBetween={15}
                            slidesPerView="auto"
                            freeMode={true}
                            onSwiper={setThumbsSwiper}
                            modules={[FreeMode, Navigation, Thumbs]}
                            className="verticalSwiper h-full"
                        >
                            {imageUrls.map((src, index) => (
                                <SwiperSlide
                                    key={index}
                                    className="rounded-md overflow-hidden !w-full !h-[80px] cursor-pointer group opacity-70 p-1"
                                >
                                    <img
                                        src={src}
                                        alt={`Slide ${index + 1}`}
                                        className="w-full h-full object-cover transition-all group-hover:scale-105 rounded-sm"
                                    />
                                </SwiperSlide>
                            ))}

                        </Swiper>
                    </div>

                    {/*  main swiper */}
                    <div className='col12 w-[72%] h-[95%] flex items-center justify-center ml-4'>
                        <Swiper
                            spaceBetween={0}
                            slidesPerView={1}
                            navigation={true}
                            thumbs={{ swiper: thumbsSwiper }}
                            modules={[FreeMode, Thumbs, Navigation]}
                            className="mySwiper2 overflow-x-hidden rounded-lg w-full h-full  flex-1"
                        >
                            {imageUrls2.map((src) => (
                                <>

                                    <SwiperSlide key={src} className="!flex items-center justify-center ">
                                        <InnerImageZoom
                                            src={src}
                                            zoomType="hover"
                                            zoomPreload={true}
                                            className="object-cover w-full h-full align-middle"
                                            alt="Primary product image"
                                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = 'https://i5.walmartimages.com/asr/d37e7bbd-6700-46a…ad.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF' }}
                                        />

                                    </SwiperSlide>

                                </>
                            ))}
                        </Swiper>
                    </div>
                </div>

                {/* Product Info */}
                <div className="product-content w-full lg:w-[45%] px-4 lg:pr-10 lg:pl-0 text-black flex items-center">
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
                                <span>In Stock: <span className="text-green-600 font-bold">8518 Items</span></span>
                            </div>
                        </div>
                        <p className="mt-4 text-gray-700">
                            {product.shortDescription}
                        </p>
                        <div className="my-4 flex items-center mb-2 gap-4">
                            <h3 className="font-semibold">Select Color:</h3>
                            <div className="flex gap-2">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-5 h-5 rounded-md border-2 transition 
          ${selectedColor === color ? 'border-gray-300 scale-110' : 'border-white'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        {(sizes.length > 0 && <div className="flex items-center gap-4 mt-5">
                            <span className="text-base font-medium">Size:</span>
                            <div className="flex gap-2">
                                {
                                    sizes.map((size) => (
                                        <button key={size} onClick={() => setSelectedSize(size)} className={`px-3 py-1 border rounded hover:bg-gray-100 ${selectedSize === size ? "!bg-red-500 text-white" : ""}`} >{size}</button>
                                    ))}
                            </div>
                        </div>)}

                        {/* {currentVariant && (
                            <div className="my-4">
                                <h3>Price: ₹{currentVariant.price}</h3>
                                <p>Stock: {currentVariant.stock}</p>
                                <img src={currentVariant.image} alt="" className="w-48 h-48 object-cover" />
                            </div>
                        )} */}

                        <div className="my-4">
                            <h3>Specifications</h3>
                            <table className="border-collapse border border-gray-300">
                                <tbody>
                                    {specsToShow.map((spec, idx) => (
                                        <tr key={idx} className="border-b border-gray-200">
                                            <td className="px-4 py-2 font-semibold">{spec.key}</td>
                                            <td className="px-4 py-2">{spec.value} {spec.unit || ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                        <p className="text-md text-gray-800 mt-5 mb-2 flex items-center gap-2">
                            <LiaShippingFastSolid className='text-lg' /> <span>Free Shipping (Est. Delivery: 2-3 Days)</span>
                        </p>
                        <div className="flex items-center gap-4 py-4">
                            <div className="w-20 relative">
                                <input type="number" className="w-full h-10 pl-3  border rounded focus:outline-none" defaultValue={1} min={1} />
                                <div className="absolute inset-y-0 right-0 flex flex-col justify-between">
                                    <button type="button" className="h-5 text-xs text-gray-600 hover:text-black px-2 hover:bg-gray-200 rounded-sm animate-pulse" onClick={handleIncrease}><IoChevronUp className='hover:scale-110 hover:font-bold' /></button>
                                    <button type="button" className="h-5 text-xs text-gray-600 hover:text-black px-2 hover:bg-gray-200 rounded-sm" onClick={handleDecrease}><IoChevronDown className='hover:scale-110 hover:font-bold' /></button>
                                </div>
                            </div>

                            <button className="flex items-center gap-2 bg-red-500 text-white hover:bg-black px-6 py-2 rounded transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7 17h12v-2H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03L20.88 4H5.21l-.94-2H1v2h2l3.6 7.59L5.27 14.6c-.48.89.17 1.9 1.15 1.9z" /></svg>
                                Add to Cart
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 mt-4 text-md font-medium">
                            <button className="flex items-center gap-2 text-gray-700 hover:text-red-400 cursor-pointer">
                                <FaRegHeart /> Add to Wishlist
                            </button>
                            <button className="flex items-center gap-2 text-gray-700 hover:text-red-400 cursor-pointer">
                                <GoGitCompare /> Add to Compare
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
                    <ProductQA />
                </div>
            </section>
        </section>
    )
}

export default ProductDetails;



