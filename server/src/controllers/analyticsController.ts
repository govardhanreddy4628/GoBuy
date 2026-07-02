import { Request, Response } from "express";
import {
  getDashboardStats,
  getProductFunnelAnalytics,
  getTopSellingProducts,
  getPaymentMethodDistribution,
  getHeatMap,
  getAIRevenueForecast,
  getMonthlyRevenueHistory,
  getRevenuePrediction,
  getProductConversionAnalytics,
  getOrdersOverview,
  getCategoryBreakdown,
  getRevenueOverview,
  getCustomersOverview,
} from "../services/analyticsService.js";
import productModel from "../models/productModel.js";

export const getTopSellingProductsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { range } = req.query;

    const data = await getTopSellingProducts(range as string);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Top products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top products",
    });
  }
};

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;

    const stats = await getDashboardStats(range as string);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};


export const trackProductView = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    await productModel.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "View counted",
    });
  } catch (error) {
    console.error("Track view error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to track view",
    });
  }
};



export const getProductConversionAnalyticsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await getProductConversionAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Conversion analytics error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch analytics" });
  }
};

export const getProductFunnelAnalyticsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await getProductFunnelAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Funnel analytics error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch funnel analytics" });
  }
};

/* ---------------- MONTHLY REVENUE ---------------- */

export const getMonthlyRevenueController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await getMonthlyRevenueHistory();

    const formatted = data.map((item: any) => ({
      month: `${item._id.month}/${item._id.year}`,
      revenue: item.revenue,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Monthly revenue error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly revenue",
    });
  }
};

/* ---------------- PAYMENT METHODS ---------------- */

export const getPaymentMethodsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await getPaymentMethodDistribution();

    const formatted = data.map((item: any) => ({
      name: item._id,
      value: item.count,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Payment analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch payment analytics",
    });
  }
};

/* ---------------- SALES HEATMAP ---------------- */

export const getHeatMapController = async (req: Request, res: Response) => {
  try {
    const data = await getHeatMap();

    const formatted = Object.fromEntries(
      (data || []).map((d: any) => [d._id, d.orders]),
    );

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Heatmap error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch heatmap",
    });
  }
};

/* ---------------- AI PREDICTION ---------------- */

export const getPredictionController = async (req: Request, res: Response) => {
  try {
    const prediction = await getAIRevenueForecast();

    const data = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      predictedRevenue: prediction / 30,
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error("Prediction error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch prediction",
    });
  }
};

export const getOrdersOverviewController = async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as string) || "Week";
    const data = await getOrdersOverview(range);
    res.json({success: true,data});
  } catch (err) {
    console.error(err);
    res.status(500).json({success: false, message: "Orders overview failed"});
  }
};


export const revenueOverviewController = async (req:Request, res:Response) => {
  const range = typeof req.query.range === "string" ? req.query.range : "Month";
  const data = await getRevenueOverview(range);
  res.json({success: true, data});
};

export const customersOverviewController = async (req:Request, res:Response) => {
  const range = typeof req.query.range === "string" ? req.query.range : "Month";
  const data = await getCustomersOverview(range);
  res.json({success: true, data});
};

export const categoryBreakdownController = async (req: Request, res: Response) => {
  try {
    const data = await getCategoryBreakdown();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category breakdown",
    });
  }
};
