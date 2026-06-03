import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useDebounce } from "../../../hooks/useDebounce";
import { Product } from "../types/product";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  search: string;
  category: string;
  status: string;
  stock: string;
  sort: string;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
}

// //Context Type
interface ProductContextType {
  products: Product[];
  pagination: Pagination;
  filters: Filters;

  isLoading: boolean;
  isFetching: boolean;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: Partial<Filters>) => void;
  deleteProduct: (product: Product) => Promise<void>;
}

////  Context
const ProductContext = createContext<ProductContextType | null>(null);

////  API
const fetchProducts = async (
  page: number,
  limit: number,
  filters: Filters
): Promise<ProductsResponse> => {
  const res = await axios.get(
    `${import.meta.env.VITE_BACKEND_URL_PRODUCTION}/api/v1/product/getallproducts`,
    {
      params: {
        page,
        limit,
        search: filters.search || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        stock: filters.stock || undefined,
        sort: filters.sort || undefined,
      },
    }
  );

  return res.data;
};

//  Provider
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(10);

  const [filters, setFiltersState] = useState<Filters>({
    search: "",
    category: "",
    status: "active",
    stock: "",
    sort: "createdAt:desc",
  });

  /* 🔥 Debounced search */
  const debouncedSearch = useDebounce(filters.search, 300);

  const effectiveFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const queryKey = useMemo(
    () => ["products", page, limit, effectiveFilters.search,
      effectiveFilters.category,
      effectiveFilters.status,
      effectiveFilters.stock,
      effectiveFilters.sort,],
    [page, limit, effectiveFilters.search,
      effectiveFilters.category,
      effectiveFilters.status,
      effectiveFilters.stock,
      effectiveFilters.sort,]
  );

  const { data, isLoading, isFetching } = useQuery<ProductsResponse>({
    queryKey,
    queryFn: () => fetchProducts(page, limit, effectiveFilters),

    // React Query v5 replacement for keepPreviousData
    placeholderData: (prev) => prev,

    staleTime: 30_000,
  });

  // Actions
  const setPage = (value: number) => {
    setPageState(Math.max(1, Math.floor(value)));
  };

  const setLimit = (value: number) => {
    setLimitState(Math.min(Math.max(1, Math.floor(value)), 100));
    setPageState(1);
  };

  const setFilters = (newFilters: Partial<Filters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setPageState(1);
  };

  /* 🔥 Optimistic delete */
  const deleteProduct = async (product: Product) => {
    await queryClient.cancelQueries({ queryKey });

    const previousData = queryClient.getQueryData<ProductsResponse>(queryKey);

    queryClient.setQueryData<ProductsResponse>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.filter((p) => p._id !== product._id),
        pagination: {
          ...old.pagination,
          total: old.pagination.total - 1,
        },
      };
    });

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL_LOCAL}/api/v1/product/delete/${product._id}`
      );
      // 🔥 FORCE REFRESH FROM SERVER
      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      throw err;
    }
  };

  console.log("API DATA:", data);

  return (
    <ProductContext.Provider
      value={{
        products: data?.data ?? [],
        pagination: {
          page,
          limit,
          total: data?.pagination?.total ?? 0,
          totalPages: data?.pagination?.totalPages ?? 0,
        },
        filters,
        isLoading,
        isFetching,
        setPage,
        setLimit,
        setFilters,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
};