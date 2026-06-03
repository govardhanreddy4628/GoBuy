import { Download, RefreshCw } from "lucide-react";
import { Order } from "./OrderDetailsDialog";
import { toast } from "../../../hooks/use-toast";
import { Button } from '../../../ui/button';


interface OrderActionsProps {
  orders: Order[];
  selectedOrders: string[];
  onRefresh: () => void;
}

export const OrderActions = ({ orders, selectedOrders, onRefresh }: OrderActionsProps) => {
  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer", "Email", "Date", "Status", "Total"];
    const csvData = orders.map((order) => [
      order.id,
      order.customerName,
      order.customerEmail,
      order.date,
      order.status,
      order.total.toFixed(2),
    ]);

    const csv = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Export Successful",
      description: `Exported ${orders.length} orders to CSV`,
    });
  };

  const handleBulkExport = () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No orders selected",
        description: "Please select orders to export",
        variant: "destructive",
      });
      return;
    }

    const selectedOrdersData = orders.filter((o) => selectedOrders.includes(o.id));
    const headers = ["Order ID", "Customer", "Email", "Date", "Status", "Total"];
    const csvData = selectedOrdersData.map((order) => [
      order.id,
      order.customerName,
      order.customerEmail,
      order.date,
      order.status,
      order.total.toFixed(2),
    ]);

    const csv = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Export Successful",
      description: `Exported ${selectedOrders.length} selected orders`,
    });
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        className="hover:bg-accent/10 hover:text-accent transition-colors"
      >
        <Download className="h-4 w-4 mr-2" />
        Export All
      </Button>
      {selectedOrders.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkExport}
          className="hover:bg-accent/10 hover:text-accent transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Selected ({selectedOrders.length})
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="hover:bg-primary/10 hover:text-primary transition-colors"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};
