import { IoCloseSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import { GoTriangleDown } from "react-icons/go";
import { useState, useEffect } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useCart } from "../context/cartContext";
import { getCloudinaryImage } from "../utils/imgTransformation";

const CartItem = ({ item }: any) => {
  const { updateQuantity, deleteItem } = useCart();
  const product = item.product;

  const [selectedQty, setSelectedQty] = useState<number>(item.quantity);

  useEffect(() => {
    setSelectedQty(item.quantity);
  }, [item.quantity]);

  const [qtyAnchorEl, setQtyAnchorEl] = useState<null | HTMLElement>(null);
  const qtyOpen = Boolean(qtyAnchorEl);

  const handleQtyClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    setQtyAnchorEl(event.currentTarget);
  };

  const handleQtyClose = (value: number | null) => {
    setQtyAnchorEl(null);

    if (value !== null) {
      setSelectedQty(value);

      const diff = value - item.quantity;

      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          updateQuantity(product._id, "inc");
        }
      } else if (diff < 0) {
        for (let i = 0; i < Math.abs(diff); i++) {
          updateQuantity(product._id, "dec");
        }
      }
    }
  };

  const imageUrl = product.images?.[0]?.url
    ? getCloudinaryImage(product.images[0].url, {
      width: 250,
      height: 250,
    })
    : "/placeholder.png";

  return (
    <div className="border rounded-md p-3 flex gap-3 sm:gap-4 items-start sm:items-center 
  hover:shadow-md transition bg-white dark:bg-gray-800 
  border-gray-200 dark:border-gray-700">

  {/* IMAGE */}
  <div className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] flex-shrink-0">
    <Link to={`/product/${product._id}`}>
      <img
        src={imageUrl}
        className="w-full h-full object-cover rounded-md"
        alt={product.name}
      />
    </Link>
  </div>

  {/* INFO */}
  <div className="flex-1 relative">

    {/* REMOVE BUTTON */}
    <IoCloseSharp
      onClick={() => deleteItem(product._id)}
      className="absolute right-0 top-0 cursor-pointer text-[18px] 
      text-gray-500 dark:text-gray-400 
      hover:text-red-500"
    />

    {/* BRAND */}
    <p className="text-xs text-gray-500 dark:text-gray-400">
      {product.brand}
    </p>

    {/* NAME */}
    <h3 className="text-sm sm:text-base font-medium pr-6 text-gray-800 dark:text-gray-100 line-clamp-2">
      <Link
        to={`/product/${product._id}`}
        className="hover:text-primary transition"
      >
        {product.name}
      </Link>
    </h3>

    {/* PRICE */}
    <div className="flex flex-wrap gap-2 mt-1 text-sm items-center">
      <span className="font-bold text-gray-900 dark:text-white">
        ₹{Number(product.finalPrice || 0).toFixed(2)}
      </span>

      <span className="line-through text-gray-400 text-xs">
        ₹{Number(product.listedPrice || 0).toFixed(2)}
      </span>

      <span className="text-red-500 text-xs font-medium">
        {product.discountPercentage}% OFF
      </span>
    </div>

    {/* QUANTITY */}
    <div className="mt-2">
      <span
        onClick={handleQtyClick}
        className="inline-flex items-center gap-1 
        bg-gray-100 dark:bg-gray-800 
        px-2 py-1 rounded cursor-pointer text-xs 
        text-gray-800 dark:text-gray-200 
        hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        Qty: <b>{selectedQty}</b>
        <GoTriangleDown />
      </span>

      <Menu
        anchorEl={qtyAnchorEl}
        open={qtyOpen}
        onClose={() => handleQtyClose(null)}
        PaperProps={{
          className:
            "dark:bg-gray-900 dark:text-gray-200 border dark:border-gray-700",
        }}
      >
        {[1,2,3,4,5,6,7,8,9,10].map((qty) => (
          <MenuItem
            key={qty}
            onClick={() => handleQtyClose(qty)}
            className="dark:hover:bg-gray-800"
          >
            {qty}
          </MenuItem>
        ))}
      </Menu>
    </div>
  </div>
</div>
  );
};

export default CartItem;
