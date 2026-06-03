import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { ResponsiveContainer } from "recharts";

export const PredictionChart = ({ data = [] }) => {

  if (!Array.isArray(data)) return null;

  return (

    <div className="h-[300px] bg-white p-4 rounded-xl shadow">

      <h2 className="font-semibold mb-3">Revenue Prediction</h2>

      <ResponsiveContainer width="100%" height={250}>

        <LineChart data={data}>

          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line dataKey="predictedRevenue" />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );
};
