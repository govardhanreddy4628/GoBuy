import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { OrderDetailsDialog, Order } from "./OrderDetailsDialog";
import { OrderActions } from "./OrderActions";
import { StatusUpdateDialog } from "./StatusUpdateDialog";
//import { generateMockOrders } from "./mockOrders";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { toast } from "../../../hooks/use-toast";
import { Input } from "../../../ui/input";
import { GET, PUT } from "../../../api/api_utility";
import { OrderStatus } from "../types/order";
import OrdersTable from "./OrdersTable";
import OrdersLayout from "./OrdersLayout";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// ✅ Debounce Hook
const useDebounce = (value: string, delay = 500) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value]);

  return debounced;
};

type OrdersResponse = {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<{ id: string; status: OrderStatus } | null>(null);
  
  const debouncedSearch = useDebounce(searchQuery);
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const itemsPerPage = 10;



   // ✅ React Query
  const { data, isLoading, refetch } = useQuery<OrdersResponse>({
    queryKey: ["orders", currentPage, debouncedSearch, statusFilter],
    queryFn: async (): Promise<OrdersResponse> => {
      const res = await GET(
        `/api/v1/order?page=${currentPage}&search=${debouncedSearch}&status=${statusFilter}`
      );

      const apiData = res.data;

      // ✅ ADD MAPPING HERE
      const mappedOrders: Order[] = apiData.data.map((order: any) => ({
        id: order.orderId,
        customerName: order.shippingAddress?.fullName || "N/A",
        customerEmail: order.shippingAddress?.email || "N/A",
        date: order.createdAt,
        status: order.orderStatus as OrderStatus,
        total: order.totalAmount ?? 0,

        items:
          order.items?.map((item: any) => ({
            id: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            category: item.category ?? "N/A",
            sku: item.productId,
            discount: item.discount || 0,
            inStock: true,
          })) || [],

        shippingAddress: {
          street: order.shippingAddress?.address_line ?? "",
          city: order.shippingAddress?.city ?? "",
          state: order.shippingAddress?.state ?? "",
          zip: order.shippingAddress?.pincode ?? "",
          country: order.shippingAddress?.country ?? "",
        },
      }));

      return {
        orders: mappedOrders,
        pagination: apiData.pagination,
      };
    },
    placeholderData: (prev) => prev
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination || { total: 0, pages: 1 };

  // useEffect(() => {
  //   fetchOrders();
  // }, [currentPage, searchQuery, statusFilter]);

  // const fetchOrders = async () => {
  //   try {
  //     const res = await GET(`/api/v1/order?page=${currentPage}&search=${searchQuery}&status=${statusFilter}`);
  //     const apiData = res.data;
  //     console.log(apiData.data)
  //     // ✅ ADD MAPPING HERE
  //     const mappedOrders: Order[] = apiData.data.map((order: any) => ({
  //       id: order.orderId,
  //       customerName: order.shippingAddress?.fullName || "N/A",
  //       customerEmail: order.shippingAddress?.email || "N/A",
  //       date: order.createdAt,
  //       status: order.orderStatus as OrderStatus,
  //       total: order.totalAmount ?? 0,

  //       items:
  //         order.items?.map((item: any) => ({
  //           id: item._id,
  //           name: item.name,
  //           quantity: item.quantity,
  //           price: item.price,
  //           category: item.category ?? "N/A",
  //           sku: item.productId,
  //           discount: item.discount || 0,
  //           inStock: true,
  //         })) || [],

  //       shippingAddress: {
  //         street: order.shippingAddress?.address_line ?? "",
  //         city: order.shippingAddress?.city ?? "",
  //         state: order.shippingAddress?.state ?? "",
  //         zip: order.shippingAddress?.pincode ?? "",
  //         country: order.shippingAddress?.country ?? "",
  //       },
  //     }));

  //     // ✅ SET STATE HERE
  //     setOrders(mappedOrders);

  //     setPagination({
  //       total: apiData.pagination.total,
  //       pages: apiData.pagination.pages,
  //     });

  //   } catch (error) {
  //     console.error("Failed to fetch orders", error);
  //   }
  // };

  // const filteredOrders = useMemo(() => {
  //   return orders.filter((order) => {
  //     const matchesSearch =
  //       order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

  //     const matchesStatus = statusFilter === "all" || order.status === statusFilter;

  //     return matchesSearch && matchesStatus;
  //   });
  // }, [orders, searchQuery, statusFilter]);


  // ✅ Backend already paginates
  // const totalPages = pagination.pages;

  const handleRefresh = () => {
    //fetchOrders();
    refetch();
    setSelectedOrders([]);
    toast({
      title: "Orders Refreshed",
      description: "Order data updated",
    });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await PUT(`/api/v1/order/${orderId}/status`, { status: newStatus });
      //fetchOrders(); // refresh from backend
      refetch();

      toast({
        title: "Status Updated",
        description: `Order updated to ${newStatus}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <OrdersLayout
        showHeader={!isDashboard}
        showStats={!isDashboard}
        orders={orders}
        totalOrders={pagination.total}
      >

        {/* Actions */}
        <OrderActions
          //orders={filteredOrders}
          orders={orders}
          selectedOrders={selectedOrders}
          onRefresh={handleRefresh}
        />

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 animate-fade-in">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer name, or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {[
                "created",
                "confirmed",
                "packed",
                "ready_to_ship",
                "shipped",
                "in_transit",
                "out_for_delivery",
                "delivered",
                "cancelled",
                "returned",
                "refunded",
              ].map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, " ").toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <OrdersTable
          orders={orders}
          loading={isLoading}
          selectedOrders={selectedOrders}
          onSelectOrder={(id, checked) => {
            setSelectedOrders((prev) =>
              checked ? [...prev, id] : prev.filter((i) => i !== id)
            );
          }}
          onView={(o) => {
            setSelectedOrder(o);
            setDialogOpen(true);
          }}
          onEdit={(o) => {
            setOrderToUpdate({ id: o.id, status: o.status });
            setStatusDialogOpen(true);
          }}
          currentPage={currentPage}
          totalPages={pagination.pages}
          onPageChange={setCurrentPage}
          totalItems={pagination.total}
        />

        {/* Order Details Dialog */}
        <OrderDetailsDialog
          order={selectedOrder}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />

        {/* Status Update Dialog */}
        {orderToUpdate && (
          <StatusUpdateDialog
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
            currentStatus={orderToUpdate.status}
            orderId={orderToUpdate.id}
            onUpdate={handleStatusUpdate}
          />
        )}
      </OrdersLayout>
    </div >
  );
};

export default Orders;
