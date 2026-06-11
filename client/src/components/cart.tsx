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
    <section className="w-full bg-gray-50 dark:bg-gray-800">
      <div className="py-5 max-w-[95%] lg:max-w-[90%] mx-auto pb-10">
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* LEFT */}
          <div className="w-full lg:w-[70%]">
            <div className="py-3 px-4 border-b bg-white dark:bg-gray-900 dark:border-gray-700 rounded-t-md">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                Your Cart
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                There are{" "}
                <span className="font-bold text-primary">
                  {cartItems.length}
                </span>{" "}
                products in your cart
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-b-md space-y-4 shadow-sm">
              {cartItems.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">
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
          <div className="w-full lg:w-[30%] lg:ml-2 lg:sticky lg:top-5">
            <div className="shadow-md rounded-md bg-white dark:bg-gray-900 dark:border dark:border-gray-700 p-5">

              <h3 className="pb-3 font-semibold text-lg text-gray-900 dark:text-gray-100">
                Cart Total
              </h3>

              <hr className="dark:border-gray-700" />

              <div className="mt-3 space-y-3 text-sm text-gray-700 dark:text-gray-300">

                <p className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-red-500 font-bold">
                    ₹ {subtotal.toFixed(2)}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold">
                    ₹ {shipping.toFixed(2)}
                  </span>
                </p>

                <p className="flex justify-between pt-3 border-t dark:border-gray-700 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="text-red-500 font-bold">
                    ₹ {total.toFixed(2)}
                  </span>
                </p>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 mt-5 !bg-red-500 !text-white !py-2 hover:!bg-red-600 transition"
              >
                <BsFillBagCheckFill />
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
