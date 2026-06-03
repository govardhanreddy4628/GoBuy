import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import Layout from "../components/layout";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;

  useEffect(() => {
    if (!orderData) {
      navigate("/");
    }
  }, [orderData, navigate]);

  if (!orderData) return null;

  const { orderId, shippingDetails, paymentMethod, amount } = orderData;
  console.log(orderId)

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "stripe": return "Credit/Debit Card (Stripe)";
      case "razorpay": return "Razorpay";
      case "upi": return "UPI";
      case "cod": return "Cash on Delivery";
      default: return method;
    }
  };

  return (
    <Layout>
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-20 w-20 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>

          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <p className="text-xl font-mono font-semibold ">{orderId}</p>
          </div>

          <div className="text-left space-y-4 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{shippingDetails.fullName}</p>
                <p>{shippingDetails.email}</p>
                <p>{shippingDetails.phone}</p>
                <p>{shippingDetails.address}</p>
                <p>{shippingDetails.city}, {shippingDetails.state} - {shippingDetails.pincode}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h3 className="font-semibold mb-1">Payment Method</h3>
                <p className="text-sm text-muted-foreground">
                  {getPaymentMethodLabel(paymentMethod)}
                </p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold mb-1">Total Amount</h3>
                <p className="text-lg font-bold">₹{amount}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
            <Button className="flex-1" onClick={() => navigate("/")}>
              Track Order
            </Button>
          </div>
        </Card>
      </div>
    </div>
    </Layout>
  );
};

export default OrderConfirmation;
