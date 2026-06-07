import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { InventoryExample } from '../inventory.ts/InventoryExample';
import { useTheme } from '../../../context/themeContext';
import { Button } from '@mui/material';
import { FaPlus } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";
import MuiCollapsibleTable from '../muiTable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useRef, useState, useEffect } from "react";
import { TopProducts } from '../TopProducts';
import { io } from "socket.io-client";
import { MonthlyRevenueChart } from './MonthlyRevenueChart';
import { PaymentPieChart } from './PaymentPieChart';
import { SalesHeatmap } from './SalesHeatMap';
import { PredictionChart } from './PredictionChart';
import DashboardStatsCards from './dashboardStatsCards';
import ProductFunnelChart from './productFunnelChart';
import ProductConversionAnalytics from './productConversionAnalytics';
import { GET } from '../../../api/api_utility';
import { OrdersChart } from './OrdersChart';
import CategoryBreakdownCard from './categoryBreakDownCard';
import Products2 from '../products/AllProducts/Products';
//import RevenueChart from './RevenueChart';
import { CustomersChart } from './CustomersChart';
import { RevenueChart } from './RevenueChart2';
import Orders from '../orders/Orders';
import { Socket } from "socket.io-client";
import { ProductProvider } from '../context/productsContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// types/dashboard.ts
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  totalCustomers: number;
}

// 🔹 Common chart point
export interface ChartPoint {
  label: string;
}

// 🔹 Orders
export interface OrdersData extends ChartPoint {
  orders: number;
}

// 🔹 Revenue
export interface RevenueData extends ChartPoint {
  revenue: number;
}

// 🔹 Customers
export interface CustomersData extends ChartPoint {
  customers: number;
}

// 🔹 Monthly Revenue (used in moving average)
export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

// 🔹 Payment methods
export interface PaymentMethod {
  method: string;
  count: number;
}

// 🔹 Heatmap
export interface HeatmapItem {
  _id: number; // hour (0–23)
  orders: number;
}

// 🔹 Prediction
export interface PredictionData {
  label: string;
  predicted: number;
}

export interface MonthlyRevenueWithAvg extends MonthlyRevenue {
  avg: number;
}

const breadcrumbMap = [
  { path: '/', breadcrumb: 'Home' },
  { path: '/dashboard', breadcrumb: 'Dashboard' },
  { path: '/dashboard/projects', breadcrumb: 'Projects' },
  { path: '/dashboard/projects/:projectId', breadcrumb: 'Project' },
];


const movingAverage = (
  data: MonthlyRevenue[],
  window = 3
): MonthlyRevenueWithAvg[] => {
  return data.map((item, index, arr) => {
    const slice = arr.slice(Math.max(0, index - window + 1), index + 1);

    const avg =
      slice.reduce((sum, d) => sum + d.revenue, 0) / slice.length;

    return { ...item, avg };
  });
};

export function Dashboard() {
  const [paymentData, setPaymentData] = useState<PaymentMethod[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapItem[]>([]);

  const [ordersChart, setOrdersChart] = useState<OrdersData[]>([]);
  const [customersData, setCustomersData] = useState<CustomersData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  //   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  //   const toggleSidebar = () => {
  //     setIsSidebarCollapsed(prev => !prev);
  //   };

  const crumbs = useBreadcrumbs(breadcrumbMap);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // const cardBg = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  // const mainBg = isDark ? 'bg-gray-900' : 'bg-gray-100';
  // const textColor = isDark ? 'text-gray-100' : 'text-gray-800';

  const [timeRange, setTimeRange] = useState('Month');

  // Mock data for different ranges
  // const chartDataByRange = {
  //   Day: {
  //     labels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'],
  //     data: [5, 8, 15, 20, 18, 12, 6, 4]
  //   },
  //   Week: {
  //     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  //     data: [70, 80, 60, 90, 100, 65, 75]
  //   },
  //   Month: {
  //     labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  //     data: [240, 260, 220, 300]
  //   },
  //   Year: {
  //     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  //     data: [1200, 1500, 1400, 1700, 1650, 1800, 2100, 2300]
  //   }
  // };

  // const currentChart = chartDataByRange[timeRange];

  const generateXAxis = () => {

    if (timeRange === "Year") {
      return [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
    }

    if (timeRange === "Month") {
      return ["Week1", "Week2", "Week3", "Week4", "Week5"];
    }

    if (timeRange === "Week") {
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    }

    if (timeRange === "Day") {
      return Array.from({ length: 24 }, (_, i) => `${i}:00`);
    }

    return [];
  };

  const normalizeOrders = () => {

    const labels = generateXAxis();

    // const map = Object.fromEntries(
    //   ordersChart.map((d: any) => [
    //     d.label ?? d._id,
    //     d.orders
    //   ])
    // );

    const map = Object.fromEntries(
      ordersChart.map((d) => [d.label, d.orders])
    );

    const values = labels.map(l => map[l] || 0);

    return { labels, values };
  };

  // const ordersData = {
  //   labels: ordersChart.map(d => d.label),
  //   datasets: [{
  //     label: `${timeRange} Orders`,
  //     data: ordersChart.map(d => d.orders),
  //     borderColor: isDark ? "#4ade80" : "#2563eb",
  //     backgroundColor: "rgba(59,130,246,0.1)",
  //     fill: true,
  //     tension: 0.3
  //   }]
  // };

  const { labels, values } = normalizeOrders();

  const ordersData = {
    labels,
    datasets: [
      {
        label: `${timeRange} Orders`,
        data: values,
        borderColor: isDark ? "#4ade80" : "#2563eb",
        backgroundColor: "rgba(59,130,246,0.15)",
        tension: 0.4,
        fill: true
      }
    ]
  };


  // const chartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: { labels: { color: isDark ? "#e5e7eb" : "#374151" } },
  //     title: { display: true, text: '', color: isDark ? '#e5e7eb' : '#374151' }
  //   },
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //       ticks: {
  //         precision: 0,
  //         stepSize: 1,
  //         color: isDark ? "#e5e7eb" : "#374151",
  //         callback: (value: number) =>
  //           Number.isInteger(value) ? value : null
  //       }
  //     },

  //     x: {
  //       ticks: {
  //         callback: function (val: string | number, index: number) {

  //           if (timeRange === "Day") {
  //             return index % 2 === 0 ? labels[index] : "";
  //           }

  //           return labels[index];
  //         },
  //         color: isDark ? "#e5e7eb" : "#374151"
  //       }
  //     }
  //   }
  // };

  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    // ✅ initialize socket
    socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

    const loadAnalytics = async () => {
      try {
        const orders = await GET<{ data: OrdersData[] }>(`api/v1/analytics/orders-overview?range=${timeRange}`);
        setOrdersChart(orders.data.data || []);

        const revenue = await GET<{ data: RevenueData[] }>("/api/v1/analytics/revenue-overview?range=" + timeRange);
        setRevenueData(revenue.data.data);


        const customers = await GET<{ data: CustomersData[] }>("/api/v1/analytics/customers-overview?range=" + timeRange);
        setCustomersData(customers.data.data);

        // const revenue2 = await GET<{ data: MonthlyRevenue[] }>("api/v1/analytics/monthly-revenue");
        // setMonthlyRevenue(revenue.data || []);

        const payments = await GET("api/v1/analytics/payment-methods");
        setPaymentData(payments.data || []);

        const heatmap = await GET<{ data: HeatmapItem[] }>("api/v1/analytics/heatmap");
        setHeatmapData(heatmap.data.data || []);

        const prediction = await GET("api/v1/analytics/prediction");
        setPredictionData(prediction.data || []);
      } catch (error) {
        console.error("Analytics load failed", error)
      }

    };

    loadAnalytics();

    socketRef.current?.on("revenue:update", (data: MonthlyRevenue[]) => {
      setMonthlyRevenue(data || []);
    });

    socketRef.current?.on("order:paid", loadAnalytics);

    socketRef.current?.on("order:failed", () => {
      console.log("Payment failed update");
    });

    return () => { socketRef.current?.disconnect(); }

  }, [timeRange]);

  const processedData = movingAverage(monthlyRevenue || []);

  return (
    <div>
      <main className="flex-1 transition-all duration-300 mx-auto">

        {/* breadcrumb */}
        <section className=' mx-auto py-2 mt-4 w-[95%] rounded-md'>
          {crumbs.map((crumb) => {
            return crumb.isLast ? (
              <span key={crumb.to} className='flex gap-2 items-center text-gray-800 dark:text-gray-100 pl-6'><IoHome />/ {crumb.label}</span>
            ) : (
              <span key={crumb.to}>
                <Link to={crumb.to}>{crumb.label}</Link> &gt;{" "}
              </span>
            );
          })}
        </section>

        <section className='grid lg:grid-cols-2 grid-cols-1 w-[95%] mx-auto'>
          <div className='col-span-1 p-4 lg:p-6 bg-slate-100 dark:bg-slate-400 border border-[rgba(0,0,0,0.1)] rounded-lg shadow-lg min-w-48 my-6 pt-8 flex items-center justify-between'>
            <div>
              <h1 className="text-3xl font-bold mb-1 text-black">Welcome,</h1>
              <h1 className='text-3xl font-bold text-primary'>John Doe 👋</h1>
              <p className="text-gray-600 mt-4">Here’s What happening on your store today. See the statistics at once.</p>
              <Link to="/products/create">
                <Button className='!mt-6 bg-primary text-white hover:bg-primary/90 transition-colors flex gap-2' variant='contained'><FaPlus /> Add Product</Button>
              </Link>
            </div>
            <img src="https://ecommerce-admin-view.netlify.app/shop-illustration.webp" className='w-[200px]' />
          </div>


          <div className=" col-span-1 p-4 lg:py-6 lg:pr-0 animate-fade-in">
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 animate-slide-up h-full" style={{ '--delay': '100ms' } as React.CSSProperties}>
              <StatsCard
                title="Total Sales"
                value="$42,250"
                trend={0.47}
                icon={<Wallet2 />}
                className="bg-primary/5 bg-gradient-to-br from-blue-500/50 to-pink-300/50 rounded-lg shadow hover:opacity-80 transition-opacity duration-300"
              />
              <StatsCard
                title="Orders"
                value="1,040"
                description="Today's volume"
                icon={<BarChart3 />}
                className="bg-primary/5 bg-gradient-to-br from-violet-500/50 to-green-300/50 rounded-lg shadow hover:opacity-80 transition-opacity duration-300"
              />
              <StatsCard
                title="Revenue"
                value="$9,800"
                trendLabel=""
                icon={<TrendingUp />}
                className="bg-success/5 bg-gradient-to-br from-green-500/50 to-blue-300/80 rounded-lg shadow hover:opacity-80 transition-opacity duration-300"
              />
            </div> */}
            <DashboardStatsCards />
          </div>
        </section>

        <Orders />

        {/* <div className='shadow-xl mx-auto w-[95%] h-auto rounded-md mb-5'>
          <InventoryExample isDarkMode={theme === "light" ? false : true} />
        </div> */}



        {/* <MuiCollapsibleTable isDarkMode={theme === "light" ? false : true} /> */}

        <main className="flex-1 p-8">

          {/* orders Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-1 !h-96 gap-6 mb-8">
            <OrdersChart data={ordersChart} range={timeRange} onRangeChange={setTimeRange} />
            <RevenueChart data={revenueData} range={timeRange} onRangeChange={setTimeRange} />
            <CustomersChart data={customersData} range={timeRange} onRangeChange={setTimeRange} />

            {/* category and top products charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryBreakdownCard />
              <TopProducts />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MonthlyRevenueChart data={processedData} />
              <PaymentPieChart data={paymentData} />
              <SalesHeatmap data={heatmapData} />
              <PredictionChart data={predictionData} />
            </div>

            <ProductConversionAnalytics />
            <ProductFunnelChart />

          </div>
        </main>
      </main>
    </div>
  );
}