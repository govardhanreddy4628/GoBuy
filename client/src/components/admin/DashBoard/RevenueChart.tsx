import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart2({ data }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow h-[300px]">
      <h2 className="font-semibold mb-3">Revenue Trend</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          {/* 🔵 Actual revenue */}
          <Line type="monotone" dataKey="revenue" />

          {/* 🔥 Smoothed trend */}
          <Line type="monotone" dataKey="avg" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}