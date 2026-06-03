import { useEffect } from "react";
import { useWishlist } from "../context/wishlistContext";
import ProductCard from "../components/productCard";
import Layout from "../components/layout";

// ✅ Skeleton Card
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-400 shadow-md rounded-md flex flex-col items-center relative overflow-hidden animate-pulse w-[280px]">
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

const WishlistPage = () => {
  const { wishlist, fetchWishlist } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (!wishlist.length) {
    return (
      <div className="p-10 text-center text-gray-500 flex gap-4">
        <SkeletonCard/>
        <SkeletonCard/>
        <SkeletonCard/>
        <SkeletonCard/>
        <SkeletonCard/>
      </div>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold ms-6 mt-6 border-l-4 border-gray-800 pl-2">Wish List</h1>
    <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
      {wishlist.map((product: any) => (
        <ProductCard
          key={product._id}
          product={product}
          item={null}
          handleAdd={() => {}}
          handleIncrease={() => {}}
          handleDecrease={() => {}}
          handleClickOpen={() => {}}
          loadingCartItems={{}}
        />
      ))}
    </div>
    </Layout>
  );
};

export default WishlistPage;