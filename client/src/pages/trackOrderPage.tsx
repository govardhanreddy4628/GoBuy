import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/layout";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle2, Package, Truck, Home } from "lucide-react";

type OrderStatus =
    | "placed"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered";

const STATUS_STEPS = [
    { key: "placed", label: "Order Placed", icon: CheckCircle2 },
    { key: "packed", label: "Packed", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
    { key: "delivered", label: "Delivered", icon: Home },
];

const TrackOrder = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState<OrderStatus>("placed");

    useEffect(() => {
        try {
            // Example API
            // const res = await fetch(`/api/orders/${orderId}`);
            // const data = await res.json();
            // setStatus(data.status);

            // // TEMP MOCK (simulate real flow)
            // setTimeout(() => setStatus("packed"), 1000);
            // setTimeout(() => setStatus("shipped"), 2000);
            // setTimeout(() => setStatus("out_for_delivery"), 3000);
            // setTimeout(() => setStatus("delivered"), 4000);
        } catch (err) {
            console.error(err);
        }

    }, [orderId]);

    const currentIndex = STATUS_STEPS.findIndex(
        (s) => s.key === status
    );

    const isDelivered = status === "delivered";

    return (
        <Layout>
            <div className="min-h-screen py-10 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-xl mx-auto px-4">
                    <Card className="p-8 bg-white dark:bg-gray-800 border dark:border-gray-700">

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Track Order
                        </h2>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
                            Order ID: {orderId}
                        </p>

                        {/* Timeline */}
                        <div className="relative">

                            {/* Base line (stops before last icon center) */}
                            <div className="absolute left-3 top-3 w-[2px] bg-gray-200 dark:bg-gray-700 h-[calc(100%-24px)]" />

                            {/* Progress line (stops correctly at current step) */}
                            <div
                                className="absolute left-3 top-3 w-[2px] bg-red-500 transition-all duration-700 ease-out"
                                style={{
                                    height: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100
                                        }%`,
                                }}
                            />

                            <div className="space-y-10">
                                {STATUS_STEPS.map((step, index) => {
                                    const Icon = step.icon;

                                    const isCompleted =
                                        index < currentIndex ||
                                        (isDelivered && index === currentIndex);

                                    const isCurrent =
                                        index === currentIndex && !isDelivered;

                                    return (
                                        <div
                                            key={step.key}
                                            className="flex items-start gap-4 relative"
                                        >
                                            {/* DOT */}
                                            <div className="relative z-10">
                                                <div
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500
                          ${isCompleted
                                                            ? "bg-red-500 text-white"
                                                            : isCurrent
                                                                ? "border-2 border-red-500 text-red-500 bg-white dark:bg-gray-800 scale-105"
                                                                : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                                                        }`}
                                                >
                                                    <Icon size={14} />
                                                </div>
                                            </div>

                                            {/* TEXT */}
                                            <div className="pt-0.5">
                                                <p
                                                    className={`text-sm font-medium transition-colors duration-500 ${isCompleted || isCurrent
                                                            ? "text-gray-900 dark:text-gray-100"
                                                            : "text-gray-400"
                                                        }`}
                                                >
                                                    {step.label}
                                                </p>

                                                {isCurrent && (
                                                    <p className="text-xs text-red-500 mt-1 animate-pulse">
                                                        Processing your order...
                                                    </p>
                                                )}

                                                {isDelivered && index === currentIndex && (
                                                    <p className="text-xs text-green-500 mt-1">
                                                        Delivered successfully
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Button */}
                        <div className="mt-12">
                            <Button
                                className="w-full"
                                onClick={() => navigate("/")}
                            >
                                Continue Shopping
                            </Button>
                        </div>

                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default TrackOrder;