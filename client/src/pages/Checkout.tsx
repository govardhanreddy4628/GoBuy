import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ShippingForm } from "../components/checkout/ShippingForm";
import { PaymentMethodSelector } from "../components/checkout/PaymentMethodSelector";
import { OrderSummary } from "../components/checkout/OrderSummary";
import Layout from "../components/layout";
import { useCart } from "../context/cartContext";
import { useAuth } from "../context/authContext";
import api from "../api/api_utility";
import { SavedAddresses } from "../components/checkout/SavedAddresses";

export type PaymentMethod = "phonepe" | "cod";

export interface ShippingDetails {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  houseNumber?: string;
  streetName?: string;
  address_line: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  address_type: "home" | "office";
}

export type ShippingFormValues = Omit<ShippingDetails, "_id">;

const Checkout = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();

  const cartItems = Object.values(cart);

  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("phonepe");
  const [isProcessing, setIsProcessing] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<ShippingDetails[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingDetails | null>(null);

  // ================= FETCH ADDRESSES =================
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await api.get("/api/v1/address/get");
        const data = res.data.data || [];

        setSavedAddresses(data);

        if (data.length > 0) {
          setSelectedAddressId(data[0]._id);
          setShippingDetails(data[0]);
        } else {
          setShowAddressForm(true);
        }
      } catch (error) {
        toast({ title: "Failed to load addresses" });
        console.error(error);
      }
    };

    fetchAddresses();
  }, [isAuthenticated, navigate]);

  // ================= ADD / UPDATE ADDRESS =================
  const handleSubmitAddress = async (data: ShippingFormValues) => {
    try {
      setLoadingAddress(true);

      if (editingAddress) {
        const res = await api.put(
          `/api/v1/address/edit/${editingAddress._id}`,
          data
        );

        const updated = res.data.data;

        setSavedAddresses((prev) =>
          prev.map((addr) =>
            addr._id === editingAddress._id ? updated : addr
          )
        );

        setSelectedAddressId(updated._id);
        setShippingDetails(updated);

        toast({ title: "Address updated successfully" });
      } else {
        const res = await api.post("/api/v1/address/add", data);
        const newAddress = res.data.data;

        setSavedAddresses((prev) => [newAddress, ...prev]);
        setSelectedAddressId(newAddress._id);
        setShippingDetails(newAddress);

        toast({ title: "Address added successfully" });
      }

      setEditingAddress(null);
      setShowAddressForm(false);
    } catch (error) {
      toast({ title: "Something went wrong" });
      console.error(error);
    } finally {
      setLoadingAddress(false);
    }
  };

  // ================= DELETE =================
  const handleDeleteAddress = async (id: string) => {
    try {
      await api.delete(`/api/v1/address/delete/${id}`);

      setSavedAddresses((prev) => prev.filter((a) => a._id !== id));

      if (selectedAddressId === id) {
        setSelectedAddressId(null);
        setShippingDetails(null);
      }

      toast({ title: "Address deleted" });
    } catch {
      toast({ title: "Failed to delete" });
    }
  };

  // ================= EDIT =================
  const handleEditAddress = (address: ShippingDetails) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  // ================= TOTAL =================
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.finalPrice || 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 500 ? 0 : 99;
  // const tax = Math.round(subtotal * 0.18);
  // const total = subtotal + shipping + tax;
  const total = subtotal + shipping;

  // ================= PLACE ORDER =================
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast({ title: "Please select address" });
      return;
    }

    try {
      setIsProcessing(true);

      const validItems = cartItems.filter((item) => item.product?._id);

      const payload = {
        items: validItems.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0]?.url,
          price: item.product.finalPrice,
          quantity: item.quantity,
          color: Array.isArray(item.color)
            ? item.color[0]
            : item.color,
          size: item.size,
        })),
        deliveryAddressId: selectedAddressId,
        paymentMethod,
        totalAmount: total,
      };

      const res = await api.post("/api/v1/order/create", payload);
      const orderId =
        res.data?.orderId || res.data?.data?.order?._id;

      if (paymentMethod === "phonepe") {
        localStorage.setItem("pendingOrderId", orderId);

        navigate("/payment", {
          state: {
            amount: total,
            orderId,
            shippingDetails,
            paymentMethod,
          },
        });
      } else {
        navigate("/order-confirmation", {
          state: {
            orderId,
            shippingDetails,
            paymentMethod,
            amount: total,
          },
        });
      }
    } catch (error) {
      toast({ title: "Order failed" });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueToPayment = () => {
    if (shippingDetails) {
      setStep("payment");
    }
  };

  // ================= UI =================
  return (
    <Layout>
      <div className="dark:bg-gray-800">
        <div className="container mx-auto py-10 dark:bg-gray-800">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Shipping Address
                </h2>

                {step === "shipping" && (
                  <>
                    <SavedAddresses
                      addresses={savedAddresses}
                      selectedAddressId={selectedAddressId}
                      onSelectAddress={(id) => {
                        const selected = savedAddresses.find(
                          (a) => a._id === id
                        );
                        if (selected) {
                          setSelectedAddressId(id);
                          setShippingDetails(selected);
                        }
                      }}
                      onDelete={handleDeleteAddress}
                      onEdit={handleEditAddress}
                    />

                    {!showAddressForm && (
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => {
                          setEditingAddress(null);
                          setShowAddressForm(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Address
                      </Button>
                    )}

                    {!showAddressForm && shippingDetails && (
                      <Button
                        className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleContinueToPayment}
                      >
                        Continue to Payment
                      </Button>
                    )}

                    {showAddressForm && (
                      <>
                        <Separator className="my-4" />
                        <ShippingForm
                          onSubmit={handleSubmitAddress}
                          loading={loadingAddress}
                          onCancel={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          }}
                          defaultValues={editingAddress || undefined}
                          isEdit={!!editingAddress}
                        />
                      </>
                    )}
                  </>
                )}

                {step === "payment" && shippingDetails && (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{shippingDetails?.fullName}</p>
                    <p className="text-muted-foreground">{shippingDetails?.email}</p>
                    <p className="text-muted-foreground">{shippingDetails?.mobile}</p>
                    <p className="text-muted-foreground">{shippingDetails?.address_line}</p>
                    <p className="text-muted-foreground">
                      {shippingDetails?.city}, {shippingDetails?.state} - {shippingDetails?.pincode}
                    </p>
                  </div>
                )}
              </Card>

              {step === "payment" && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">
                    Select Payment Method
                  </h2>
                  <PaymentMethodSelector
                    selected={paymentMethod}
                    onSelect={setPaymentMethod}
                  />
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-4">
                <OrderSummary
                  items={cartItems.map((item) => ({
                    id: item.product._id,
                    name: item.product.name,
                    price: item.product.finalPrice,
                    quantity: item.quantity,
                    image: item.product.images?.[0]?.url,
                  }))}
                  subtotal={subtotal}
                  shipping={shipping}
                  //tax={tax}
                  total={total}
                />

                {step === "payment" && (
                  <Button
                    className="w-full bg-red-500 hover:bg-red-600"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Place Order - ₹${total}`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;