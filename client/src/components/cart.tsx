import { BsFillBagCheckFill } from "react-icons/bs";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CartItem from "./cartItem";
import { useCart } from "../context/cartContext";
//import { useAuth } from "../context/authContext";
//import toast from "react-hot-toast";

const Cart = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  //const { isAuthenticated } = useAuth();

  const cartItems = Object.values(cart);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.finalPrice || 0;
    return acc + price * item.quantity;
  }, 0);

  const shipping = subtotal > 500 ? 0 : 99;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    // //  commentout below code later.
    // if (!isAuthenticated) {
    //   toast.error("Please login to proceed with checkout.");
    //   console.log("Login required");
    //   navigate("/login");
    //   return;
    // }
    navigate("/checkout");
  };

  return (
    <section className="py-5 max-w-[90%] mx-auto pb-10">
      <div className="flex gap-5 items-start">
        
        {/* LEFT */}
        <div className="w-[70%]">
          <div className="py-2 px-3 border-b bg-white rounded-t-md">
            <h2 className="font-bold text-lg">Your Cart</h2>
            <p className="text-gray-600 text-sm">
              There are{" "}
              <span className="font-bold text-primary">
                {cartItems.length}
              </span>{" "}
              products in your cart
            </p>
          </div>

          <div className="bg-white p-3 rounded-b-md space-y-4">
            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                Your cart is empty
              </p>
            ) : (
              cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-[30%] ml-2 sticky top-5">
          <div className="shadow-md rounded-md bg-white p-5">
            <h3 className="pb-3 font-semibold text-lg">Cart Total</h3>
            <hr />

            <div className="mt-3 space-y-2 text-sm">
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-red-500 font-bold">
                  ₹ {subtotal.toFixed(2)}
                </span>
              </p>

              <p className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold">₹ {shipping.toFixed(2)}</span>
              </p>

              <p className="flex justify-between pt-2 border-t text-base">
                <span className="font-semibold">Total</span>
                <span className="text-red-500 font-bold">
                  ₹ {total.toFixed(2)}
                </span>
              </p>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 mt-5 !bg-red-500 !text-white !py-2 hover:!bg-red-600"
            >
              <BsFillBagCheckFill />
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
