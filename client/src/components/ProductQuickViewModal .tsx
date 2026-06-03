import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";
import "swiper/css";
import "swiper/css/navigation";

import { FaRegHeart } from "react-icons/fa";
import { LiaShippingFastSolid } from "react-icons/lia";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

import { getCloudinaryImage } from "../utils/imgTransformation";
import { toast } from "react-hot-toast";
import { useCart } from "../context/cartContext";

interface Product {
    _id: string;
    name: string;
    shortDescription: string;
    description?: string;
    brand: string;
    finalPrice: number;
    listedPrice: number;
    discountPercentage: number;
    rating: number;
    images: { url: string }[];
    stock?: number;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

type Props = {
    open: boolean;
    onClose: () => void;
    product: Product | null;
};

const ProductQuickViewModal: React.FC<Props> = ({ open, onClose, product }) => {
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartSuccess, setCartSuccess] = useState(false);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [addedQty, setAddedQty] = useState<number | null>(null);

    const { addToCart } = useCart();

    useEffect(() => {
        if (open) {
            setQuantity(1);
            setCartSuccess(false);
            setAddedQty(null);
        } else {
            setThumbsSwiper(null);
        }
    }, [open]);

    useEffect(() => {
        if (addedQty !== null) {
            setAddedQty(quantity);
        }
    }, [quantity]);

    if (!product) return null;

    const images = Array.isArray(product.images) ? product.images : [];

    const handleIncrease = () => setQuantity((p) => p + 1);
    const handleDecrease = () => setQuantity((p) => (p > 1 ? p - 1 : 1));

    const handleSizeButtonChange = (idx) => { }

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            setAddingToCart(true);
            await addToCart(product, quantity);
            setAddedQty(quantity);
            setCartSuccess(true);
            toast.success("Added to cart");
        } catch {
            toast.error("Failed to add to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <>
            {/* DIALOG */}
            <BootstrapDialog
                open={open}
                onClose={onClose}
                aria-labelledby="customized-dialog-title"
                disableScrollLock
                PaperProps={{
                    sx: {
                        width: 1250,
                        maxWidth: '100%', // optional: keep it responsive
                    },
                }}
            >

                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    {product && (
                        <section className="max-w-9xl  bg-white rounded-lg py-6">               {/*changed*/}
                            <div className="grid grid-cols-1 md:grid-cols-2 mx-auto">
                                <div className='flex items-center gap-2 pl-2'>
                                    <div className='col1.1 w-24 h-[446px]'>                   {/*changed*/}
                                        <Swiper
                                            onSwiper={setThumbsSwiper}
                                            direction='vertical'
                                            navigation={images.length > 1}
                                            spaceBetween={15}
                                            slidesPerView="auto"
                                            freeMode={true}
                                            modules={[FreeMode, Navigation, Thumbs]}
                                            className="verticalSwiper h-full select-none"
                                        >
                                            {images.map((img, index) => (
                                                <SwiperSlide
                                                    key={index}
                                                    className="rounded-md overflow-hidden w-full !h-[60px] cursor-pointer group"    //changed width
                                                >
                                                    <img
                                                        src={getCloudinaryImage(img.url, {
                                                            width: 100,
                                                            height: 100,
                                                        })}
                                                        alt={`Slide ${index + 1}`}
                                                        className="w-full h-full object-contain transition-all group-hover:scale-105 "
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>


                                    <div className='col12 w-[68%] h-[93%] flex items-center justify-center ml-4'>                   {/*changed*/}
                                        <Swiper
                                            spaceBetween={0}
                                            slidesPerView={1}
                                            navigation={images.length > 1}
                                            thumbs={{
                                                swiper: thumbsSwiper && !thumbsSwiper.destroyed
                                                    ? thumbsSwiper
                                                    : null
                                            }}
                                            modules={[FreeMode, Thumbs, Navigation]}
                                            className="mySwiper2 overflow-x-hidden rounded-lg w-full h-full select-none"
                                        >
                                            {images.map((img) => (
                                                <SwiperSlide key={img.url} className="!flex items-center justify-center ">
                                                    <InnerImageZoom
                                                        src={img.url}
                                                        zoomType="hover"
                                                        zoomPreload={true}
                                                        className="object-contain w-full h-full align-middle"
                                                        alt="Primary product image"
                                                        onError={(e) => { e.currentTarget.src = 'https://i5.walmartimages.com/asr/d37e7bbd-6700-46a…ad.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF' }}
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="product-content w-full lg:w-[90%] px-4 lg:pr-10 lg:pl-4 text-black flex items-center">
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-semibold mb-2">
                                            {product?.name}
                                        </h1>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-gray-600">
                                            <span>Brand: <strong className="text-black">{product?.brand}</strong></span>
                                            <div className="flex items-center text-yellow-500" aria-label="Rating: 5 out of 5">
                                                <div className="text-yellow-400 text-[16px]">
                                                    {'★'.repeat(Math.floor(product?.rating || 0))}{'☆'.repeat(5 - Math.floor(product?.rating || 0))}
                                                </div>
                                                <span className="text-sm text-gray-500 ml-2">({product?.rating} / 5)</span>
                                            </div>
                                            <span className=" cursor-pointer text-gray-600">Review (10)</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 line-through text-lg">₹{product?.listedPrice}</span>
                                                <span className="text-red-600 text-lg font-bold">₹{product?.finalPrice}</span>
                                            </div>
                                            <div>
                                                <span>In Stock: <span className="text-green-600 font-bold">{product?.stock || 0} Items</span></span>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-gray-700">
                                            {product?.shortDescription || "Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the industry's standard since the 1500s, when an unknown printer scrambled type to make a specimen book."}
                                        </p>
                                        <div className="flex items-center gap-4 mt-5">
                                            <span className="text-base font-medium">Size:</span>
                                            <div className="flex gap-2">{
                                                ["S", "M", "L"].map((button, idx) => (
                                                    <button key={button} className="px-3 py-1 border rounded hover:bg-gray-100" onClick={() => handleSizeButtonChange(idx)}>{button}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-md text-gray-800 mt-5 mb-2 flex items-center gap-2">
                                            <LiaShippingFastSolid className='text-lg' /> <span>Free Shipping (Est. Delivery: 2-3 Days)</span>
                                        </p>
                                        <div className="flex items-center gap-4 py-4">
                                            <div className="w-20 relative">
                                                <input type="number" className="w-full h-10 pl-3  border rounded focus:outline-none" value={quantity}
                                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                                    min={1} />
                                                <div className="absolute inset-y-0 right-0 flex flex-col justify-between">
                                                    <button type="button" className="h-5 text-xs text-gray-600 hover:text-black px-2 hover:bg-gray-200 rounded-sm animate-pulse" onClick={handleIncrease}><IoChevronUp className='hover:scale-110 hover:font-bold' /></button>
                                                    <button type="button" className="h-5 text-xs text-gray-600 hover:text-black px-2 hover:bg-gray-200 rounded-sm" onClick={handleDecrease}><IoChevronDown className='hover:scale-110 hover:font-bold' /></button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleAddToCart}
                                                disabled={addingToCart}
                                                className="flex items-center gap-2 bg-red-500 hover:bg-black text-white px-6 py-2 rounded transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {addingToCart ? (
                                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                                ) : addedQty !== null ? (
                                                    <>Go To Cart ({addedQty})</>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2..." />
                                                        </svg>
                                                        Add to Cart
                                                    </>
                                                )}
                                            </button>

                                            {cartSuccess && (
                                                <p className="text-green-600 text-sm mt-2 animate-fadeIn">
                                                    ✅ Added to cart successfully
                                                </p>
                                            )}

                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 mt-4 text-md font-medium">
                                            <button className="flex items-center gap-2 text-gray-700 hover:text-red-400 cursor-pointer">
                                                <FaRegHeart /> Add to Wishlist
                                            </button>
                                            {/* <button className="flex items-center gap-2 text-gray-700 hover:text-red-400 cursor-pointer">
                                                <GoGitCompare /> Add to Compare
                                            </button> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </DialogContent>
            </BootstrapDialog>
        </>
    )
}

export default ProductQuickViewModal;
