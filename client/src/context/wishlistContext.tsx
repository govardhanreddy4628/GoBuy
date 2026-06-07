import { createContext, useContext, useEffect, useState } from "react";
import { GET, POST } from "../api/api_utility";
import { useAuth } from "./authContext";

interface WishlistContextType {
  wishlist: any[];
  toggleWishlist: (product: any) => Promise<void>;
  fetchWishlist: () => Promise<void>;
  wishListLoading: boolean;
  wishListToggleLoading: string | null;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: any) => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [wishListLoading, setWishlistLoading] = useState(false); 
  const [wishListToggleLoading, setWishlistToggleLoading] = useState<string | null>(null);
  const { user } = useAuth();

  // ✅ FETCH WISHLIST
  const fetchWishlist = async () => {
    setWishlistLoading(true);
    try {
      const response = await GET("api/v1/wishlist");

      const res = response.data; // 🔥 IMPORTANT FIX

      if (res?.success) {
        const products = res.data.map((item: any) => item.productId);
        setWishlist(products);
      }
    } catch (err) {
      console.error("Fetch wishlist error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  // ✅ Run when user logs in
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  // ✅ TOGGLE
  const toggleWishlist = async (product: any) => {
    setWishlistToggleLoading(product._id);
    try {
      const response = await POST("api/v1/wishlist/toggle", {
        productId: product._id,
      });

      const res = response.data; // 🔥 IMPORTANT FIX

      if (res?.success) {
        setWishlist((prev) => {
          const exists = prev.some((p) => p._id === product._id);

          if (exists) {
            return prev.filter((p) => p._id !== product._id);
          } else {
            return [...prev, product];
          }
        });
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    } finally {
      setWishlistToggleLoading(null);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, fetchWishlist, wishListLoading, wishListToggleLoading }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return context;
};