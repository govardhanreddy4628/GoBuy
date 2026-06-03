import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../ui/collapsible";
import { Button } from '../../../ui/button';
import { Checkbox } from "../../../ui/checkbox";
import { Eye, Edit, ChevronDown, Package } from "lucide-react";
import { useState } from "react";
import { Order } from "./OrderDetailsDialog";

interface Props {
    orders: Order[];
    loading: boolean;
    selectedOrders: string[];
    onSelectOrder: (id: string, checked: boolean) => void;
    onView: (order: Order) => void;
    onEdit: (order: Order) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
}

const OrdersTable = ({ orders, loading, selectedOrders, onSelectOrder, onView, onEdit, currentPage, totalPages, onPageChange, totalItems }: Props) => {
    const paginatedOrders = orders;
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    const toggleOrderExpansion = (orderId: string) => {
        setExpandedOrders((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            orders.forEach((o) => onSelectOrder(o.id, true));
        } else {
            orders.forEach((o) => onSelectOrder(o.id, false));
        }
    };

    return (
        <div className="bg-card rounded-lg border shadow-sm animate-fade-in">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={
                                    paginatedOrders.length > 0 &&
                                    selectedOrders.length === paginatedOrders.length
                                }
                                onCheckedChange={handleSelectAll}
                            />
                        </TableHead>
                        <TableHead className="font-semibold">Order ID</TableHead>
                        <TableHead className="font-semibold">Customer</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">Total</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                {loading ? (
                    <div className="p-6 space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                        ))}
                    </div>
                ) : (
                    <TableBody>
                        {paginatedOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No orders found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedOrders.map((order, index) => (
                                <Collapsible
                                    key={order.id}
                                    open={expandedOrders.has(order.id)}
                                    onOpenChange={() => toggleOrderExpansion(order.id)}
                                    asChild
                                >
                                    <>
                                        <TableRow
                                            className="hover:bg-muted/50 transition-colors animate-fade-in"
                                            style={{ animationDelay: `${index * 30}ms` }}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedOrders.includes(order.id)}
                                                    onCheckedChange={(checked) =>
                                                        onSelectOrder(order.id, checked === true)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <CollapsibleTrigger asChild>
                                                    <div className="flex items-center gap-2 cursor-pointer group">
                                                        <ChevronDown
                                                            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${expandedOrders.has(order.id) ? "rotate-180" : ""
                                                                }`}
                                                        />
                                                        <span>{order.id}</span>
                                                    </div>
                                                </CollapsibleTrigger>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-foreground">{order.customerName}</p>
                                                    <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(order.date).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <OrderStatusBadge status={order.status} />
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                ₹{order.total.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onView(order)}
                                                        className="hover:bg-accent/10 hover:text-accent"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEdit(order)}
                                                        className="hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-0">
                                            <TableCell colSpan={7} className="p-0 border-0">
                                                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                                                    <div className="bg-gradient-to-br from-muted/40 to-muted/20 px-6 py-5 border-t">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                                <Package className="h-4 w-4" />
                                                                Order Items Details
                                                            </h4>
                                                            <span className="text-xs text-muted-foreground">
                                                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                            </span>
                                                        </div>
                                                        <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                                        <TableHead className="w-12 font-semibold"></TableHead>
                                                                        <TableHead className="font-semibold">Product Details</TableHead>
                                                                        <TableHead className="font-semibold">Category</TableHead>
                                                                        <TableHead className="font-semibold">SKU</TableHead>
                                                                        <TableHead className="text-center font-semibold">Stock</TableHead>
                                                                        <TableHead className="text-right font-semibold">Unit Price</TableHead>
                                                                        <TableHead className="text-center font-semibold">Qty</TableHead>
                                                                        <TableHead className="text-right font-semibold">Discount</TableHead>
                                                                        <TableHead className="text-right font-semibold">Subtotal</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {order.items.map((item, idx) => {
                                                                        const originalPrice = item.price * item.quantity;
                                                                        const discountAmount = (originalPrice * item.discount) / 100;
                                                                        const finalPrice = originalPrice - discountAmount;

                                                                        return (
                                                                            <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                                                                                <TableCell>
                                                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-md flex items-center justify-center border border-primary/20">
                                                                                        <Package className="h-5 w-5 text-primary" />
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <p className="font-semibold text-foreground">{item.name}</p>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                                                        {item.category}
                                                                                    </span>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <p className="text-sm font-mono text-muted-foreground">{item.sku}</p>
                                                                                </TableCell>
                                                                                <TableCell className="text-center">
                                                                                    {item.inStock ? (
                                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                                                                                            In Stock
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20">
                                                                                            Low Stock
                                                                                        </span>
                                                                                    )}
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    <p className="font-medium text-foreground">${item.price.toFixed(2)}</p>
                                                                                </TableCell>
                                                                                <TableCell className="text-center">
                                                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-muted font-semibold text-foreground">
                                                                                        {item.quantity}
                                                                                    </span>
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    {item.discount > 0 ? (
                                                                                        <div className="flex flex-col items-end">
                                                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/20">
                                                                                                -{item.discount}%
                                                                                            </span>
                                                                                            <span className="text-xs text-muted-foreground mt-1">
                                                                                                -${discountAmount.toFixed(2)}
                                                                                            </span>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <span className="text-sm text-muted-foreground">—</span>
                                                                                    )}
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    <div className="flex flex-col items-end">
                                                                                        {item.discount > 0 && (
                                                                                            <span className="text-xs text-muted-foreground line-through">
                                                                                                ${originalPrice.toFixed(2)}
                                                                                            </span>
                                                                                        )}
                                                                                        <span className="font-bold text-foreground">
                                                                                            ${finalPrice.toFixed(2)}
                                                                                        </span>
                                                                                    </div>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                        {/* Order Summary */}
                                                        <div className="mt-4 flex justify-end">
                                                            <div className="bg-background rounded-lg border shadow-sm px-4 py-3 min-w-[280px]">
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">Items Total:</span>
                                                                        <span className="font-medium">${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">Total Discount:</span>
                                                                        <span className="font-medium text-green-600">
                                                                            -${order.items.reduce((sum, item) => sum + ((item.price * item.quantity * item.discount) / 100), 0).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="border-t pt-2 flex justify-between">
                                                                        <span className="font-semibold text-foreground">Order Total:</span>
                                                                        <span className="font-bold text-lg text-foreground">₹{order.total.toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CollapsibleContent>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                </Collapsible>
                            ))
                        )}
                    </TableBody>)}
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                    {/* <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
                {filteredOrders.length} orders
              </div> */}
                    <p>
                        Showing page {currentPage} of {totalPages} (
                        {totalItems} orders)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onPageChange(pageNum)}
                                        className="w-9"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrdersTable
