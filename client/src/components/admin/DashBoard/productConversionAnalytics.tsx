import { useEffect, useState } from "react";
import { GET } from "../../../api/api_utility";

interface ProductAnalytics {
  _id: string;
  name: string;
  images: { url: string }[];
  views: number;
  cartAdds: number;
  orderedCount: number;
  cartConversionRate: number;
  purchaseConversionRate: number;
}

const ITEMS_PER_PAGE = 5;

const ProductConversionAnalytics = () => {
  const [data, setData] = useState<ProductAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAnalytics = async () => {
    try {
      const res = await GET("/api/v1/analytics/product-conversion");
      setData(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ✅ pagination logic
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="p-6 text-gray-500"> Loading analytics...</div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-6">
        Product Conversion Analytics
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          <thead>
            <tr className="text-gray-600 border-b">
              <th className="text-left py-3">Product</th>
              <th className="text-center py-3">Views</th>
              <th className="text-center py-3">Cart Adds</th>
              <th className="text-center py-3">Orders</th>
              <th className="text-center py-3">Cart Conversion</th>
              <th className="text-center py-3">Purchase Conversion</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((product) => {
              const cartRate = Math.round(product.cartConversionRate || 0);
              const purchaseRate = Math.round(product.purchaseConversionRate || 0);

              return (
                <tr
                  key={product._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  {/* Product */}
                  <td className="py-4 flex items-center gap-3">
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                    <span className="text-sm font-medium text-gray-800 line-clamp-1">
                      {product.name}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="text-center font-medium">{product.views}</td>

                  {/* Cart Adds */}
                  <td className="text-center font-medium">{product.cartAdds}</td>

                  {/* Orders */}
                  <td className="text-center font-medium">{product.orderedCount}</td>

                  {/* Cart Conversion */}
                  <td className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-semibold text-blue-600">
                        {cartRate}%
                      </span>

                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(cartRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Purchase Conversion */}
                  <td className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-semibold text-green-600">
                        {purchaseRate}%
                      </span>

                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(purchaseRate, 100)}%` }}
                        />
                      </div>

                    </div>

                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>

        {data.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No analytics data available
          </div>
        )}

      </div>

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>

        </div>
      )}
    </div>
  );
};

export default ProductConversionAnalytics;