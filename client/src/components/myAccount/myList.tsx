import { useWishlist } from "../../context/wishlistContext";
import ProductCard from "../productCard";

const MyList = () => {
  const { wishlist } = useWishlist();

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">My Wishlist</h1>
      <hr className="my-4" />

      {wishlist.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          No items in wishlist
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      )}
    </div>
  );
};

export default MyList;