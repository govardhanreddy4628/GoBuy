import { useEffect, useState } from "react";
import { GET } from "../../../api/api_utility";

interface FunnelData {
  views: number;
  cartAdds: number;
  orders: number;
}

const ProductFunnelChart = () => {

  const [data, setData] = useState<FunnelData>({
    views: 0,
    cartAdds: 0,
    orders: 0
  });

  const fetchFunnel = async () => {
    try {
      const res = await GET("/api/v1/analytics/product-funnel");
      setData(res.data.data);
    } catch (error) {
      console.error("Failed to load funnel analytics", error);
    }
  };

  useEffect(() => {
    fetchFunnel();
  }, []);

  const cartRate =
    data.views > 0 ? Math.round((data.cartAdds / data.views) * 100) : 0;

  const orderRate =
    data.cartAdds > 0 ? Math.round((data.orders / data.cartAdds) * 100) : 0;

  const safeCartWidth = Math.min(cartRate, 100);
  const safeOrderWidth = Math.min(orderRate, 100);

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-xl">

      <h2 className="text-lg font-semibold mb-6">
        Product Conversion Funnel
      </h2>

      <div className="flex flex-col gap-6">

        {/* VIEWS */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Views</span>
            <span className="text-gray-600">{data.views}</span>
          </div>

          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-full rounded-full" />
          </div>
        </div>

        {/* ARROW */}
        <div className="text-center text-sm text-gray-500">
          ↓ {cartRate}% added to cart
        </div>

        {/* CART ADDS */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Add To Cart</span>
            <span className="text-gray-600">{data.cartAdds}</span>
          </div>

          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${safeCartWidth}%` }}
            />
          </div>
        </div>

        {/* ARROW */}
        <div className="text-center text-sm text-gray-500">
          ↓ {orderRate}% products ordered
        </div>

        {/* ORDERS */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Orders</span>
            <span className="text-gray-600">{data.orders}</span>
          </div>

          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${safeOrderWidth}%` }}
            />
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProductFunnelChart;