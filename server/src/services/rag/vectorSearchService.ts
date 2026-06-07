// type ProductResult = {
//   _id: string;
//   name: string;
//   brand: string;
//   finalPrice: number;
//   text: string;
//   images: string[];
//   score: number;
// };


// export const vectorSearchAggregationPipeline = async (ProductModel: any,queryVector: number[]): Promise<ProductResult[]>  => {
//   const products = await ProductModel.aggregate([
//     {
//       $vectorSearch: {
//         index: "product_vector_index",
//         path: "product_vector",
//         queryVector: queryVector,
//         numCandidates: 100,
//         limit: 5
//       }
//     },
//     {
//       $project: {
//         name: 1,
//         finalPrice: 1,
//         brand: 1,
//        // description: 1,
//         images: 1,
//         text: "$searchText",
//         score: { $meta: "vectorSearchScore" }
//       }
//     }
//   ]).allowDiskUse(true);

//   return products;
// };

// //In MongoDB this function searches the vector index to find the 5 products whose product_vector embeddings are most similar to the given queryVector, returns selected fields with their similarity score, and allows MongoDB to use disk if RAM is insufficient during aggregation.





// services/rag/vectorSearchService.ts

type VectorResult = {
  productId: string;
  text: string;
  score: number;
};

export const vectorSearchAggregationPipeline = async (
  ProductVectorModel: any,
  queryVector: number[]
): Promise<VectorResult[]> => {

  const results = await ProductVectorModel.aggregate([
    {
      $vectorSearch: {
        index: "product_vector_index", // make sure this exists
        path: "product_vector",
        queryVector: queryVector,
        numCandidates: 100,
        limit: 3
      }
    },
    {
      $project: {
        productId: 1,
        text: "$searchText",
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]);

  return results;
};