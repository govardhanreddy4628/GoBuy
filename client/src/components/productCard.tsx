import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { IoExpand } from "react-icons/io5";
import { FaRegHeart, FaStar } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { Button, IconButton, CircularProgress } from "@mui/material";
import { truncateWords } from "../helpers";
import { useWishlist } from "../context/wishlistContext";
import { useState } from "react";

interface Product {
  _id: string;
  name: string;
  shortDescription: string;
  brand: string;
  finalPrice: number;
  listedPrice: number;
  discountPercentage: number;
  rating: number;
  images: any[];
}

interface Props {
  product: Product;
  item: any;
  handleAdd: (product: Product) => void;
  handleIncrease: (productId: string) => void;
  handleDecrease: (productId: string) => void;
  handleClickOpen: (product: Product) => void;
  loadingCartItems?: { [productId: string]: boolean };
}

const ProductCard = ({
  product,
  item,
  handleAdd,
  handleIncrease,
  handleDecrease,
  handleClickOpen,
  loadingCartItems = {}
}: Props) => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isWishlisted = Array.isArray(wishlist) &&
    wishlist.some((p: any) => p?._id === product._id);
  console.log("isWishlisted:", isWishlisted) // ✅ DEBUGGING

  const inCart = !!item;
  const qty = item?.quantity || 0;
  const key = `${product._id}__`;
  const isLoading = loadingCartItems?.[key] || false;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-400 shadow-md rounded-md flex flex-col items-center relative overflow-hidden">
      <div className="bg-white w-full flex items-center justify-center border-1 border-gray-200 relative group">
        <Link
          to={`/productdetails/${product._id}`}
          className="w-full h-[200px] relative overflow-hidden"
        >
          <img
            src={product.images?.[0]?.url || "/placeholder.png"}
            className="w-full opacity-100 hover:opacity-0 transition duration-500"
          />

          <img
            src={product.images?.[1]?.url || product.images?.[0]?.url || "/placeholder.png"}
            className="w-full absolute top-[0px] left-[0px] opacity-0 group-hover:scale-105 group-hover:opacity-100 group-hover:z-50 transition duration-500"
          />
        </Link>
        <div className="bg-red-400 rounded-md absolute left-[10px] top-[10px] text-[14px] px-2 py-1 z-50">
          {product.discountPercentage}%
        </div>

        <div className={`absolute right-[10px] flex flex-col gap-[5px] p-1 transition-all z-50 duration-400
         ${isWishlisted ? "top-[10px]" : "-top-[100%] group-hover:top-[10px]"}`}
        >
          <div
            onClick={async () => {
              if (!product) return;
              setLoadingId(product._id);
              await toggleWishlist(product);
              setLoadingId(null);
            }}
            className={`h-[35px] w-[35px] rounded-full flex items-center justify-center cursor-pointer transition-all
            ${isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-500 hover:text-white"
              }`}
          >
            {loadingId === product._id ? (
              <CircularProgress size={18} className="text-white" />
            ) : (
              <FaRegHeart />
            )}
          </div>

          <div
            className="h-[35px] w-[35px] rounded-full bg-white dark:bg-gray-800 dark:text-gray-200 flex items-center justify-center dark:hover:bg-red-500 hover:text-white hover:bg-red-500 transition-all cursor-pointer"
            onClick={() => handleClickOpen(product)}
          >
            <IoExpand />
          </div>
        </div>
      </div>

      <div className="info flex flex-col itms-center hustify-center w-full p-3">
        <h6 className="text-[14px] font-[600] capitalize mt-2 line-clamp-2 overflow-hidden">
          <Link to={`/productdetails/${product._id}`} className="link">
            {product.name}
          </Link>
        </h6>

        <p className="text-[13px] font-[550] text-red-600 dark:text-gray-300 mt-1 ">
          {product.brand}
        </p>

        <h3 className="text-[13px] font-[300] leading-[20px] mt-2 text-[rgba(0,0,0,0.6)] dark:text-gray-300 transition-all line-clamp-2 overflow-hidden">
          {truncateWords(product.shortDescription, 9)}
        </h3>

        <div className="flex items-start justify-between w-full py-2">
          <div className="flex flex-col">
            <p className="text-[12px] font-medium line-through text-gray-600 dark:text-gray-300">
              ₹{product.listedPrice}
            </p>
            <p className="text-[15px] font-bold text-red-400">
              ₹{product.finalPrice}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-red-400 text-white text-[13px] px-2 py-[2px] my-[2px] rounded-md">
            <span>{product.rating || 4}</span>
            <FaStar className="text-white text-[12px]" />
          </div>
        </div>

        {!inCart ? (
          <Button
            className="flex items-center justify-center !w-[90%] !border-[1.5px] !border-solid !border-red-400 !bg-inherit !text-red-400 !mx-auto gap-3 !my-4"
            onClick={() => handleAdd(product)}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={20} className="text-red-400" />
            ) : (
              <>
                <ShoppingCartCheckoutIcon /> ADD TO CART
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center justify-between !w-[90%] border border-gray-900 rounded-md !mx-auto !my-4 text-red-400">
            <IconButton
              onClick={() => handleDecrease(product._id)}
              className="!text-gray-80000 cursor-pointer border-r"
            >
              <RemoveIcon className="!text-[18px]" />
            </IconButton>

            {/* Vertical Separator */}
            <div className="w-[2px] h-8 bg-gray-400" />

            <Button
              onClick={() => navigate("/cartpage")}
              className="!text-gray-800 font-medium text-nowrap !text-[12px]"
            >
              GO TO CART ({qty})
            </Button>

            {/* Vertical Separator */}
            <div className="w-[2px] h-8 bg-gray-400" />

            <IconButton
              onClick={() => handleIncrease(product._id)}
              className="!text-gray-800-400 cursor-pointer"
            >
              <AddIcon className="!text-[18px]" />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
