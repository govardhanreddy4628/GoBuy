import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import 'swiper/css/pagination';
import './hero.css'
import BlogSection from './BlogSection';
import CategorySwiper from './categorySwiper';
import CategoryTabs from './categoryTabs';
import HomeSlider from './homeSlider';
import SecondarySlider from './secondarySlider';
import { useState } from 'react';
//import { GoGitCompare } from "react-icons/go";
import ProductsSlider from './productsSlider';
import ProductQuickViewModal from './ProductQuickViewModal ';

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

const Hero = () => {
    const [openProduct, setOpenProduct] = useState<Product | null>(null);

    const handleClickOpen = (product: Product) => {
        setOpenProduct(product);
    };

    return (
        <>
            <HomeSlider />
            <CategorySwiper />
            <CategoryTabs handleClickOpen={handleClickOpen} />

            <section className='bg-white w-full pb-4 dark:bg-gray-900'>
                <SecondarySlider />
                <ProductsSlider handleClickOpen={handleClickOpen} headerName="Top Rated Products" route="top-rated" />

                {/* SHIPPING BANNER */}
                <section className="container p-5 mx-auto px-6 md:px-24">
                    <div className="border-[2px] border-red-400 dark:border-gray-600 p-6 flex flex-col md:flex-row items-center justify-between gap-4 
                  bg-gradient-to-r from-gray-300 via-gray-100 to-white 
                  dark:from-gray-900 dark:via-gray-800 dark:to-gray-700   relative rounded-xl md:p-8 
                  shadow-lg shadow-gray-300/40 dark:shadow-black/30 backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-3">
                            <LocalShippingOutlinedIcon className="!font-thin !text-[36px] md:!text-[42px] text-gray-600 dark:text-white drop-shadow-sm" />
                            <h1 className="text-[22px] md:text-[26px] font-semibold text-gray-600 dark:text-white tracking-wide">
                                FREE SHIPPING
                            </h1>
                        </div>
                        <p className="text-[16px] md:text-[17px] text-[rgba(0,0,0,0.8)] dark:text-white text-gray-700 dark:text-gray-200 text-center md:text-left max-w-[320px]">
                            Free Delivery Now On Your First Order and over ₹400
                        </p>
                        <h1 className="font-extrabold text-[28px] md:text-[32px] text-gray-700 dark:text-white tracking-tight">
                            - Only ₹400*
                        </h1>
                        {/* Optional subtle highlight overlay */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 pointer-events-none"></div>
                    </div>
                </section>


                {/* <ProductsSlider handleClickOpen={handleClickOpen} headerName="Recently Viewed Products" route="recently-viewed-products" /> */}

                <section className="w-[95%] mx-auto mt-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {[
                            "https://serviceapi.spicezgold.com/download/1741669012402_banner1.webp",
                            "https://serviceapi.spicezgold.com/download/1741669037986_banner2.webp",
                            "https://serviceapi.spicezgold.com/download/1741669057847_banner5.webp",
                            "https://serviceapi.spicezgold.com/download/1742453755529_1741669087880_banner6.webp",
                        ].map((src, idx) => (
                            <div key={idx} className="overflow-hidden rounded-lg">
                                <img
                                    src={src}
                                    className="transition-transform duration-300 ease-in-out hover:scale-105 hover:rotate-1 w-full h-full object-cover"
                                    alt={`Banner ${idx + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </section>
                <ProductsSlider handleClickOpen={handleClickOpen} headerName="Products With Best Discount" route="products-with-best-discounts" />

                <section className="w-[95%] mx-auto mt-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {[
                            "https://rukminim1.flixcart.com/fk-p-flap/1040/560/image/2e5c9cfcf2dc8e71.jpg?q=60",
                            "https://rukminim1.flixcart.com/fk-p-flap/1040/560/image/c5d0453a8ad30643.jpg?q=60",
                            "https://rukminim1.flixcart.com/fk-p-flap/1040/560/image/4b01f2e6361d46c4.png?q=60",
                            "https://rukminim1.flixcart.com/fk-p-flap/1040/560/image/c03b479f4ce13271.jpg?q=60",
                            "https://rukminim1.flixcart.com/fk-p-flap/1040/560/image/58d6d6db07978e56.jpg?q=60",
                            "https://rukminim2.flixcart.com/fk-p-flap/1040/560/image/c0381ba1a743d06f.jpg?q=60",
                        ].map((src, idx) => (
                            <div key={idx} className="overflow-hidden rounded-lg">
                                <img
                                    src={src}
                                    className="transition-transform duration-300 ease-in-out hover:scale-105 hover:rotate-1 w-full h-full object-cover"
                                    alt={`Banner ${idx + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </section>


                {/* <ProductsSlider handleClickOpen={handleClickOpen} headerName="New Arrivals" route=""/>
                <ProductsSlider handleClickOpen={handleClickOpen} headerName="Best Selling Products" route=""/>
                <ProductsSlider handleClickOpen={handleClickOpen} headerName="Featured Products" route=""/>
                <ProductsSlider handleClickOpen={handleClickOpen} headerName="Limited Edition" route=""/>
                <ProductsSlider handleClickOpen={handleClickOpen} headerName="Recently Viewed Products" route=""/> */}


                <ProductsSlider handleClickOpen={handleClickOpen} headerName="Top Rated Products" route="top-rated" />
                <ProductsSlider handleClickOpen={handleClickOpen} headerName="Featured Products" route="featured" />
                <ProductsSlider handleClickOpen={handleClickOpen} headerName="Recently Viewed Products" route="recently-viewed" />
                <ProductsSlider handleClickOpen={handleClickOpen} headerName="Top Rated Products" route="top-rated" />
                
                <BlogSection />
            </section >

            {/* DIALOG */}
            <ProductQuickViewModal
                open={!!openProduct}
                product={openProduct}
                onClose={() => setOpenProduct(null)}
            />

        </>
    )
}

export default Hero;
