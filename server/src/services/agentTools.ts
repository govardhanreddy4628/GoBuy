import {
  getDashboardStats,
  getTopSellingProducts,
  getRevenueOverview,
  getOrdersOverview,
  getRevenuePrediction,
} from "../services/analyticsService.js";

type ToolParams = {
  range?: string;
};

type ToolName =
  | "getDashboardStats"
  | "getTopSellingProducts"
  | "getRevenueOverview"
  | "getOrdersOverview"
  | "getPrediction";

// ✅ Clean tool map (direct service calls)
const toolMap: Record<
  ToolName,
  (params?: ToolParams) => Promise<any>
> = {
  getDashboardStats: async (params) =>
    getDashboardStats(params?.range ?? "week"),

  getTopSellingProducts: async (params) =>
    getTopSellingProducts(params?.range ?? "7days"),

  getRevenueOverview: async (params) =>
    getRevenueOverview(params?.range ?? "Week"),

  getOrdersOverview: async (params) =>
    getOrdersOverview(params?.range ?? "Week"),

  getPrediction: async () => getRevenuePrediction(),
};

// ✅ Executor with timeout
export async function executeTool(
  name: ToolName,
  params?: ToolParams
): Promise<any> {
  const tool = toolMap[name];

  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 10000)
  );

  return Promise.race([tool(params), timeout]);
}