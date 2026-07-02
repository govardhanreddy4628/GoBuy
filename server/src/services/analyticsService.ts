import { startOfMonth, subDays } from "date-fns";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import productModel from "../models/productModel.js";
import UserModel from "../models/userModel.js";

/* ---------------- TOTAL REVENUE ---------------- */
export const getTotalRevenue = async () => {
  const result = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  return result[0]?.total || 0;
};

/* ---------------- PAYMENT METHOD DISTRIBUTION ---------------- */
export const getPaymentMethodDistribution = async () => {
  return Payment.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: "$order" },

    {
      $match: {
        "order.paymentStatus": { $in: ["paid", "cod_pending", "cod_paid"] },
      },
    },

    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        revenue: { $sum: "$amount" },
      },
    },
  ]);
};

/* ---------------- SALES ANALYTICS (DAILY) ---------------- */

export const getSalesAnalytics = async () => {
  return Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalSales: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);
};

/* ---------------- MONTHLY REVENUE HISTORY ---------------- */

export const getMonthlyRevenueHistory = async () => {
  return Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
};

/* ---------------- HEATMAP (DAY OF WEEK) ---------------- */

export const getHeatMap = async () => {
  return Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        totalOrders: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

/* ---------------- SIMPLE REVENUE PREDICTION ---------------- */

export const getRevenuePrediction = async () => {
  const last30Days = subDays(new Date(), 30);

  const result = await Order.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        createdAt: { $gte: last30Days },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  const total = result[0]?.total || 0;
  const dailyAvg = total / 30;
  const nextMonthPrediction = dailyAvg * 30;

  return Math.round(nextMonthPrediction);
};

/* ---------------- PRODUCT SALES ---------------- */

export const getProductSalesAnalytics = async () => {
  return Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        totalQuantitySold: { $sum: "$items.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);
};

/* ---------------- CUSTOMER LIFETIME VALUE ---------------- */

export const getCustomerLifetimeValue = async () => {
  return Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$userId",
        totalSpent: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        firstPurchase: { $min: "$createdAt" },
        lastPurchase: { $max: "$createdAt" },
      },
    },
    { $sort: { totalSpent: -1 } },
  ]);
};

/* ---------------- TOP SELLING PRODUCTS ---------------- */
export const getTopSellingProducts = async (range?: string) => {
  const now = new Date();
  let startDate: Date | null = null;

  if (range === "7days") startDate = subDays(now, 7);
  if (range === "30days") startDate = subDays(now, 30);
  if (range === "month") startDate = startOfMonth(now);

  const matchStage: any = {
    paymentStatus: "paid",
  };

  if (startDate) matchStage.createdAt = { $gte: startDate };

  return Order.aggregate([
    { $match: matchStage },

    { $unwind: "$items" },

    {
      $group: {
        _id: "$items.productId",
        totalSales: { $sum: "$items.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$items.quantity", "$items.price"] },
        },
      },
    },

    { $sort: { totalSales: -1 } },
    { $limit: 5 },

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },

    {
      $project: {
        _id: 0,
        name: "$productDetails.name",
        image: { $arrayElemAt: ["$productDetails.images.url", 0] },
        sales: "$totalSales",
        revenue: "$totalRevenue",
      },
    },
  ]);
};

// Instead of first image, you should return the cover image:
// Modify $project like this:

// image: {
//   $let: {
//     vars: {
//       cover: {
//         $filter: {
//           input: "$productDetails.images",
//           as: "img",
//           cond: { $eq: ["$$img.role", "cover"] }
//         }
//       }
//     },
//     in: { $arrayElemAt: ["$$cover.url", 0] }
//   }
// }

/* ---------------- COHORT RETENTION ---------------- */

export const getCohortRetentionAnalytics = async () => {
  return Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$userId",
        firstPurchase: { $min: "$createdAt" },
        purchases: { $push: "$createdAt" },
      },
    },
    {
      $project: {
        cohortMonth: { $month: "$firstPurchase" },
        cohortYear: { $year: "$firstPurchase" },
        totalPurchases: { $size: "$purchases" },
      },
    },
    {
      $group: {
        _id: { month: "$cohortMonth", year: "$cohortYear" },
        users: { $sum: 1 },
        repeatCustomers: {
          $sum: {
            $cond: [{ $gt: ["$totalPurchases", 1] }, 1, 0],
          },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
};

/* ---------------- AI FORECAST (LINEAR REGRESSION) ---------------- */

export const getAIRevenueForecast = async () => {
  const dailyRevenue = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: {
          day: { $dayOfYear: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.day": 1 } },
  ]);

  const values = dailyRevenue.map((d, index) => ({
    x: index,
    y: d.revenue,
  }));

  const n = values.length;

  if (n < 2) return 0; // prevent divide by zero

  const sumX = values.reduce((a, b) => a + b.x, 0);
  const sumY = values.reduce((a, b) => a + b.y, 0);
  const sumXY = values.reduce((a, b) => a + b.x * b.y, 0);
  const sumX2 = values.reduce((a, b) => a + b.x * b.x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return 0;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const nextMonthPrediction = slope * (n + 30) + intercept;

  return Math.max(0, Math.round(nextMonthPrediction));
};

/* ---------------- REVENUE STATS ---------------- */

export const getRevenueStats = async () => {
  return Order.aggregate([
    { $match: { paymentStatus: "paid" } }, // FIXED
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

/* ---------------- DAILY REVENUE HISTORY ---------------- */

export const getDailyRevenueHistory = async (range?: string) => {
  const now = new Date();
  let startDate: Date | null = null;

  if (range === "7days") startDate = subDays(now, 7);
  if (range === "30days") startDate = subDays(now, 30);

  const matchStage: any = {
    paymentStatus: "paid",
  };

  if (startDate) {
    matchStage.createdAt = { $gte: startDate };
  }

  return Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// export const getDashboardStats = async (range?: string) => {
//   const now = new Date();
//   let startDate: Date | null = null;

//   if (range === "7days") startDate = subDays(now, 7);
//   if (range === "30days") startDate = subDays(now, 30);

//   const matchStage: any = {
//     paymentStatus: "paid",
//   };

//   if (startDate) matchStage.createdAt = { $gte: startDate };

//   const result = await Order.aggregate([
//     { $match: matchStage },

//     {
//       $group: {
//         _id: null,
//         totalRevenue: { $sum: "$totalAmount" },
//         totalOrders: { $sum: 1 },
//         totalItemsSold: { $sum: { $sum: "$items.quantity" } },
//         customers: { $addToSet: "$userId" },
//       },
//     },

//     {
//       $project: {
//         _id: 0,
//         totalRevenue: 1,
//         totalOrders: 1,
//         totalItemsSold: 1,
//         totalCustomers: { $size: "$customers" },
//       },
//     },
//   ]);

//   return (
//     result[0] || {
//       totalRevenue: 0,
//       totalOrders: 0,
//       totalItemsSold: 0,
//       totalCustomers: 0,
//     }
//   );
// };







export const getDashboardStats = async (range?: string) => {

  const now = new Date();
  let startDate: Date | null = null;

  switch (range) {

    case "day":
      startDate = new Date();
      startDate.setHours(0,0,0,0);
      break;

    case "week":
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      break;

    case "month":
      startDate = new Date();
      startDate.setDate(now.getDate() - 30);
      break;

    case "year":
      startDate = new Date();
      startDate.setFullYear(now.getFullYear() - 1);
      break;

    case "all":
    default:
      startDate = null;
  }

  const matchStage: any = {
    paymentStatus: "paid"
  };

  if (startDate) {
    matchStage.createdAt = { $gte: startDate };
  }

  const result = await Order.aggregate([

    { $match: matchStage },

    {
      $group: {
        _id: null,

        totalRevenue: { $sum: "$totalAmount" },

        totalOrders: { $sum: 1 },

        totalItemsSold: {
          $sum: {
            $sum: "$items.quantity"
          }
        },

        uniqueCustomers: { $addToSet: "$userId" }
      }
    },

    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalOrders: 1,
        totalItemsSold: 1,
        totalCustomers: { $size: "$uniqueCustomers" }
      }
    }

  ]);

  return result[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    totalItemsSold: 0,
    totalCustomers: 0
  };
};





export const getProductConversionAnalytics = async () => {
  return productModel.aggregate([
    {
      $project: {
        name: 1,
        images: 1,
        views: 1,
        cartAdds: 1,
        orderedCount: 1,

        cartConversionRate: {
          $cond: [
            { $eq: ["$views", 0] },
            0,
            {
              $multiply: [{ $divide: ["$cartAdds", "$views"] }, 100],
            },
          ],
        },

        purchaseConversionRate: {
          $cond: [
            { $eq: ["$views", 0] },
            0,
            {
              $multiply: [{ $divide: ["$orderedCount", "$views"] }, 100],
            },
          ],
        },
      },
    },

    { $sort: { purchaseConversionRate: -1 } },
  ]);
};

export const getProductFunnelAnalytics = async () => {
  const result = await productModel.aggregate([
    {
      $group: {
        _id: null,
        views: { $sum: "$views" },
        cartAdds: { $sum: "$cartAdds" },
        orders: { $sum: "$orderedCount" },
      },
    },
  ]);

  return (
    result[0] || {
      views: 0,
      cartAdds: 0,
      orders: 0,
    }
  );
};

export const getOrdersOverview = async (range: string = "Week") => {
  const now = new Date();

  let startDate = new Date();
  let groupStage: any;

  switch (range) {
    case "Day":
      startDate.setHours(0, 0, 0, 0);
      groupStage = { $hour: "$createdAt" };
      break;

    case "Week":
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      groupStage = { $dayOfWeek: "$createdAt" };
      break;

    case "Month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      groupStage = { $isoWeek: "$createdAt" };
      break;

    case "Year":
      startDate = new Date(now.getFullYear(), 0, 1);
      groupStage = { $month: "$createdAt" };
      break;

    default:
      startDate.setDate(now.getDate() - 6);
      groupStage = { $dayOfWeek: "$createdAt" };
  }

  const raw = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        paymentStatus: { $in: ["paid", "cod_paid"] },
      },
    },
    {
      $group: {
        _id: groupStage,
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatted = raw.map((item: any) => {
    let label: any = item._id;

    if (range === "Year") label = months[item._id - 1];

    if (range === "Week") label = days[item._id - 1];

    if (range === "Day") label = `${item._id}:00`;

    if (range === "Month") {
      const week = item._id - raw[0]._id + 1;
      label = `Week${week}`;
    }

    return {
      label,
      orders: item.orders,
    };
  });

  return formatted;
};

export const getRevenueOverview = async (range: string = "Week") => {
  const now = new Date();
  let startDate = new Date();
  let groupStage: any;

  switch (range) {
    case "Day":
      startDate.setHours(0, 0, 0, 0);
      groupStage = { $hour: "$createdAt" };
      break;

    case "Week":
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      groupStage = { $dayOfWeek: "$createdAt" };
      break;

    case "Month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      groupStage = { $week: "$createdAt" };
      break;

    case "Year":
      startDate = new Date(now.getFullYear(), 0, 1);
      groupStage = { $month: "$createdAt" };
      break;
  }

  const raw = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        paymentStatus: { $in: ["paid", "cod_paid"] },
      },
    },

    {
      $group: {
        _id: groupStage,
        revenue: { $sum: "$totalAmount" },
      },
    },

    { $sort: { _id: 1 } },
  ]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatted = raw.map((item: any) => {
    let label: any = item._id;

    if (range === "Year") label = months[item._id - 1];

    if (range === "Week") label = days[item._id - 1];

    if (range === "Day") label = `${item._id}:00`;

    if (range === "Month") {
      const week = item._id - raw[0]._id + 1;
      label = `Week${week}`;
    }

    return {
      label,
      revenue: item.revenue,
    };
  });

  return formatted;
};

// export const getCustomersOverview = async (range: string = "Month") => {

//   const now = new Date();
//   let startDate = new Date();
//   let groupStage: any;

//   switch (range) {

//     case "Day":
//       startDate.setHours(0, 0, 0, 0);
//       groupStage = { $hour: "$createdAt" };
//       break;

//     case "Week":
//       startDate.setDate(now.getDate() - 6);
//       startDate.setHours(0, 0, 0, 0);
//       groupStage = { $dayOfWeek: "$createdAt" };
//       break;

//     case "Month":
//       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//       groupStage = { $week: "$createdAt" };
//       break;

//     // case "Year":
//     //   startDate = new Date(now.getFullYear(), 0, 1);
//     //   groupStage = { $month: "$createdAt" };
//     //   break;

//      case "Year":

//       const firstUser = await UserModel.findOne()
//         .sort({ createdAt: 1 })
//         .select("createdAt");

//       if (firstUser) {
//         startDate = new Date(firstUser.createdAt);
//         startDate = new Date(startDate.getFullYear(), 0, 1);
//       }

//       groupStage = {
//         year: { $year: "$createdAt" },
//         month: { $month: "$createdAt" }
//       };

//       break;
//   }

//   /* ---------------- USERS ---------------- */
//   const usersAgg = await UserModel.aggregate([

//     {
//       $match: {
//         createdAt: { $gte: startDate },
//         role: "USER"
//       }
//     },

//     {
//       $group: {
//         _id: groupStage,
//         users: { $sum: 1 },
//       }
//     },

//   ]);

//    /* ---------------- CUSTOMERS (ORDERS) ---------------- */

//   const customersAgg = await Order.aggregate([

//     {
//       $match: {
//         createdAt: { $gte: startDate }
//       }
//     },

//     {
//       $group: {
//         _id: groupStage,
//         customers: { $addToSet: "$userId" }
//       }
//     },

//     {
//       $project: {
//         customers: { $size: "$customers" }
//       }
//     }

//   ]);

//    /* ---------------- MERGE RESULTS ---------------- */

//   const map = new Map();

//   usersAgg.forEach((u:any)=>{
//     map.set(JSON.stringify(u._id), {
//       _id:u._id,
//       users:u.users,
//       customers:0
//     });
//   });

//   customersAgg.forEach((c:any)=>{
//     const key = JSON.stringify(c._id);

//     if(map.has(key)){
//       map.get(key).customers = c.customers;
//     } else {
//       map.set(key,{
//         _id:c._id,
//         users:0,
//         customers:c.customers
//       });
//     }
//   });

//   const merged = Array.from(map.values());

//   /* ---------------- SORT ---------------- */

//   merged.sort((a:any,b:any)=>{

//     if(range==="Year"){
//       if(a._id.year === b._id.year){
//         return a._id.month - b._id.month
//       }
//       return a._id.year - b._id.year
//     }

//     return a._id - b._id
//   })

//   /* ---------------- LABELS ---------------- */

//   const months = [
//     "Jan","Feb","Mar","Apr","May","Jun",
//     "Jul","Aug","Sep","Oct","Nov","Dec"
//   ];

//   const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

//   const formatted = merged.map((item: any) => {

//     let label: any = item._id;

//     if (range === "Year") label = `${months[item._id.month - 1]} ${item._id.year}`;

//     if (range === "Week") label = days[item._id - 1];

//     if (range === "Day") label = `${item._id}:00`;

//     if (range === "Month") {
//       label = `Week${item._id}`;
//     }

//     return {
//       label,
//       users: item.users,
//       customers: item.customers
//     };

//   });

//   return formatted;

// };

export const getCustomersOverview = async (range: string = "Week") => {
  const now = new Date();
  let startDate = new Date();
  let groupStage: any;

  switch (range) {

  case "Day":
    startDate.setHours(0,0,0,0)
    groupStage = { $hour: "$createdAt" }
    break

  case "Week":
    startDate.setDate(now.getDate() - 6)
    startDate.setHours(0,0,0,0)
    groupStage = { $dayOfWeek: "$createdAt" }
    break

  case "Month":
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)

    groupStage = {
      $ceil: {
        $divide: [{ $dayOfMonth: "$createdAt" }, 7]
      }
    }

    break

  case "Year":
    startDate = new Date(now.getFullYear(), 0, 1)
    groupStage = { $month: "$createdAt" }
    break
}


  /* ---------------- USERS ---------------- */
  const usersRaw = await UserModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        role: "USER",
      },
    },
    {
      $group: {
        _id: groupStage,
        count: { $sum: 1 },
      },
    },
  ]);

  /* ---------------- CUSTOMERS (FROM ORDERS) ---------------- */
  const customersRaw = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        //paymentStatus: "paid"
      },
    },
    {
      $group: {
        _id: groupStage,
        count: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        count: { $size: "$count" },
      },
    },
  ]);

  /* ---------------- LABEL ARRAYS ---------------- */
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let labels: any[] = [];

  if (range === "Year") labels = months;

  if (range === "Week") labels = days;

  if (range === "Day") labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  if (range === "Month") labels = ["Week1", "Week2", "Week3", "Week4", "Week5"];

  /* ---------------- FORMAT RESPONSE ---------------- */

  const result = labels.map((label, index) => {
    const key = range === "Day" ? index : index + 1;

    const user = usersRaw.find((u: any) => u._id === key);
    const customer = customersRaw.find((c: any) => c._id === key);

    return {
      label,
      users: user?.count || 0,
      customers: customer?.count || 0,
    };
  });

  return result;
};

export const getCategoryBreakdown = async () => {
  const result = await Order.aggregate([
    { $unwind: "$items" },

    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },

    { $unwind: "$product" },

    {
      $lookup: {
        from: "categories",
        localField: "product.category",
        foreignField: "_id",
        as: "category",
      },
    },

    { $unwind: "$category" },

    {
      $group: {
        _id: "$category._id",
        name: { $first: "$category.name" },
        image: { $first: "$category.image" },

        itemsSold: { $sum: "$items.quantity" },
      },
    },

    { $sort: { itemsSold: -1 } },

    { $limit: 10 },
  ]);

  const totalItems = result.reduce((sum, c) => sum + c.itemsSold, 0);

  const formatted = result.map((c) => ({
    name: c.name,
    image: c.image,
    count: c.itemsSold,
    percentage: totalItems ? Math.round((c.itemsSold / totalItems) * 100) : 0,
  }));

  return formatted;
};
