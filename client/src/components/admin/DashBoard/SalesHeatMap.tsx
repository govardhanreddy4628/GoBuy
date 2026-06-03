interface HeatmapItem {
  _id: number;
  orders: number;
}

interface Props {
  data?: HeatmapItem[];
}

export const SalesHeatmap = ({ data = [] }: Props) => {

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  const map = Object.fromEntries(
    safeData.map((d) => [d._id, d.orders])
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow">

      <h2 className="font-semibold mb-3">Sales by Hour</h2>

      <div className="grid grid-cols-12 gap-2">

        {hours.map((hour) => {

          const value = map[hour] || 0;

          return (
            <div
              key={hour}
              className="h-10 flex items-center justify-center text-xs rounded"
              style={{
                backgroundColor: `rgba(34,197,94,${value / 20})`,
              }}
            >
              {hour}
            </div>
          );
        })}

      </div>
    </div>
  );
};