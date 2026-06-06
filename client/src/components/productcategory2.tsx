import { useEffect, useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
import { IoMenuSharp, IoGridSharp, IoExpand } from "react-icons/io5";
import { FaRegHeart, FaStar } from "react-icons/fa";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import { Button, IconButton, Typography } from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Pagination from "@mui/material/Pagination";

import { useCategories } from "./admin/context/categoryContext";
import ProductCard from "./productCard";
import { useCart } from "../context/cartContext";
import api from "../api/api_utility";
import { truncateWords } from "../helpers";
import ProductQuickViewModal from "./ProductQuickViewModal";
import { IoClose } from "react-icons/io5";


interface Product {
  _id: string;
  name: string;
  shortDescription: string;
  brand: string;
  finalPrice: number;
  listedPrice: number;
  discountPercentage: number;
  rating: number;
  images: any[];
}

const sortLabels: Record<string, string> = {
  "name-asc": "Name (A → Z)",
  "name-desc": "Name (Z → A)",
  "price:asc": "Price (Low → High)",
  "price:desc": "Price (High → Low)",
  "rating": "Rating (High → Low)",
};

const Productcategory = () => {
  const { categories, loading } = useCategories();
  const { cart, addToCart, updateQuantity, getCartKey, loadingCartItems } = useCart();

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("catId") || "";

  const [ratingRange, setRatingRange] = useState({ min: 0, max: 5 });
  const [brands, setBrands] = useState<string[]>([]);

  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [isCategoryScrollExpand, setIsCategoryScrollExpand] = useState(true);
  const [isGrid, setIsGrid] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [sortOption, setSortOption] = useState("");

  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  const [filters, setFilters] = useState({
    rating: [] as number[],
    category: "",
    brands: [] as string[],
    priceRange: [100, 150000] as [number, number],
  });

  // ✅ FIND CATEGORY PATH
  const findCategoryPath = (cats: any[], targetId: string, path: string[] = []): string[] | null => {
    for (const cat of cats) {
      const newPath = [...path, cat._id];

      if (cat._id === targetId) return newPath;

      if (cat.subcategories?.length) {
        const found = findCategoryPath(cat.subcategories, targetId, newPath);
        if (found) return found;
      }
    }
    return null;
  };


  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get(`/api/v1/product/brands?category=${categoryId}`);
        if (res.data.success) { setBrands(res.data.brands || []) }
      } catch (err) { console.error("Brand fetch failed", err) }
    };

    if (categoryId && categoryId !== "undefined") {
      fetchBrands();
    } else {
      setBrands([]); // reset
    }
  }, [categoryId]);


  useEffect(() => {
    const fetchRatingRange = async () => {
      const res = await api.get(`/api/v1/product/ratings-range?category=${categoryId}`);
      if (res.data.success) {
        setRatingRange({
          min: res.data.minRating,
          max: res.data.maxRating,
        });
      }
    };

    if (categoryId) fetchRatingRange();
  }, [categoryId]);


  // ✅ Sync URL & Expand Tree
  useEffect(() => {
    if (!categoryId) return;

    setFilters((prev) => ({ ...prev, category: categoryId }));

    if (categories.length > 0) {
      const path = findCategoryPath(categories, categoryId);

      if (path) {
        const expandState: { [key: string]: boolean } = {};
        path.forEach((id) => (expandState[id] = true));
        setExpanded(expandState);
      }
    }

  }, [categoryId, categories]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, sortOption]);

  // ✅ FETCH PRODUCTS (FIXED DOUBLE CALL ISSUE)
  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          category: filters.category || "",
          minPrice: filters.priceRange[0].toString(),
          maxPrice: filters.priceRange[1].toString(),
          sort: sortOption,
        });

        if (filters.rating.length > 0) {
          query.append("rating", filters.rating.join(","));
        }

        if (filters.brands.length > 0) {
          query.append("brands", filters.brands.join(","));
        }

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL_LOCAL}/api/v1/product?${query}`,
          { signal: controller.signal }
        );

        const data = await res.json();

        if (data.success) {
          setProducts(data.data || []);
          setTotalPages(data.pagination?.pages || 1);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, [filters, sortOption, page]);

  // CATEGORY CLICK
  const handleCategoryClick = (id: string) => {
    setFilters((prev) => ({ ...prev, category: id }));
    setSearchParams({ catId: id });
    setPage(1);
  };

  // TOGGLE CATEGORY EXPAND
  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // ✅ CATEGORY TREE UI
  const renderCategories = (cats: any[], level = 0) =>
    cats.map((cat) => (
      <div key={cat._id}>
        <div
          className="flex items-center justify-between cursor-pointer"
          style={{ paddingLeft: `${level * 10}px` }}
        >
          <span
            onClick={() => handleCategoryClick(cat._id)}
            className={`text-sm ${filters.category === cat._id
              ? "text-red-500 font-medium"
              : "hover:text-red-500"
              }`}
          >
            {cat.name}
          </span>

          {cat.subcategories?.length > 0 && (
            <IconButton onClick={() => toggleExpand(cat._id)} size="small">
              <FaAngleRight
                className={`transition-transform duration-200 ${expanded[cat._id] ? "rotate-90" : ""
                  }`}
              />
            </IconButton>
          )}
        </div>

        {expanded[cat._id] &&
          cat.subcategories?.length > 0 &&
          renderCategories(cat.subcategories, level + 1)}
      </div>
    ));

  function valuetext(value: number) {
    return `₹${value}`;
  }

  const minStar = Math.floor(ratingRange.min);
  const maxStar = Math.ceil(ratingRange.max);

  // ❌ remove 5★ option
  const effectiveMax = Math.min(maxStar, 4);

  const ratingOptions: number[] = [];

  for (let i = effectiveMax; i >= minStar; i--) {
    ratingOptions.push(i);
  }

  const handleClickOpen = (product) => {
    setOpenProduct(product);
  };

  const handleClose = () => {
    setOpenProduct(null);
  };

  const getCategoryNameById = (cats: any[], id: string): string | null => {
    for (const cat of cats) {
      if (cat._id === id) return cat.name;

      if (cat.subcategories?.length) {
        const found = getCategoryNameById(cat.subcategories, id);
        if (found) return found;
      }
    }
    return null;
  };
  const selectedCategoryName = getCategoryNameById(categories, filters.category);

  return (
    <section className="bg-white">
      <section className="flex w-[96%] mx-auto bg-white">

        {/* SIDEBAR */}
        <aside className="col1 lg:w-[18%] sm:w-[30%] w-full relative border-r px-3">

          {/* SELECTED FILTERS */}
          <div className="flex flex-wrap gap-2 px-3 pt-3">

            {/* Category */}
            {filters.category && (
              <div className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                {selectedCategoryName || "Category"}
                <span
                  className="cursor-pointer text-red-500"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, category: "" }))
                  }
                >
                  <IoClose />
                </span>
              </div>
            )}

            {/* Ratings */}
            {filters.rating.map((r) => (
              <div key={r} className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                {r}★ & above
                <span
                  className="cursor-pointer text-red-500"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      rating: prev.rating.filter((x) => x !== r),
                    }))
                  }
                >
                  <IoClose />
                </span>
              </div>
            ))}

            {/* Brands */}
            {filters.brands.map((b) => (
              <div key={b} className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2 text-sm capitalize">
                {b}
                <span
                  className="cursor-pointer text-red-500"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      brands: prev.brands.filter((x) => x !== b),
                    }))
                  }
                >
                  <IoClose />
                </span>
              </div>
            ))}

            {/* Price */}
            {(filters.priceRange[0] !== 100 || filters.priceRange[1] !== 150000) && (
              <div className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                <span
                  className="cursor-pointer text-red-500"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: [100, 150000],
                    }))
                  }
                >
                  <IoClose />
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-center p-3 w-full">
            <Button
              onClick={() =>
                setFilters({
                  rating: [],
                  category: "",
                  brands: [],
                  priceRange: [100, 150000],
                })
              }
            >
              Clear Filters
            </Button>
          </div>

          <div className="flex items-center justify-between bg-white pt-2 pb-1 border-t">
            <h3 className="text-[15px] font-semibold text-gray-800 mb-1">
              Filter By Category
            </h3>
            <IconButton onClick={() => setIsCategoryScrollExpand(!isCategoryScrollExpand)}>
              <FaAngleDown className={isCategoryScrollExpand ? "" : "rotate-180"} />
            </IconButton>
          </div>

          <div
            className="transition-all duration-700 overflow-y-scroll flex flex-col"
            style={{ maxHeight: isCategoryScrollExpand ? "200px" : "0px" }}
          >
            {loading ? <p>Loading...</p> : renderCategories(categories)}
          </div>

          {/* PRICE */}
          <div className="max-w-[260px] py-4 border-t pt-3">
            <h1 className="text-sm font-semibold text-gray-800 mb-2">Filter By Price</h1>
            <Slider
              getAriaLabel={() => 'Price range'}
              value={filters.priceRange}
              onChange={(_, value) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: value as [number, number],
                }))
              }
              valueLabelDisplay="auto"
              getAriaValueText={valuetext}
              size="medium"
              min={100}
              step={100}
              max={150000}
              className="!w-[90%] !ml-4"
            />

            <div className='flex items-center justify-between'>
              <p className='text-[rgba(0,0,0,0.5)]'>From:<span className='font-bold text-[rgba(0,0,0,0.8)]'>{filters.priceRange[0]}</span></p>
              <p className='text-[rgba(0,0,0,0.5)]'>To:<span className='font-bold text-[rgba(0,0,0,0.8)]'>{filters.priceRange[1]}</span></p>
            </div>
          </div>

          {/* RATING */}
          <div className="border-t pt-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Filter By Rating
            </h3>
            <div className="max-h-[200px] overflow-y-auto flex flex-col">
              {ratingOptions.map((star) => (
                <FormControlLabel
                  key={star}
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.rating.includes(star)}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          rating: prev.rating.includes(star)
                            ? prev.rating.filter((r) => r !== star)
                            : [star], // only one rating active
                        }))
                      }
                    />
                  }
                  label={
                    <span className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-500 font-medium">
                        {star}★
                      </span>
                      <span className="text-gray-500">& above</span>
                    </span>
                  }
                />
              ))}
            </div>
          </div>

          {/* BRANDS */}
          <div className="border-t pt-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Filter By Brand
            </h3>

            <div className="max-h-[200px] overflow-y-auto flex flex-col">
              {brands.map((brand) => (
                <FormControlLabel
                  key={brand}
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.brands.includes(brand)}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          brands: prev.brands.includes(brand)
                            ? prev.brands.filter((b) => b !== brand)
                            : [...prev.brands, brand],
                        }))
                      }
                    />
                  }
                  label={<span className="text-sm capitalize">{brand}</span>}
                />
              ))}
            </div>
          </div>

        </aside>

        {/* PRODUCTS */}
        <div className="col2 sm:w-[70%] lg:w-[82%] w-full px-4 py-2 flex flex-col">
          {/* TOP BAR */}
          <div className="flex items-center justify-between bg-[#f4f4f4] p-2 my-4">
            <div className="flex items-center gap-4">
              <IconButton onClick={() => setIsGrid(true)}>
                <IoGridSharp className={`${isGrid ? "text-red-500" : ""}`} />
              </IconButton>
              <IconButton onClick={() => setIsGrid(false)}>
                <IoMenuSharp className={`${isGrid ? "" : "text-red-500"}`} />
              </IconButton>
              <h2>Products ({totalPages > 1 ? totalPages * 10 : products.length})</h2>
            </div>

            <div className='flex items-center justify-end gap-4 mr-2 '>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body1">Sort By:</Typography>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    sx={{
                      backgroundColor: "white",
                      paddingX: 1,
                      border: "none",
                      height: 40, // <-- Stabilizes layout height
                      display: 'flex',
                      alignItems: 'center', // <-- Aligns text vertically
                      '& .MuiSelect-select': {
                        padding: '6px 8px',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent', // default border
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent', // remove blue on focus
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent', // remove hover border
                      },
                    }}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return "None";
                      }
                      return sortLabels[selected] || "None";
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="name-asc">Name, (A To Z)</MenuItem>
                    <MenuItem value="name-desc">Name, (Z To A)</MenuItem>
                    <MenuItem value="price:asc">Price, (Low → High)</MenuItem>
                    <MenuItem value="price:desc">Price, (High → Low)</MenuItem>
                    <MenuItem value="rating">Rating (High → Low)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </div>
          </div>

          {/* PRODUCTS GRID / LIST */}
          <div className={`grid gap-3 ${isGrid ? "xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-1" : "grid-cols-1"}`}>
            {products.length === 0 ? (
              <p className="text-center w-full">No products found</p>
            ) : (
              products.map((product) => {
                const key = getCartKey(product._id);
                const item = cart[key];

                return isGrid ? (
                  <ProductCard
                    key={product._id}
                    product={product}
                    item={item}
                    handleAdd={(p) => addToCart(p)}
                    handleIncrease={() => updateQuantity(key, "inc")}
                    handleDecrease={() => updateQuantity(key, "dec")}
                    handleClickOpen={handleClickOpen}
                    loadingCartItems={loadingCartItems}
                  />
                ) : (
                  <div className={`grid  gap-2`} >
                    <div className={`productcard bg-white border border-gray-200 shadow-md rounded-md flex items-center relative overflow-hidden h-auto`}>
                      <div className={`w-[300px] bg-white flex items-center justify-center border-1 border-gray-200 relative group md:h-[330px] h-[300px]`}>
                        <Link to={`/productdetails/${product._id}`} className={` relative overflow-hidden`}>
                          <img src={product.images?.[0]?.url || "/placeholder.png"} className=' opacity-100 hover:opacity-0 transition duration-500 ' />
                          <img src={product.images?.[1]?.url || product.images?.[0]?.url || "/placeholder.png"} className=' absolute top-[0px] left-[0px] opacity-0  group-hover:scale-105 group-hover:opacity-100 group-hover:z-50 transition duration-500' />
                        </Link>
                        <div className='bg-red-400 rounded-md absolute left-[10px] top-[10px] text-[14px] px-2 py-1 z-50'>{product.discountPercentage}%</div>
                        <div className="absolute right-[10px] -top-[100%] flex flex-col gap-[5px] p-1 transition-all z-50 duration-400 group-hover:top-[10px]">
                          <div onClick={() => handleClickOpen(product)} className='h-[35px] w-[35px] rounded-full bg-white  flex items-center justify-center hover:bg-red-500 hover:text-white transition-all'><IoExpand /></div>

                          <div
                            // onClick={() => toggleWishlist(product)}
                            className='h-[35px] w-[35px] rounded-full bg-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-all cursor-pointer'
                          >
                            <FaRegHeart />
                          </div>
                        </div>
                      </div>

                      <div className={`info flex flex-col  w-full p-3 items-start`}>
                        <h6 className='text-[18px] font-[200] uppercase mt-2'><Link to={`/productdetails/${product._id}`} className='link font-bold'>{product.name}</Link></h6>
                        <p className="text-[18px] font-[550] text-red-600 dark:text-gray-300 mt-1 "> {product.brand} </p>
                        <h3 className={`font-[500] text-gray-600 leading-[20px] mt-2 text-[rgba(0,0,0,0.9)] transition-all`}>{product.shortDescription}</h3>
                        <div className="flex flex-col items-start py-2">
                          <div className="flex items-center gap-4">
                            <p className="text-[20px] font-medium line-through text-gray-600 dark:text-gray-300">₹{product.listedPrice}</p>
                            <p className="text-[22px] font-bold text-red-400">₹{product.finalPrice}</p>
                          </div>

                          <div className="flex items-center gap-1 bg-red-400 text-white text-[18px] my-2 px-2 py-[2px] rounded-md">
                            <span>{product.rating || 4}</span>
                            <FaStar className="text-white text-[12px]" />
                          </div>
                        </div>
                        <Button
                          onClick={() => addToCart(product)}
                          className='flex !w-[180px] !border-[1.5px] !border-solid !border-red-400 !bg-inherit !text-red-400 gap-3 !my-2 hover:!text-white hover:!bg-black hover:!border-black'
                        >
                          <ShoppingCartCheckoutIcon /> ADD TO CART
                        </Button>
                      </div>
                    </div>
                  </div>




                  // <div
                  //   key={product._id}
                  //   className="flex bg-[#f4f4f4] rounded-md overflow-hidden"
                  // >
                  //   <div className="w-[35%]">
                  //     <ProductCard
                  //       product={product}
                  //       item={item}
                  //       handleAdd={handleAdd}
                  //       handleIncrease={handleIncrease}
                  //       handleDecrease={handleDecrease}
                  //       handleClickOpen={() => { }}
                  //     />
                  //   </div>

                  //   <div className="p-4 flex flex-col justify-center">
                  //     <h2 className="text-lg font-semibold">{product.name}</h2>
                  //     <p className="text-gray-600 mt-2">
                  //       {product.shortDescription}
                  //     </p>
                  //     <p className="text-red-500 font-bold mt-2">
                  //       ₹{product.finalPrice}
                  //     </p>
                  //   </div>
                  // </div>
                );
              })
            )}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center mt-6">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
            />
          </div>
        </div>
      </section>

      <ProductQuickViewModal
        open={!!openProduct}
        product={openProduct}
        onClose={handleClose}
      />
    </section>
  );
};

export default Productcategory;
