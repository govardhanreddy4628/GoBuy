import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Package, AlertTriangle, XCircle, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../ui/select";
import { Input } from "../../../../ui/input";
import { ProductsTable2 } from "./ProductTable2";
import { EmptyState } from "./EmptyState";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { Button } from "../../../../ui/button";
import { ViewProductDialog } from "./ViewProductDialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../../ui/dropdown-menu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from "../../../../ui/breadcrumb";
import { Skeleton } from "../../../../ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../../../ui/pagination";
import { ProductProvider, useProducts } from "../../context/productsContext";
import { Product } from "../../types/product";
//import { toast } from "sonner";


interface ProductsPageContentProps {
  showBreadcrumb?: boolean;
  showStats?: boolean;
}
/* ------------------------- INNER PAGE ------------------------------ */
const ProductsPageContent = ({ showBreadcrumb = true, showStats = true }: ProductsPageContentProps) => {
  const navigate = useNavigate();
  const { products, pagination, filters, isLoading, isFetching, setPage, setFilters, deleteProduct } = useProducts();
  // const [statusFilter, setStatusFilter] = useState("all");
  // const [stockFilter, setStockFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    name: true,
    category: true,
    finalPrice: true,
    stock: true,
    status: true,
    created: true,
  });

  /* -------------------- Derived stats -------------------- */
  const stockStats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => p.quantityInStock > 10).length;
    const lowStock = products.filter(
      p => p.quantityInStock > 0 && p.quantityInStock <= 10
    ).length;
    const outOfStock = products.filter(p => p.quantityInStock === 0).length;

    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  /* -------------------- Handlers -------------------- */
  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handleEdit = useCallback(
    (product: Product) => {
      navigate(`/products/edit/${product._id}`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    await deleteProduct(productToDelete);

    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleAddNew = () => navigate("/products/create");

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, pagination.page - 2);
    let end = Math.min(pagination.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  /* -------------------- Loading / Error -------------------- */
  if (isLoading) {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-md" />
      ))}
    </div>
  );
}

  // if (error) {
  //   return <p className="text-destructive">{error}</p>;
  // }

  /* -------------------- Render -------------------- */
  return (
    <div className="space-y-6 py-4 px-4">
      {/* Breadcrumb */}
      {showBreadcrumb && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and details
          </p>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(visibleColumns).map(([key, value]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={value}
                  onCheckedChange={(checked) =>
                    setVisibleColumns(prev => ({ ...prev, [key]: Boolean(checked), }))
                  }
                >
                  {key}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Products" value={stockStats.total} icon={Package} color="text-muted-foreground" />
          <StatCard title="In Stock" value={stockStats.inStock} icon={Package} color="text-success" />
          <StatCard title="Low Stock" value={stockStats.lowStock} icon={AlertTriangle} color="text-warning" />
          <StatCard title="Out of Stock" value={stockStats.outOfStock} icon={XCircle} color="text-destructive" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>

        {/* Category */}
        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            setFilters({ category: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="mobiles">Mobiles</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            setFilters({ status: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="discontinued">Discontinued</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Stock */}
        <Select
          value={filters.stock || "all"}
          onValueChange={(value) =>
            setFilters({ stock: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in">In Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isFetching ? (
        <Skeleton className="h-64 w-full" />
      ) : products.length === 0 ? (
        <EmptyState onAddProduct={handleAddNew} hasFilters />
      ) : (
        <>
          <ProductsTable2
            products={products}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            visibleColumns={visibleColumns}
          />

          {pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => pagination.page > 1 && setPage(pagination.page - 1)}
                />

                {getPages().map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={pagination.page === pageNum}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationNext
                  onClick={() =>
                    pagination.page < pagination.totalPages && setPage(pagination.page + 1)
                  }
                />
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Dialogs */}
      <ViewProductDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        product={selectedProduct}
      />

      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        productName={productToDelete?.name || ""}
      />
    </div>
  );
};

/* ------------------------- PROVIDER WRAPPER ------------------------ */

const Products = () => (
  <ProductProvider>
    <ProductsPageContent />
  </ProductProvider>
);

export default Products;

/* ------------------------- HELPERS ------------------------ */

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color || "text-muted-foreground"}`} />
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </CardContent>
  </Card>
);