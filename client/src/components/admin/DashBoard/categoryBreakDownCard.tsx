import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    TooltipProps
} from "recharts";

import { useEffect, useState } from "react";
import { useTheme } from "../../../context/themeContext";
import { GET } from "../../../api/api_utility";

interface Category {
    name: string;
    percentage: number;
    count: number;
}

const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#eab308",
    "#0ea5e9",
    "#ef4444"
];

interface ApiResponse {
    success: boolean;
    data: Category[];
}

/* ---------------- Tooltip ---------------- */

const CustomTooltip = ({
    active,
    payload
}: TooltipProps<number, string>) => {

    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload as Category;

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-md p-3 text-sm">

            <p className="font-semibold capitalize mb-1">
                {data.name}
            </p>

            <p className="text-gray-600 dark:text-gray-300">
                Items Sold: <span className="font-medium">{data.count}</span>
            </p>

            <p className="text-gray-600 dark:text-gray-300">
                Share: <span className="font-medium">{data.percentage}%</span>
            </p>

        </div>
    );
};

/* ---------------- Component ---------------- */

const CategoryBreakdownCard = () => {

    const [categories, setCategories] = useState<Category[]>([]);

    const { theme } = useTheme();

    const isDark = theme === "dark";

    const cardBg = isDark
        ? "bg-gray-800 text-white"
        : "bg-white text-gray-800";

    const subText = isDark
        ? "text-gray-400"
        : "text-gray-500";

    useEffect(() => {

        const fetchCategories = async () => {

            try {

                const res = await GET(
                    "api/v1/analytics/category-breakdown"
                );

                console.log("API RESPONSE:", res);

                setCategories(res?.data?.data || []);

            } catch (error) {

                console.error("Category breakdown error:", error);

            }

        };

        fetchCategories();

    }, []);

    return (

        <div className={`${cardBg} p-6 rounded-xl shadow w-full`}>

            {/* Header */}

            <div className="mb-6">

                <h2 className="text-xl font-semibold">
                    Category Sales Breakdown
                </h2>

                <p className={`text-sm ${subText}`}>
                    Best performing categories based on sales
                </p>

            </div>

            <div className="flex flex-col lg:flex-row gap-10">

                {/* Category List */}

                <div className="space-y-4 flex-1">

                    {categories.map((category, index) => (
                        <div key={index} className="flex items-center gap-4">
                            {/* Image avatar */}
                            <div className="w-9 h-9 flex-shrink-0 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 bg-white">
                                <img
                                    src={category.image?.url}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div key={category.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="capitalize">
                                        {category.name}
                                    </span>

                                    <span className="font-semibold">
                                        {category.percentage}%
                                    </span>
                                </div>

                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${category.percentage}%`,
                                            backgroundColor:
                                                COLORS[index % COLORS.length]
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pie Chart */}
                <div className="w-full max-w-[260px] h-[260px] mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categories}
                                dataKey="percentage"
                                nameKey="name"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={4}
                            >
                                {categories.map((_, index) => (

                                    <Cell
                                        key={index}
                                        fill={
                                            COLORS[index % COLORS.length]
                                        }
                                    />

                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default CategoryBreakdownCard;