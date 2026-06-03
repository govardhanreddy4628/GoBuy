import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const MonthlyRevenueChart = ({ data = [] }) => {

  if (!Array.isArray(data)) return null;

  return (
    <div className="h-[300px] bg-white p-4 rounded-xl shadow">

      <h2 className="font-semibold mb-3">Monthly Revenue</h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
};