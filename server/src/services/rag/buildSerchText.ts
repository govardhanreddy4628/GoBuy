export const buildSearchText = (product: any): string => {
  // Concatenate all details into one text string
  return `
Product Name:${product.name}
Product Short Description:${product.shortDescription}
Product Description:${product.description}
Product Category: ${product.categoryName}
Brand: ${product.brand}
Color: ${product.productColor}
Price: ${product.finalPrice}
`.trim();
};