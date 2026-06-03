import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

import { useTheme } from "../../../context/themeContext";
import { useMemo } from "react";

export const RevenueChart = ({ data, range, onRangeChange }) => {

    const { theme } = useTheme();
    const isDark = theme === "dark";

    const cardBg = isDark
        ? "bg-gray-800 text-white"
        : "bg-white text-gray-800";

    const borderColor = isDark ? "#374151" : "#e5e7eb";

    const lineColor = isDark ? "#22c55e" : "#16a34a";


    const generateData = () => {

        if (range === "Year") {
            const months = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            return months.map(m => ({
                label: m,
                revenue: data.find(d => d.label === m)?.revenue || 0
            }));
        }

        if (range === "Week") {
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            return days.map(d => ({
                label: d,
                revenue: data.find(x => x.label === d)?.revenue || 0
            }));
        }

        if (range === "Month") {
            const weeks = ["Week1", "Week2", "Week3", "Week4", "Week5"];

            return weeks.map(w => ({
                label: w,
                revenue: data.find(x => x.label === w)?.revenue || 0
            }));
        }

        if (range === "Day") {
            const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

            return hours.map(h => ({
                label: h,
                revenue: data.find(x => x.label === h)?.revenue || 0
            }));
        }

        return data;
    };

    const normalized = useMemo(() => generateData(), [data, range]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;

        return (
            <div
                className={`px-4 py-3 rounded-lg shadow-lg text-sm
        ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
            >
                <p className="font-semibold">{label}</p>

                <p className="text-green-500">
                    Revenue: <span className="font-bold">₹{payload[0].value}</span>
                </p>
            </div>
        );
    };

    return (

        <div
            className={`${cardBg} p-6 rounded-xl shadow-lg border`}
            style={{ borderColor }}
        >
            <div className="flex justify-between items-center mb-6">

                <h2 className="text-lg font-semibold">
                    Revenue Trend
                </h2>

                {onRangeChange && (
                    <select
                        value={range}
                        onChange={(e) => onRangeChange(e.target.value)}
                        className={`px-3 py-2 rounded-md text-sm border transition
            ${isDark
                                ? "bg-gray-700 text-white border-gray-600"
                                : "bg-white text-gray-800 border-gray-300"
                            }`}
                    >
                        <option value="Day">Day</option>
                        <option value="Week">Week</option>
                        <option value="Month">Month</option>
                        <option value="Year">Year</option>
                    </select>
                )}

            </div>

            <ResponsiveContainer width="100%" height={280}>

                <AreaChart
                    data={normalized}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >

                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={lineColor} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="4 4"
                        stroke={isDark ? "#374151" : "#e5e7eb"}
                    />

                    <XAxis
                        dataKey="label"
                        stroke={isDark ? "#d1d5db" : "#374151"}
                    />

                    <YAxis allowDecimals={false} />

                    <Tooltip content={<CustomTooltip />} />

                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={lineColor}
                        strokeWidth={3}
                        fill="url(#revenueGradient)"
                        dot={{ r: 4 }}
                        activeDot={{ r: 7 }}
                    />

                </AreaChart>

            </ResponsiveContainer>

        </div>
    );
};