import { Button } from "../../../../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../ui/table";
import { Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "../../../../ui/badge";
import { Product } from "../../types/product";
import { getCloudinaryImage } from "../../../../utils/imgTransformation";


interface ProductsTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  visibleColumns: {
    image: boolean;
    name: boolean;
    category: boolean;
    finalPrice: boolean;
    stock: boolean;
    status: boolean;
    created: boolean;
  };
}

export function ProductsTable2({
  products,
  onView,
  onEdit,
  onDelete,
  visibleColumns,
}: ProductsTableProps) {
  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "discontinued":
        return <Badge variant="destructive">Discontinued</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
    }
  };

  const getStockBadge = (qty: number) => {
    if (qty === 0)
      return (
        <Badge className="bg-destructive text-destructive-foreground">
          Out of Stock
        </Badge>
      );
    if (qty <= 10)
      return (
        <Badge className="bg-warning text-warning-foreground">
          Low Stock
        </Badge>
      );
    return (
      <Badge className="bg-success text-success-foreground">
        In Stock
      </Badge>
    );
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.image && <TableHead className="w-[80px]">Image</TableHead>}
            {visibleColumns.name && <TableHead>Name</TableHead>}
            {visibleColumns.category && <TableHead>Category</TableHead>}
            {visibleColumns.finalPrice && <TableHead>Price</TableHead>}
            {visibleColumns.stock && <TableHead>Stock</TableHead>}
            {visibleColumns.status && <TableHead>Status</TableHead>}
            {visibleColumns.created && <TableHead>Created</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => {
            const img = product.images?.[0]?.url
              ? getCloudinaryImage(product.images[0].url, {
                  width: 80,
                  height: 80,
                })
              : "/placeholder.png";
          return (
            <TableRow key={product._id}>
              {visibleColumns.image && (
                <TableCell>
                  <img
                    src={img}
                    alt={product.name}
                    loading="lazy"   // 🔥 IMPORTANT
                    className="h-12 w-12 rounded-md object-cover"
                  />
                </TableCell>
              )}

              {visibleColumns.name && (
                <TableCell>
                  <div
                    className="font-medium max-w-[260px] truncate"
                    title={product.name} // 👈 hover shows full name
                  >
                    {product.name}
                  </div>

                  <div className="text-sm text-muted-foreground truncate max-w-[260px]">
                    {product.shortDescription}
                  </div>
                </TableCell>
              )}


              {visibleColumns.category && (
                <TableCell>{product.category?.name ?? "-"}</TableCell>
              )}

              {visibleColumns.finalPrice && (
                <TableCell className="font-semibold">
                  ₹{(product.finalPrice ?? 0).toFixed(2)}
                </TableCell>
              )}

              {visibleColumns.stock && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{product.quantityInStock}</span>
                    {getStockBadge(product.quantityInStock)}
                  </div>
                </TableCell>
              )}

              {visibleColumns.status && (
                <TableCell>{getStatusBadge(product.status)}</TableCell>
              )}

              {visibleColumns.created && (
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(product.createdAt).toLocaleDateString()}
                </TableCell>
              )}

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => onView(product)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDelete(product)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </div>
  );
}
