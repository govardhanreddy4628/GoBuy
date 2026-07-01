
// export const getAllProductByPriceController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void | any> => {
//   let productList = [];

//   if(req.query.catId != "" && req.query.catId !== undefined) {
//     const productListArr = await productModel.find({
//       catId: req.query.catId,
//     }).populate("category");

//     productList = productListArr;
//   }

//   if(req.query.subCategoryId !== "" && req.query.subCategoryId !== undefined) {
//     const productListArr = await productModel.find({
//       subCategoryId: req.query.subCategoryId,
//     }).populate("category");

//     productList = productListArr;
//   }

//   if(req.query.thirdSubCategoryId !== "" && req.query.thirdSubCategoryId !== undefined) {
//     const productListArr = await productModel.find({
//       thirdSubCategoryId: req.query.thirdSubCategoryId,
//     }).populate("category");

//     productList = productListArr;
//   }

//   const filteredProducts = productList.filter((product) => {
//     if(req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
//       return false;
//     }
//     if(req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
//       return false;
//     }
//     return true;
//   })
//   try {    
//     return res.status(200).json({
//       error:false,
//       success: true,
//       data: filteredProducts,
//       totalPages: 0,
//       page: 0,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ success: false, error: error.message });
//     } else {
//     res.status(500).json({ success: false, error: "Unknown error occurred" });
//     }
//     console.log(error);
//   }
// };




// export const getAllProductByCatNameController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void | any> => {
//   try {

//     const page = parseInt(req.query.page) || 1;
//     const perPage = parseInt(req.query.perPage) || 10000;
//     const totalPosts = await productModel.countDocuments();
//     const totalPages = Math.ceil(totalPosts / perPage);

//     if(page > totalPages) {
//       return res.status(404).json({
//         message:"page not found",
//         success: false,
//         error: true
//       })
//     }

//     const products = await productModel.find({catName:req.params.catName}) .populate("category")
//     .skip((page - 1) * perPage)
//     .limit(perPage)
//     .exec();

    
//     if (!products) {
//       return res.status(500).json({ success: false });
//     }
//     res.status(200).json({
//       error:false,
//       success: true,
//       data: products,
//       totalPages: totalPages,
//       page: page,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ success: false, error: error.message });
//     } else {
//     res.status(500).json({ success: false, error: "Unknown error occurred" });
//     }
//     console.log(error);
//   }
// };




// export const getAllProductBySubCatIdController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void | any> => {
//   try {

//     const page = parseInt(req.query.page) || 1;
//     const perPage = parseInt(req.query.perPage) || 10000;
//     const totalPosts = await productModel.countDocuments();
//     const totalPages = Math.ceil(totalPosts / perPage);

//     if(page > totalPages) {
//       return res.status(404).json({
//         message:"page not found",
//         success: false,
//         error: true
//       })
//     }

//     const products = await productModel.find({subCategoryId : req.params.subCategoryId}) .populate("category")
//     .skip((page - 1) * perPage)
//     .limit(perPage)
//     .exec();

    
//     if (!products) {
//       return res.status(500).json({ success: false });
//     }
//     res.status(200).json({
//       error:false,
//       success: true,
//       data: products,
//       totalPages: totalPages,
//       page: page,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ success: false, error: error.message });
//     } else {
//     res.status(500).json({ success: false, error: "Unknown error occurred" });
//     }
//     console.log(error);
//   }
// };



// export const getAllProductBySubCatNameController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void | any> => {
//   try {

//     const page = parseInt(req.query.page) || 1;
//     const perPage = parseInt(req.query.perPage) || 10000;
//     const totalPosts = await productModel.countDocuments();
//     const totalPages = Math.ceil(totalPosts / perPage);

//     if(page > totalPages) {
//       return res.status(404).json({
//         message:"page not found",
//         success: false,
//         error: true
//       })
//     }

//     const products = await productModel.find({subCatName:req.params.catName}) .populate("category")
//     .skip((page - 1) * perPage)
//     .limit(perPage)
//     .exec();

    
//     if (!products) {
//       return res.status(500).json({ success: false });
//     }
//     res.status(200).json({
//       error:false,
//       success: true,
//       data: products,
//       totalPages: totalPages,
//       page: page,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ success: false, error: error.message });
//     } else {
//     res.status(500).json({ success: false, error: "Unknown error occurred" });
//     }
//     console.log(error);
//   }
// };



// export const getAllProductByThirdSubCatIdController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void | any> => {
//   try {

//     const page = parseInt(req.query.page) || 1;
//     const perPage = parseInt(req.query.perPage) || 10000;
//     const totalPosts = await productModel.countDocuments();
//     const totalPages = Math.ceil(totalPosts / perPage);

//     if(page > totalPages) {
//       return res.status(404).json({
//         message:"page not found",
//         success: false,
//         error: true
//       })
//     }

//     const products = await productModel.find({thirdSubCategoryId:req.params.id}) .populate("category")
//     .skip((page - 1) * perPage)
//     .limit(perPage)
//     .exec();

    
//     if (!products) {
//       return res.status(500).json({ success: false });
//     }
//     res.status(200).json({
//       error:false,
//       success: true,
//       data: products,
//       totalPages: totalPages,
//       page: page,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ success: false, error: error.message });
//     } else {
//     res.status(500).json({ success: false, error: "Unknown error occurred" });
//     }
//     console.log(error);
//   }
// };



// export const getAllProductByThirdSubCatNameController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void | any> => {
//   try {

//     const page = parseInt(req.query.page) || 1;
//     const perPage = parseInt(req.query.perPage) || 10000;
//     const totalPosts = await productModel.countDocuments();
//     const totalPages = Math.ceil(totalPosts / perPage);

//     if(page > totalPages) {
//       return res.status(404).json({
//         message:"page not found",
//         success: false,
//         error: true
//       })
//     }

//     const products = await productModel.find({thirdSubCategoryName:req.params.catName}) .populate("category")
//     .skip((page - 1) * perPage)
//     .limit(perPage)
//     .exec();

    
//     if (!products) {
//       return res.status(500).json({ success: false });
//     }
//     res.status(200).json({
//       error:false,
//       success: true,
//       data: products,
//       totalPages: totalPages,
//       page: page,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ success: false, error: error.message });
//     } else {
//     res.status(500).json({ success: false, error: "Unknown error occurred" });
//     }
//     console.log(error);
//   }
// };




// export const deleteProductController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void | any> => {
//   try {
//     const { id } = req.params;
//     const products = await productModel.findById({ id }).populate("category");

//     if (!products) {
//       return res.status(500).json({ success: false });
//     }

//     const images = products.images;

//     let img = "";
//     for (img of images) {
//       const imgUrl = img;
//       const urlArr = imgUrl.split("/");
//       const images = urlArr[urlArr.length - 1];

//       const imageName = images.split(".")[0];

//       if (imageName) {
//         cloudinary.uploader.destroy(imageName, (error, result) => {
//           //console.log(error, result)
//         });
//       }
//     }

//     const deletedProduct = await productModel.findByIdAndDelete(req.params.id);

//     if (!deletedProduct) {
//       res.status(404).json({
//         message: "Product not deleted!",
//         success: false,
//         error: true,
//       });
//     }

//     res.status(200).json({
//       error: false,
//       success: true,
//       products: products,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ success: false, error: error.message });
//     } else {
//       res.status(500).json({ success: false, error: "Unknown error occurred" });
//     }
//     console.log(error);
//   }
// };








// export async function productFiltersController(req:Request, res:Response){
//   const {catId, subCatId, thirdSubCatId,minPrice, maxPrice, rating, page, limit} = req.body;
//   const filters = {}

//   if(catId?.length){
//     filters.catId = {$in: catId}
//   }
//   if(subCatId?.length){
//     filters.catId = {$in: subCatId}
//   }
//   if(thirdSubCatId?.length){
//     filters.catId = {$in: thirdSubCatId}
//   }

//   if(minPrice || maxPrice){
//     filters.price = {$gte: +minPrice || 0, $lte: +maxPrice || Infinity};
//   }

//   if(rating?.length){
//     filters.rating = {$in: rating}
//   }

//   try{
//     const products = await ProductModel.find(filters).populate("category".skip(page - 1) * limit).limit(parseInt(limit));
//     const total = await ProductModel.countDocuments(filters);
//     return res.status(200).json({
//       error:false,
//       success:true,
//       products:products,
//       total:total,
//       page:parseInt(page),
//       totalPages:Match.ceil(total / limit)
//     })
//   } catch(){
//     return  res.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     })
//   }

// }

// export const getProductsByCategoryController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { categorySlug } = req.params;

//     // 1️⃣ Find base category
//     const category = await CategoryModel.findOne({
//       slug: categorySlug,
//       isActive: true,
//     }).select("_id");

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     const categoryId = category._id;

//     // 2️⃣ Find all descendant categories
//     const descendantCategories = await CategoryModel.find({
//       path: categoryId, // Mongo automatically treats this as $in for arrays
//       isActive: true,
//     }).select("_id");

//     // 3️⃣ Build categoryId list
//     const categoryIds = [
//       categoryId,
//       ...descendantCategories.map((cat) => cat._id),
//     ];

//     // 4️⃣ Fetch products
//     const products = await productModel.find({
//       category: { $in: categoryIds },
//       isActive: true,
//     })
//       .populate("category", "name slug")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       count: products.length,
//       data: products,
//     });
//   } catch (error) {
//     console.error("getProductsByCategory error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };



// export const getAllProductByPriceController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   try {
//     const {
//       catId,
//       subCategoryId,
//       thirdSubCategoryId,
//       minPrice,
//       maxPrice,
//       page = "1",
//       limit = "20",
//     } = req.query;

//     const parsedPage = Math.max(parseInt(page as string), 1);
//     const parsedLimit = Math.min(parseInt(limit as string), 100);
//     const skip = (parsedPage - 1) * parsedLimit;

//     // 🧠 Build dynamic query
//     const filter: Record<string, any> = {};

//     if (catId) filter.catId = catId;
//     if (subCategoryId) filter.subCategoryId = subCategoryId;
//     if (thirdSubCategoryId) filter.thirdSubCategoryId = thirdSubCategoryId;

//     if (minPrice || maxPrice) {
//       filter.price = {};
//       if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
//       if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
//     }

//     // ⚡ Query database
//     const [products, total] = await Promise.all([
//       productModel
//         .find(filter)
//         .populate("category")
//         .skip(skip)
//         .limit(parsedLimit)
//         .lean(),
//       productModel.countDocuments(filter),
//     ]);

//     const totalPages = Math.ceil(total / parsedLimit);

//     res.status(200).json({
//       success: true,
//       error: false,
//       data: products,
//       pagination: {
//         totalItems: total,
//         totalPages,
//         currentPage: parsedPage,
//         perPage: parsedLimit,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching products by price:", error);
//     res.status(500).json({
//       success: false,
//       error: true,
//       message: error instanceof Error ? error.message : "Internal server error",
//     });
//   }
// };



// // ok
// export const getAllProductBySubCatIdController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void | Response> => {
//   try {
//     const { page, perPage } = getPaginationParams(req);
//     const { subCategoryId } = req.params;

//     if (!subCategoryId) {
//       return sendErrorResponse(res, 400, "Missing subCategoryId");
//     }

//     const filter = { subCategoryId };
//     const totalProducts = await productModel.countDocuments(filter);
//     const totalPages = Math.ceil(totalProducts / perPage);

//     if (page > totalPages && totalPages > 0) {
//       return sendErrorResponse(res, 404, "Page not found");
//     }

//     const products = await productModel
//       .find(filter)
//       .populate("category")
//       .skip((page - 1) * perPage)
//       .limit(perPage);

//     res.status(200).json({
//       success: true,
//       error: false,
//       data: products,
//       pagination: {
//         totalProducts,
//         totalPages,
//         currentPage: page,
//         perPage,
//       },
//     });
//   } catch (error) {
//     console.error("Error in getAllProductBySubCatIdController:", error);
//     const message =
//       error instanceof Error ? error.message : "Unknown server error";
//     sendErrorResponse(res, 500, message);
//   }
// };

// //ok
// export const getAllProductBySubCatNameController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void | Response> => {
//   try {
//     const { page, perPage } = getPaginationParams(req);
//     const { catName } = req.params;

//     if (!catName) {
//       return sendErrorResponse(res, 400, "Missing catName");
//     }

//     const filter = { subCatName: catName };
//     const totalProducts = await productModel.countDocuments(filter);
//     const totalPages = Math.ceil(totalProducts / perPage);

//     if (page > totalPages && totalPages > 0) {
//       return sendErrorResponse(res, 404, "Page not found");
//     }

//     const products = await productModel
//       .find(filter)
//       .populate("category")
//       .skip((page - 1) * perPage)
//       .limit(perPage);

//     res.status(200).json({
//       success: true,
//       error: false,
//       data: products,
//       pagination: {
//         totalProducts,
//         totalPages,
//         currentPage: page,
//         perPage,
//       },
//     });
//   } catch (error) {
//     console.error("Error in getAllProductBySubCatNameController:", error);
//     const message =
//       error instanceof Error ? error.message : "Unknown server error";
//     sendErrorResponse(res, 500, message);
//   }
// };

// //ok
// export const getAllProductByThirdSubCatIdController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void | Response> => {
//   try {
//     const { page, perPage } = getPaginationParams(req);
//     const { id } = req.params;

//     if (!id) {
//       return sendErrorResponse(res, 400, "Missing thirdSubCategoryId");
//     }

//     const filter = { thirdSubCategoryId: id };
//     const totalProducts = await productModel.countDocuments(filter);
//     const totalPages = Math.ceil(totalProducts / perPage);

//     if (page > totalPages && totalPages > 0) {
//       return sendErrorResponse(res, 404, "Page not found");
//     }

//     const products = await productModel
//       .find(filter)
//       .populate("category")
//       .skip((page - 1) * perPage)
//       .limit(perPage);

//     res.status(200).json({
//       success: true,
//       error: false,
//       data: products,
//       pagination: {
//         totalProducts,
//         totalPages,
//         currentPage: page,
//         perPage,
//       },
//     });
//   } catch (error) {
//     console.error("Error in getAllProductByThirdSubCatIdController:", error);
//     const message =
//       error instanceof Error ? error.message : "Unknown server error";
//     sendErrorResponse(res, 500, message);
//   }
// };

// //ok
// export const getAllProductByThirdSubCatNameController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void | Response> => {
//   try {
//     const { catName } = req.params;
//     if (!catName || typeof catName !== "string") {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: "Category name (catName) is required in params",
//       });
//     }

//     const page = Math.max(parseInt(req.query.page as string) || 1, 1);
//     const perPage = Math.min(parseInt(req.query.perPage as string) || 20, 100); // limit to max 100 per page

//     const filter = { thirdSubCategoryName: catName };

//     const [totalPosts, products] = await Promise.all([
//       productModel.countDocuments(filter),
//       productModel
//         .find(filter)
//         .populate("category")
//         .skip((page - 1) * perPage)
//         .limit(perPage)
//         .lean(),
//     ]);

//     const totalPages = Math.ceil(totalPosts / perPage);

//     if (page > totalPages && totalPosts > 0) {
//       return res.status(404).json({
//         success: false,
//         error: true,
//         message: "Page not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       error: false,
//       data: products,
//       pagination: {
//         totalItems: totalPosts,
//         totalPages,
//         currentPage: page,
//         perPage,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching products by thirdSubCategoryName:", error);
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: error instanceof Error ? error.message : "Internal server error",
//     });
//   }
// };
