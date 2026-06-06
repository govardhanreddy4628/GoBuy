import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useCart } from "../context/cartContext";
import ProductCard from "./productCard";
import { useAuth } from "../context/authContext";
import { Box } from "@mui/material";
import { Product } from "../types/product";

// ✅ Skeleton Card
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-400 shadow-md rounded-md flex flex-col items-center relative overflow-hidden animate-pulse">
    <div className="bg-gray-300 dark:bg-gray-700 w-full h-[200px]" />
    <div className="w-full p-3 flex flex-col gap-2">
      <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-3 w-5/6 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mt-3"></div>
      <div className="h-8 w-full bg-gray-300 dark:bg-gray-700 rounded mt-4"></div>
    </div>
  </div>
);

type Props = {
  handleClickOpen: (product: Product) => void;
  handleOpenAiChat: (product: Product) => void;
  headerName?: string;
  route?: string;
  categorySlug?: string; // ✅ NEW
};

const ProductsSlider = ({
  handleClickOpen,
  handleOpenAiChat,
  headerName,
  route,
  categorySlug,
}: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const { cart, addToCart, updateQuantity, loadingCartItems, getCartKey } = useCart();

  // =========================
  // ✅ FETCH PRODUCTS (UNIFIED)
  // =========================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // =========================
        // ✅ CATEGORY BASED
        // =========================
        if (categorySlug) {
          const res = await fetch(
            `http://localhost:8080/api/v1/product/category/${categorySlug}`
          );

          const data = await res.json();
          setProducts(data.success ? data.data : []);
          return;
        }

        // =========================
        // ✅ RECENTLY VIEWED
        // =========================
        if (route === "recently-viewed") {
          if (isAuthenticated) {
            const stored = localStorage.getItem("recentlyViewed");
            const localIds: string[] = stored ? JSON.parse(stored) : [];

            if (localIds.length > 0) {
              await fetch(
                `http://localhost:8080/api/v1/product/merge-recently-viewed`,
                {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ids: localIds }),
                }
              );
              localStorage.removeItem("recentlyViewed");
            }

            const res = await fetch(
              `http://localhost:8080/api/v1/product/recently-viewed`,
              { credentials: "include" }
            );

            const data = await res.json();
            setProducts(data.success ? data.data : []);
          } else {
            const stored = localStorage.getItem("recentlyViewed");
            const ids: string[] = stored ? JSON.parse(stored) : [];

            if (ids.length === 0) {
              setProducts([]);
              return;
            }

            const res = await fetch(
              `http://localhost:8080/api/v1/product/by-ids`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
              }
            );

            const data = await res.json();

            if (data.success) {
              const ordered = ids
                .map((id) => data.data.find((p: Product) => p._id === id))
                .filter(Boolean);

              setProducts(ordered as Product[]);
            } else {
              setProducts([]);
            }
          }
        }

        // =========================
        // ✅ NORMAL ROUTES
        // =========================
        else if (route) {
          const res = await fetch(
            `http://localhost:8080/api/v1/product/${route}`,
            { credentials: "include" }
          );

          const data = await res.json();
          setProducts(data.success ? data.data : []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [route, categorySlug, isAuthenticated]);

  // =========================
  // ✅ CART HANDLERS
  // =========================
  const handleAdd = (product: Product) => {
    addToCart(product, 1);
  };

  const handleIncrease = (key: string) => {
    updateQuantity(key, "inc");
  };

  const handleDecrease = (key: string) => {
    updateQuantity(key, "dec");
  };

  return (
    <div className="categorySwiper my-8">

      {(loading || products.length > 0) && (
  <Box
    sx={{ width: "95%" }}
    className="w-full flex justify-between items-center mx-auto pt-4 mb-4"
  >
    <h1 className="text-[24px] font-bold">{headerName}</h1>
  </Box>
)}

      <div className="w-[95%] mx-auto">
        <Swiper
          slidesPerView={6}
          spaceBetween={10}
          navigation={true}
          modules={[Navigation]}
          breakpoints={{
            0: { slidesPerView: 1.2 },
            480: { slidesPerView: 2 },
            640: { slidesPerView: 2.5 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 6 },
          }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <SwiperSlide key={i}>
                  <SkeletonCard />
                </SwiperSlide>
              ))
            : products.map((product) => {
                const key = getCartKey(product._id);
                const item = cart[key];

                return (
                  <SwiperSlide key={product._id}>
                    <ProductCard
                      product={product}
                      item={item}
                      handleAdd={handleAdd}
                      handleIncrease={() => handleIncrease(key)}
                      handleDecrease={() => handleDecrease(key)}
                      handleClickOpen={handleClickOpen}
                      handleOpenAiChat={handleOpenAiChat}
                      loadingCartItems={loadingCartItems}
                    />
                  </SwiperSlide>
                );
              })}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductsSlider;