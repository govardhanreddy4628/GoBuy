import { useState } from "react";
import { useWishlist } from "../../context/wishlistContext";
import ProductCard from "../productCard";
import AiChatModal from "../aiChatModal/aiChatModal";

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

const MyWishList = () => {
  const { wishlist, wishListLoading, wishListToggleLoading } = useWishlist();

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAiChat, setShowAiChat] = useState(false);

  const handleOpenAiChat = (product: any) => {
    setSelectedProduct(product);
    setShowAiChat(true);
  };

  const handleCloseAiChat = () => {
    setShowAiChat(false);
    setSelectedProduct(null);
  };


  return (
    <>
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">My Wishlist</h1>
        <hr className="my-4" />

        {wishListLoading ? (
          <div className="p-10 text-center flex gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : wishlist.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            ❤️ Your wishlist is empty. Start adding products!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlist.map((product: any) => (
              <ProductCard
                key={product._id}
                product={product}
                item={null}
                handleAdd={() => { }}
                handleIncrease={() => { }}
                handleDecrease={() => { }}
                handleClickOpen={() => { }}
                loadingCartItems={{}}
                handleOpenAiChat={handleOpenAiChat}
              />
            ))}
          </div>
        )}
      </div>

      {showAiChat && selectedProduct && (
        <AiChatModal
          product={selectedProduct}
          onClose={handleCloseAiChat}
        />
      )}
    </>
  );
};

export default MyWishList;