import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Package, AlertTriangle, XCircle, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../ui/select";
import { Input } from "../../../../ui/input";
import { ProductsTable } from "./ProductTable";
import { EmptyState } from "./EmptyState";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { Button } from "../../../../ui/button";
import { ViewProductDialog } from "./ViewProductDialog";
import { Product, mockProducts } from "./ProductsData";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../../ui/dropdown-menu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from "../../../../ui/breadcrumb";
import { Skeleton } from "../../../../ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../../../ui/pagination";
//import { toast } from "sonner";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    name: true,
    category: true,
    price: true,
    stock: true,
    status: true,
    created: true,
  });

  //const dispatch = useDispatch<AppDispatch>();


  // const dispatch = useDispatch<AppDispatch>();
  // const { items, loading, error } = useSelector(
  //   (state: RootState) => state.products
  // );

  // useEffect(() => {
  //   dispatch(fetchProducts());
  // }, [dispatch]);



  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );

  const stockStats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => p.stock > 10).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;

      let matchesStock = true;
      if (stockFilter === "in-stock") {
        matchesStock = product.stock > 10;
      } else if (stockFilter === "low-stock") {
        matchesStock = product.stock > 0 && product.stock <= 10;
      } else if (stockFilter === "out-of-stock") {
        matchesStock = product.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, statusFilter, stockFilter]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const hasActiveFilters = searchQuery !== "" || categoryFilter !== "all" || statusFilter !== "all" || stockFilter !== "all";

  const handleView = useCallback((product: Product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    navigate(`/products/edit/${product.id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!productToDelete) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      //dispatch(deleteProduct(productToDelete.id))
      //toast.success(`"${productToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      setIsLoading(false);
    }, 500);
  }, [productToDelete]);

  const handleAddNew = useCallback(() => {
    navigate("/products/create");
  }, [navigate]);


// ✅ Early return for loading
  if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      );
    }

  // Optional early return for error
  if (error) {
    return <h1 className="text-red-500">{error}</h1>;
  }


  return (
    <div className="space-y-6 py-4 px-4">
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuCheckboxItem
                checked={visibleColumns.image}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, image: checked }))
                }
              >
                Image
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.name}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, name: checked }))
                }
              >
                Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.category}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, category: checked }))
                }
              >
                Category
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.price}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, price: checked }))
                }
              >
                Price
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.stock}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, stock: checked }))
                }
              >
                Stock
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.status}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, status: checked }))
                }
              >
                Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.created}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, created: checked }))
                }
              >
                Created
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stockStats.inStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stockStats.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stockStats.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search products"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState onAddProduct={handleAddNew} hasFilters={hasActiveFilters} />
      ) : (
        <>
          <ProductsTable
            products={paginatedProducts}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(id) => {
              const product = products.find((p) => p.id === id);
              if (product) handleDeleteClick(product);
            }}
            visibleColumns={visibleColumns}
          />
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

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

export default Products;
