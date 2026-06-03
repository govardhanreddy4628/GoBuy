import { IoClose } from "react-icons/io5";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useCart } from "../context/cartContext";
import { Link, useNavigate } from "react-router-dom";
import { truncateWords } from "../helpers";

type CartSidebarProps = {
    setOpen: (open: boolean) => void;
};

const CartSidebar = ({ setOpen }: CartSidebarProps) => {
    const { cart, deleteItem, updateQuantity } = useCart();
    const navigate = useNavigate();

    const cartItems = Object.entries(cart);
    const isEmpty = cartItems.length === 0;

    const subtotal = cartItems.reduce((acc, [, item]) => {
        const price = item.product?.finalPrice || 0;
        return acc + price * item.quantity;
    }, 0);

    const shipping = subtotal > 500 ? 0 : 99;
    const total = subtotal + shipping;

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white">

            {/* Header */}
            <header className="flex justify-between items-center p-4 shadow bg-white dark:bg-gray-900">
                <h1 className="text-lg font-semibold">
                    Shopping Cart{" "}
                    <span className="text-sm font-normal">
                        ({cartItems.length})
                    </span>
                </h1>
                <button onClick={() => setOpen(false)}>
                    <IoClose size={25} />
                </button>
            </header>

            <hr />

            {/* Cart Items - Proper Scroll Area */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {isEmpty && (
                    <p className="text-center text-gray-500 mt-10">
                        Your cart is empty
                    </p>
                )}

                {cartItems.map(([productId, item]) => {
                    const product = item.product;

                    return (
                        <div
                            key={productId}
                            className="flex gap-3 border-b pb-3"
                        >
                            <div className="w-16 h-16 border rounded overflow-hidden flex-shrink-0">
                                <img
                                    src={product?.images?.[0]?.url}
                                    alt={product?.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1">
                                <p className="text-xs text-gray-500">
                                    {product.brand}
                                </p>

                                <h3 className="text-sm font-normal pr-6">
                                    <Link
                                        to={`/product/${product._id}`}
                                        className="hover:text-primary"
                                    >
                                        {truncateWords(product.name, 9)}
                                    </Link>
                                </h3>

                                <div className="flex items-center gap-3 mt-1 text-sm flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                updateQuantity(productId, "dec")
                                            }
                                            className="px-2 border rounded"
                                        >
                                            -
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            onClick={() =>
                                                updateQuantity(productId, "inc")
                                            }
                                            className="px-2 border rounded"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="flex gap-2 text-sm items-center">
                                        <span className="line-through text-gray-400 text-xs">
                                            ₹{product.listedPrice}
                                        </span>
                                        <span className="text-red-500 font-medium">
                                            ₹{product?.finalPrice}
                                        </span>
                                        <span className="text-red-400 text-xs">
                                            {product.discountPercentage}% OFF
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => deleteItem(productId)}
                                className="text-gray-500 hover:text-red-600"
                            >
                                <RiDeleteBin5Line size={20} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Footer - Always Visible */}
            <div className="p-4 border-t bg-white dark:bg-gray-900 shadow-md">
                {!isEmpty ? (
                    <>
                        <div className="flex justify-between font-semibold mb-3">
                            <span>Subtotal</span>
                            <span>₹{subtotal}</span>
                        </div>

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
                    </>
                ) : (
                    <div className="flex justify-between font-semibold mb-3">
                        <span>total</span>
                        <span>₹ 0</span>
                    </div>
                )}


                <div className="flex gap-2">
                    <button
                        disabled={isEmpty}
                        onClick={() => {
                            setOpen(false);
                            navigate("/cartpage");
                        }}
                        className={`w-full py-2 rounded border bg-gray-300 shadow-md ${isEmpty
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-400 shadow-md dark:hover:bg-gray-800"
                            }`}
                    >
                        Go To Cart
                    </button>

                    {/* <button
                        disabled={isEmpty}
                        className={`w-full py-3 rounded ${
                            isEmpty
                                ? "bg-red-400 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                        Checkout
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default CartSidebar;