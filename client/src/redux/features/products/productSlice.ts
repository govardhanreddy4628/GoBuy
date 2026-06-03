// src/features/product/productSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";import { Product } from "./types";
import {fetchProducts, createProduct, updateProduct, deleteProduct} from "./productThunks";

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
interface ProductState {
  items: Product[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: Filters;
}

const initialState: ProductState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: "",
    category: "",
    status: "active",
    stock: "",
    sort: "createdAt:desc",
  },
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1;
    },
    setFilters: (state, action: PayloadAction<Partial<Filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 FETCH
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 CREATE
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // 🔹 UPDATE
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) state.items[index] = action.payload;
      })

      // 🔹 DELETE
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (p) => p._id !== action.payload && p.id !== action.payload
        );
      });
  },
});

export default productSlice.reducer;
