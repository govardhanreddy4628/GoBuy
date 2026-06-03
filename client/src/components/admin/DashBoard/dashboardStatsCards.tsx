// import { useEffect, useState } from "react";
// import { Wallet2, BarChart3, TrendingUp, Users } from "lucide-react";
// import StatsCard from '../../../ui/statusCard';
// import { GET } from "../../../api/api_utility";


// // types/dashboard.ts
// export interface DashboardStats {
//   totalRevenue: number;
//   totalOrders: number;
//   totalItemsSold: number;
//   totalCustomers: number;
// }

// const DashboardStatsCards = () => {
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [range, setRange] = useState("30days");

//   const fetchDashboardStats = async (range = "30days") => {
//   return GET(`/api/v1/analytics/dashboard-stats?range=${range}`);
// };

//   const loadStats = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchDashboardStats(range);
//       setStats(res.data.data);
//     } catch (error) {
//       console.error("Failed to load dashboard stats", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadStats();
//   }, [range]);

//   if (loading) {
//     return (
//       <div className="p-6 text-center text-gray-500">
//         Loading dashboard stats...
//       </div>
//     );
//   }

//   if (!stats) return null;

//   return (
//     <div className="col-span-1 p-2 lg:pr-0 animate-fade-in">
      
//       {/* 🔹 Range Selector */}
//       <div className="flex justify-end mb-3">
//         <select
//           value={range}
//           onChange={(e) => setRange(e.target.value)}
//           className="border px-3 py-2 rounded-md text-sm"
//         >
//           <option value="7days">Last 7 Days</option>
//           <option value="30days">Last 30 Days</option>
//         </select>
//       </div>

//       <div
//         className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up h-full"
//         style={{ "--delay": "100ms" } as React.CSSProperties}
//       >
//         <StatsCard
//           title="Total Sales"
//           value={stats.totalItemsSold.toLocaleString()}
//           icon={<Wallet2 />}
//           className="bg-primary/5 bg-gradient-to-br from-blue-500/50 to-pink-300/50 rounded-lg shadow hover:opacity-80 transition-opacity duration-300"
//         />

//         <StatsCard
//           title="Orders"
//           value={stats.totalOrders.toLocaleString()}
//           icon={<BarChart3 />}
//           className="bg-primary/5 bg-gradient-to-br from-violet-500/50 to-green-300/50 rounded-lg shadow hover:opacity-80 transition-opacity duration-300"
//         />

//         <StatsCard
//           title="Revenue"
//           value={`₹${stats.totalRevenue.toLocaleString()}`}
//           icon={<TrendingUp />}
//           className="bg-success/5 bg-gradient-to-br from-green-500/50 to-blue-300/80 rounded-lg shadow hover:opacity-80 transition-opacity duration-300"
//         />

//         <StatsCard
//           title="Customers"
//           value={stats.totalCustomers.toLocaleString()}
//           icon={<Users />}
//           className="bg-danger/5 bg-gradient-to-br from-red-500/50 to-slate-600/50 rounded-lg shadow hover:opacity-80 transition-opacity duration-300"
//         />
//       </div>
//     </div>
//   );
// };

// export default DashboardStatsCards;




import { useEffect, useState } from "react";
import { Wallet2, BarChart3, TrendingUp, Users } from "lucide-react";
import StatsCard from "../../../ui/statusCard";
import { GET } from "../../../api/api_utility";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  totalCustomers: number;
}

const DashboardStatsCards = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");

  const fetchDashboardStats = async (range: string) => {
    return GET(`/api/v1/analytics/dashboard-stats?range=${range}`);
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardStats(range);
      setStats(res.data.data);
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [range]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading dashboard stats...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="col-span-1 p-2 lg:pr-0 animate-fade-in">

      {/* Range selector */}
      <div className="flex justify-end mb-3">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="day">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last 12 Months</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <StatsCard
          title="Items Sold"
          value={stats.totalItemsSold.toLocaleString()}
          icon={<Wallet2 />}
          className="bg-gradient-to-br from-blue-500/50 to-pink-300/50 rounded-lg shadow"
        />

        <StatsCard
          title="Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={<BarChart3 />}
          className="bg-gradient-to-br from-violet-500/50 to-green-300/50 rounded-lg shadow"
        />

        <StatsCard
          title="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<TrendingUp />}
          className="bg-gradient-to-br from-green-500/50 to-blue-300/80 rounded-lg shadow"
        />

        <StatsCard
          title="Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={<Users />}
          className="bg-gradient-to-br from-red-500/50 to-slate-600/50 rounded-lg shadow"
        />
      </div>
    </div>
  );
};

export default DashboardStatsCards;
