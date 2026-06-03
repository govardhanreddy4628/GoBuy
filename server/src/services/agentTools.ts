const toolMap = {
  getDashboardStats: async (params) =>
    GET(`/api/analytics/dashboard?range=${params.range}`),

  getTopSellingProducts: async (params) =>
    GET(`/api/analytics/top-products?range=${params.range}`),

  getRevenueOverview: async (params) =>
    GET(`/api/analytics/revenue-overview?range=${params.range}`),

  getOrdersOverview: async (params) =>
    GET(`/api/analytics/orders-overview?range=${params.range}`),

  getPrediction: async () =>
    GET(`/api/analytics/prediction`)
};

export async function executeTool(name, params) {
  if (!toolMap[name]) throw new Error("Unknown tool");

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 10000)
  );

  return Promise.race([toolMap[name](params), timeout]);
}