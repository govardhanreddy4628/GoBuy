// // // import { createContext, useContext, useEffect, useState } from "react";
// // // import axios from "axios";
// // // import api, { GET, POST } from "../api/api_utility";

// // // const WishlistContext = createContext<any>(null);

// // // export const WishlistProvider = ({ children }: any) => {
// // //   const [wishlist, setWishlist] = useState<any[]>([]);

// // //   // ✅ FETCH
// // //   // const fetchWishlist = async () => {
// // //   //   const res = await api.get("/api/v1/wishlist", {
// // //   //     withCredentials: true,
// // //   //   });

// // //   //   setWishlist(res.data.data || []);
// // //   // };

// // //   // ✅ TOGGLE
// // //   // const toggleWishlist = async (product: any) => {
// // //   //   await api.post(
// // //   //     "api/v1/wishlist/toggle",
// // //   //     { productId: product._id },
// // //   //     { withCredentials: true }
// // //   //   );

// // //   //   setWishlist((prev) => {
// // //   //     const exists = prev.find(
// // //   //       (item) => item.productId._id === product._id
// // //   //     );

// // //   //     if (exists) {
// // //   //       return prev.filter(
// // //   //         (item) => item.productId._id !== product._id
// // //   //       );
// // //   //     } else {
// // //   //       return [...prev, { productId: product }];
// // //   //     }
// // //   //   });
// // //   // };

// // //   const fetchWishlist = async () => {
// // //     try {
// // //       const res = await GET("api/v1/wishlist");
// // //       if (res.success) {
// // //         setWishlist(res.data.map((item: any) => item.productId));
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchWishlist();
// // //   }, []);


// // // const toggleWishlist = async (product: any) => {
// // //   try {
// // //     const res = await POST("api/v1/wishlist/toggle", {
// // //       productId: product._id,
// // //     });

// // //     if (res.success) {
// // //       // 🔥 Always sync from backend (NO GUESSING)
// // //       await fetchWishlist();
// // //     }
// // //   } catch (err) {
// // //     console.error("Wishlist error:", err);
// // //   }
// // // };

// // //   return (
// // //     <WishlistContext.Provider
// // //       value={{ wishlist, toggleWishlist, fetchWishlist }}
// // //     >
// // //       {children}
// // //     </WishlistContext.Provider>
// // //   );
// // // };

// // // export const useWishlist = () => useContext(WishlistContext);




// // import { createContext, useContext, useEffect, useState } from "react";
// // import { GET, POST } from "../api/api_utility";
// // import { useAuth } from "./authContext";

// // const WishlistContext = createContext<any>(null);

// // export const WishlistProvider = ({ children }: any) => {
// //   const [wishlist, setWishlist] = useState<any[]>([]);
// //   const { user } = useAuth(); // ✅ IMPORTANT

// //   // ✅ FETCH WISHLIST
// //   const fetchWishlist = async () => {
// //     try {
// //       const res = await GET("api/v1/wishlist", {
// //         withCredentials: true,
// //       });

// //       if (res.success) {
// //         // 🔥 FIX: map populated data correctly
// //         const products = res.data.map((item: any) => item.productId);
// //         setWishlist(products);
// //       }
// //     } catch (err) {
// //       console.error("Fetch wishlist error:", err);
// //     }
// //   };

// //   // ✅ RUN AFTER LOGIN
// //   useEffect(() => {
// //     if (user) {
// //       fetchWishlist();
// //     }
// //   }, [user]);

// //   // ✅ TOGGLE
// //   const toggleWishlist = async (product: any) => {
// //     try {
// //       const res = await POST(
// //         "api/v1/wishlist/toggle",
// //         { productId: product._id },
// //         { withCredentials: true }
// //       );

// //       if (res.success) {
// //         // 🔥 instant UI update
// //         setWishlist((prev: any[]) => {
// //           const exists = prev.some((p) => p._id === product._id);

// //           if (exists) {
// //             return prev.filter((p) => p._id !== product._id);
// //           } else {
// //             return [...prev, product];
// //           }
// //         });
// //       }
// //     } catch (err) {
// //       console.error("Wishlist toggle error:", err);
// //     }
// //   };

// //   console.log("Wishlist state:", wishlist);
  
// //   return (
// //     <WishlistContext.Provider
// //       value={{ wishlist, toggleWishlist, fetchWishlist }}
// //     >
// //       {children}
// //     </WishlistContext.Provider>
// //   );
// // };

// // export const useWishlist = () => useContext(WishlistContext);





// import { createContext, useContext, useEffect, useState } from "react";
// import { GET, POST } from "../api/api_utility";
// import { useAuth } from "./authContext";

// interface WishlistContextType {
//   wishlist: any[];
//   toggleWishlist: (product: any) => Promise<void>;
//   fetchWishlist: () => Promise<void>;
// }

// const WishlistContext = createContext<WishlistContextType | null>(null);

// export const WishlistProvider = ({ children }: any) => {
//   const [wishlist, setWishlist] = useState<any[]>([]);
//   const { user } = useAuth();

//   // ✅ FETCH WISHLIST
//   const fetchWishlist = async () => {
//     try {
//       const res = await GET("api/v1/wishlist");

//       if (res?.success) {
//         const products = res.data.map((item: any) => item.productId);
//         setWishlist(products);
//       }
//     } catch (err) {
//       console.error("Fetch wishlist error:", err);
//     }
//   };

//   // ✅ RUN WHEN USER CHANGES
//   useEffect(() => {
//     if (user) {
//       fetchWishlist();
//     } else {
//       setWishlist([]); // clear when logout
//     }
//   }, [user]);

//   // ✅ TOGGLE
//   const toggleWishlist = async (product: any) => {
//     try {
//       const res = await POST("api/v1/wishlist/toggle", {
//         productId: product._id,
//       });

//       if (res?.success) {
//         setWishlist((prev) => {
//           const exists = prev.some((p) => p._id === product._id);

//           if (exists) {
//             return prev.filter((p) => p._id !== product._id);
//           } else {
//             return [...prev, product];
//           }
//         });
//       }
//     } catch (err) {
//       console.error("Wishlist toggle error:", err);
//     }
//   };

//   return (
//     <WishlistContext.Provider
//       value={{ wishlist, toggleWishlist, fetchWishlist }}
//     >
//       {children}
//     </WishlistContext.Provider>
//   );
// };

// export const useWishlist = () => {
//   const context = useContext(WishlistContext);
//   if (!context) {
//     throw new Error("useWishlist must be used inside WishlistProvider");
//   }
//   return context;
// };


import { createContext, useContext, useEffect, useState } from "react";
import { GET, POST } from "../api/api_utility";
import { useAuth } from "./authContext";

interface WishlistContextType {
  wishlist: any[];
  toggleWishlist: (product: any) => Promise<void>;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: any) => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const { user } = useAuth();

  // ✅ FETCH WISHLIST
  const fetchWishlist = async () => {
    try {
      const response = await GET("api/v1/wishlist");

      const res = response.data; // 🔥 IMPORTANT FIX

      if (res?.success) {
        const products = res.data.map((item: any) => item.productId);
        setWishlist(products);
      }
    } catch (err) {
      console.error("Fetch wishlist error:", err);
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
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, fetchWishlist }}
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