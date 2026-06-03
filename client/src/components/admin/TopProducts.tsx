
// import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
// import { Progress } from "../../ui/progress";

// const products = [
//   {
//     name: "iPhone 15 Pro",
//     sales: 2340,
//     revenue: "$2,794,600",
//     growth: 85,
//     image: "📱"
//   },
//   {
//     name: "MacBook Air M2",
//     sales: 1890,
//     revenue: "$2,454,710",
//     growth: 72,
//     image: "💻"
//   },
//   {
//     name: "AirPods Pro",
//     sales: 3450,
//     revenue: "$859,550",
//     growth: 68,
//     image: "🎧"
//   },
//   {
//     name: "iPad Pro 12.9",
//     sales: 1230,
//     revenue: "$1,351,770",
//     growth: 45,
//     image: "📊"
//   },
//   {
//     name: "Apple Watch Series 9",
//     sales: 2100,
//     revenue: "$838,000",
//     growth: 38,
//     image: "⌚"
//   }
// ];

// export function TopProducts() {
//   return (
//     <Card className="animate-fade-in">
//       <CardHeader>
//         <CardTitle className="text-xl font-semibold">Top Products</CardTitle>
//         <p className="text-sm text-muted-foreground">
//           Best performing products this month
//         </p>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-6">
//           {products.map((product, index) => (
//             <div key={product.name} className="flex items-center space-x-4">
//               <div className="flex-shrink-0">
//                 <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
//                   {product.image}
//                 </div>
//               </div>

//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center justify-between mb-2">
//                   <p className="text-sm font-medium text-foreground truncate">
//                     {product.name}
//                   </p>
//                   <span className="text-sm text-muted-foreground">
//                     {product.sales} sales
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between mb-2">
//                   <p className="text-lg font-semibold text-foreground">
//                     {product.revenue}
//                   </p>
//                   <span className="text-sm font-medium text-accent">
//                     +{product.growth}%
//                   </span>
//                 </div>

//                 <Progress
//                   value={product.growth}
//                   className="h-2"
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }





import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  name: string;
  sales: number;
  revenue: number;
  image?: string;
}

export function TopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("30days");

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL_LOCAL}/api/v1/analytics/top-products?range=${range}`
        );

        setProducts(res.data.data);
        console.log(res.data.data);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [range]);

  if (loading) {
    return <div className="p-6">Loading top products...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-xl font-semibold">
            Top Products
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Best performing products
          </p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border rounded p-1 text-sm"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="month">This Month</option>
        </select>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {products.map((product) => (
            <div key={product.name} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium truncate">
                    {product.name}
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {product.sales} sales
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-semibold">
                    ₹{product.revenue.toLocaleString()}
                  </p>
                </div>

                <Progress
                  value={
                    products.length
                      ? (product.sales / products[0].sales) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}