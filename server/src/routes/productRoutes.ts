import express from "express";
import {
  addRecentlyViewed,
  //checkoutController,
  createProduct,
  createProductController,
  deleteProductController,
  //filters,
  getAllProductController,
  getBestDiscountProducts,
  getBrandsByCategory,
  getFeaturedProducts,
  getProducts,
  getProductsByCategoryId,
  getProductsByCategorySlug,
  getProductsByIds,
  getRatingRange,
  getRecentlyViewedProducts,
  getSingleProductByIdController,
  getTopRatedProducts,
  smartSuggest,
  //productFiltersController,
  updateProductController,
  //updateProductController,
} from "../controllers/productController.js";
import { authenticate } from "../middleware/authenticate.js";

import { uploadMultiple } from "../middleware/multer.js";
import { askProductQuestion } from "../services/rag/productAssistant.js";

const productRouter = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

//productRouter.post('/uploadImages', auth, upload.array('images'), uploadImages);
productRouter.post("/create", createProductController);
productRouter.put("/update/:id", asyncHandler(updateProductController));

// Frontend direct upload path (client sends product JSON with images array)
productRouter.post("/createproduct", createProduct);

// Backend upload path (multipart form -> multer -> createProduct)
//productRouter.post("/createproduct-server", uploadMultiple, asyncHandler(createProduct));

productRouter.get("/getallproducts", asyncHandler(getAllProductController));
//productRouter.get("/getAllproductsByCatId/:id", getAllProductsByCatIdController);
//productRouter.get("/getAllproductsByCatName", getAllProductsByCatIdController);

productRouter.get("/getproductdetails/:id", asyncHandler(getSingleProductByIdController));
// router.put("/updateproduct", updateProductController)
productRouter.delete("/delete/:id", asyncHandler(deleteProductController));
//productRouter.post("/checkout", asyncHandler(checkoutController));

//productRouter.post('/filters', productFiltersController);

productRouter.get("/category/:slug", asyncHandler(getProductsByCategorySlug));
productRouter.get("/category/id/:id", asyncHandler(getProductsByCategoryId));

//productRouter.post('/filters', filters)

productRouter.get("/top-rated", asyncHandler(getTopRatedProducts));
productRouter.get("/products-with-best-discounts", asyncHandler(getBestDiscountProducts));
productRouter.get("/featured", asyncHandler(getFeaturedProducts));

productRouter.get("/ratings-range", asyncHandler(getRatingRange));
productRouter.get("/brands", asyncHandler(getBrandsByCategory));
productRouter.get("/", asyncHandler(getProducts));

productRouter.get("/suggest", asyncHandler(smartSuggest));

productRouter.post("/recently-viewed/:productId", authenticate(), asyncHandler(addRecentlyViewed));

productRouter.get("/recently-viewed", authenticate(), asyncHandler(getRecentlyViewedProducts));

productRouter.get("/by-ids", authenticate(), asyncHandler(getProductsByIds));

productRouter.post("/ask", asyncHandler(askProductQuestion));


export default productRouter;
