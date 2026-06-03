import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

import { useTheme } from "../../../context/themeContext";

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9"
];

export const PaymentPieChart = ({ data = [] }) => {

  const { theme } = useTheme();

  const isDark = theme === "dark";

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow">
        <p className="text-gray-500 dark:text-gray-400">
          No payment data
        </p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const formattedData = data.map((item) => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  return (

    <div className="h-[320px] bg-white dark:bg-gray-800 p-5 rounded-xl shadow flex flex-col">

      {/* Header */}

      <div className="mb-2">

        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          Payment Methods
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Distribution of successful payments
        </p>

      </div>

      {/* Chart */}

      <div className="flex-1">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={formattedData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={3}
              animationDuration={800}
            >

              {formattedData.map((_, index) => (

                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />

              ))}

            </Pie>

            <Tooltip
              formatter={(value, name, props) => [
                `${value} orders (${props.payload.percentage}%)`,
                name
              ]}
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#fff",
                borderRadius: "8px",
                border: "none",
                color: isDark ? "#fff" : "#000"
              }}
            />

            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value, entry, index) => {
                const item = formattedData[index];
                return (
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {value} ({item.percentage}%)
                  </span>
                );
              }}
            />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

};