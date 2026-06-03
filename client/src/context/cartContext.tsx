import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./authContext";
import api from "../api/api_utility";

const GUEST_CART_KEY = "guest_cart";

type CartItem = {
  quantity: number;
  cartItemId?: string;
  color?: string;
  product?: any;
  size?: string;
};

type CartMap = {
  [key: string]: CartItem;
};

type CartContextType = {
  cart: CartMap;
  addToCart: (product: any, quantity?: number, size?: string, color?: string) => Promise<void>;
  updateQuantity: (productId: string, action: "inc" | "dec") => Promise<void>;
  deleteItem: (productId: string) => Promise<void>;
  getCartCount: number;
  mergeCartOnLogin: () => Promise<void>;
  loadingCartItems: { [productId: string]: boolean };
  getCartKey : (productId: string, size?: string, color?: string) => string;
};

const CartContext = createContext<CartContextType | null>(null);

const getCartKey = (productId: string, size?: string, color?: string) =>
  `${productId}_${size || ""}_${color || ""}`;

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  // ------------------ LAZY INITIALIZE CART ------------------
  const [cart, setCart] = useState<CartMap>(() => {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  const [loadingCartItems, setLoadingCartItems] = useState<{ [key: string]: boolean }>({});

  // ------------------ SAVE GUEST CART ------------------
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  // ------------------ FETCH USER CART ------------------
  const fetchCartFromBackend = async () => {
    try {
      const res = await api.get("/api/v1/cart/getCart");
      if (res.data.success) {
        const newCart: CartMap = {};
        res.data.data.forEach((item: any) => {
          const key = getCartKey(
            item.productId._id,
            item.size,
            item.color
          );

          newCart[key] = {
            quantity: item.quantity,
            cartItemId: item._id,
            product: item.productId,
            size: item.size,
            color: item.color,
          };
        });
        setCart(newCart);
      }
    } catch (err) {
      console.error("fetch cart failed", err);
    }
  };

  // ------------------ MERGE GUEST CART ------------------
  const mergeCartOnLogin = async () => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      if (!stored) return;

      const guestCart = Object.entries(JSON.parse(stored)).map(
         ([key, item]: any) => {
          const [productId, size, color] = key.split("_");

          return {
            productId,
            quantity: item.quantity,
            size,
            color,
          };
        }
      );

      if (guestCart.length === 0) return;

      await api.post("/api/v1/cart/merge", {
        items: guestCart,
      });

      localStorage.removeItem(GUEST_CART_KEY); // clear guest cart
    } catch (err) {
      console.error("merge failed", err);
    }
  };

  // ------------------ AUTH CHANGE ------------------
  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        await mergeCartOnLogin();
        await fetchCartFromBackend();
      })();
    }
    // ⚡ DO NOT clear cart if not authenticated; guest cart is persisted in state/localStorage
  }, [isAuthenticated]);

  // ------------------ ADD TO CART ------------------
  const addToCart = async (product: any, quantity: number = 1, size?: string, color?: string) => {
    const key = getCartKey(product._id, size, color);
    const productId = product._id;

    if (!isAuthenticated) {
      setCart((prev) => ({
        ...prev,
        [key]: {
          quantity: (prev[key]?.quantity || 0) + quantity,
          product,
          size,
          color
        },
      }));
      return;
    }

    try {
      setLoadingCartItems((prev) => ({ ...prev, [key]: true }));
      const res = await api.post("/api/v1/cart/add", { productId, quantity, size, color });
      if (res.data.success) {
        await fetchCartFromBackend();
      }
    } catch (err) {
      console.error("addToCart failed", err);
    } finally {
      setLoadingCartItems((prev) => ({ ...prev, [key]: false }));
    }
  };

  // ------------------ UPDATE QUANTITY ------------------
  const updateQuantity = async (
    key: string,
    action: "inc" | "dec"
  ) => {
    const item = cart[key];
    if (!item) return;

    const newQty = action === "inc" ? item.quantity + 1 : item.quantity - 1;
    if (newQty <= 0) return deleteItem(key);

    if (!isAuthenticated) {
      setCart((prev) => ({
        ...prev,
        [key]: { ...item, quantity: newQty },
      }));
      return;
    }

    try {
      setLoadingCartItems((prev) => ({ ...prev, [key]: true }));
      await api.put(`/api/v1/cart/updateCartItem/${item.cartItemId}`, { quantity: newQty });
      await fetchCartFromBackend();
    } catch (err) {
      console.error("update failed", err);
    } finally{
setLoadingCartItems((prev)=> ({...prev, [key]: false}))
    }
  };

  // ------------------ DELETE ITEM ------------------
  const deleteItem = async (key: string) => {
    const item = cart[key];
    if (!item) return;

    if (!isAuthenticated) {
      const updated = { ...cart };
      delete updated[key];
      setCart(updated);
      return;
    }

    try {
      await api.delete(`/api/v1/cart/deleteCartItem/${item.cartItemId}`);
      await fetchCartFromBackend();
    } catch (err) {
      console.error("delete failed", err);
    }
  };

  // ------------------ CART COUNT ------------------
  const getCartCount = useMemo(() => {
    return Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        deleteItem,
        getCartCount,
        mergeCartOnLogin,
        loadingCartItems,
        getCartKey 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ================= HOOK =================
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("CartContext missing");
  return ctx;
};
