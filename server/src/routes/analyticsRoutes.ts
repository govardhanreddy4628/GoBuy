import { getTrendingSearches } from "../controllers/searchController.js";

import express from "express";
import {getAdminDashboardStats, getTopSellingProductsController, getProductConversionAnalyticsController, trackProductView, getProductFunnelAnalyticsController, getMonthlyRevenueController,
  getPaymentMethodsController,
  getHeatMapController,
  getPredictionController,
  getOrdersOverviewController,
  categoryBreakdownController,
  revenueOverviewController,
  customersOverviewController,
  } from "../controllers/analyticsController.js";

const analyticsRouter = express.Router();


analyticsRouter.get("/top-products", getTopSellingProductsController);
analyticsRouter.get("/dashboard-stats", getAdminDashboardStats);
analyticsRouter.post("/product-view/:productId", trackProductView);
analyticsRouter.get("/product-conversion", getProductConversionAnalyticsController);
analyticsRouter.get("/product-funnel", getProductFunnelAnalyticsController);

analyticsRouter.get("/monthly-revenue", getMonthlyRevenueController);
analyticsRouter.get("/payment-methods", getPaymentMethodsController);
analyticsRouter.get("/heatmap", getHeatMapController);
analyticsRouter.get("/prediction", getPredictionController);
analyticsRouter.get("/orders-overview", getOrdersOverviewController);
analyticsRouter.get("/revenue-overview", revenueOverviewController);
analyticsRouter.get("/customers-overview", customersOverviewController);
analyticsRouter.get("/category-breakdown", categoryBreakdownController);

export default analyticsRouter;