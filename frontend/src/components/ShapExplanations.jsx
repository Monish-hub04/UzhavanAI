import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import { Lightbulb } from "lucide-react";

export default function ShapExplanations({ show, result }) {
  if (!show || !result || !result.shap_values) return null;

  const { positive, negative } = result.shap_values;
  
  // Format data for Recharts BarChart
  // We want to show a diverging bar chart, where values can be positive or negative.
  const chartData = [
    ...positive.map((item) => ({ ...item, type: "positive" })),
    ...negative.map((item) => ({ ...item, type: "negative" }))
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <div className="animate-fade-in-up mt-8 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-6 h-6 text-primary-500" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">Why was this income predicted?</h3>
          <p className="text-sm text-gray-500">
            AI explanation of the key factors driving the model's estimate.
          </p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis 
              type="number" 
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="feature" 
              width={160}
              tick={{ fontSize: 11, fill: "#4b5563" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f9fafb" }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              formatter={(value) => [`${value > 0 ? '+' : ''}₹${value.toLocaleString()}`, "Impact"]}
              labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
            />
            <ReferenceLine x={0} stroke="#9ca3af" />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.type === "positive" ? "#10b981" : "#ef4444"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-6 justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          Increases Estimate
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          Decreases Estimate
        </div>
      </div>
    </div>
  );
}
