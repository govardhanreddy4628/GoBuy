export const vectorSearch = async (ProductModel: any,queryVector: number[]) => {

  const products = await ProductModel.aggregate([
    {
      $vectorSearch: {
        index: "product_vector_index",
        path: "product_vector",
        queryVector: queryVector,
        numCandidates: 100,
        limit: 5
      }
    },
    {
      $project: {
        name: 1,
        price: 1,
        brand: 1,
       // description: 1,
        images: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]).allowDiskUse(true);

  return products;
};

//In MongoDB this function searches the vector index to find the 5 products whose product_vector embeddings are most similar to the given queryVector, returns selected fields with their similarity score, and allows MongoDB to use disk if RAM is insufficient during aggregation.
