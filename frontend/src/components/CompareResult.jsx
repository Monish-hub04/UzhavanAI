import {
  Trophy,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  IndianRupee,
  Gauge,
  Equal,
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";

const fmt = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

function AgriScoreGauge({ score, label, color }) {
  const data = [{ name: label, value: score, fill: color }];
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <RadialBarChart
          width={128}
          height={128}
          cx={64}
          cy={64}
          innerRadius={42}
          outerRadius={58}
          barSize={12}
          data={data}
          startAngle={210}
          endAngle={-30}
        >
          <RadialBar
            background={{ fill: "#f3f4f6" }}
            dataKey="value"
            cornerRadius={8}
            max={100}
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-gray-900">{score}</span>
          <span className="text-[9px] text-gray-400 font-medium">/ 100</span>
        </div>
      </div>
      <p className="mt-1 text-xs font-semibold text-gray-600">{label}</p>
    </div>
  );
}

function MetricCard({ label, valueA, valueB, format = "number" }) {
  const fmtVal = (v) =>
    format === "currency" ? fmt(v) : format === "score" ? v.toFixed(1) : v;
  const better = valueA > valueB ? "A" : valueB > valueA ? "B" : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-[10px] font-medium text-gray-400 mb-3 uppercase tracking-wider">
        {label}
      </p>
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <p
            className={cn(
              "text-lg font-bold",
              better === "A" ? "text-primary-600" : "text-gray-700"
            )}
          >
            {fmtVal(valueA)}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Scenario A</p>
        </div>
        <div className="px-3">
          <span className="text-gray-300 text-lg">vs</span>
        </div>
        <div className="text-center flex-1">
          <p
            className={cn(
              "text-lg font-bold",
              better === "B" ? "text-primary-600" : "text-gray-700"
            )}
          >
            {fmtVal(valueB)}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Scenario B</p>
        </div>
      </div>
    </div>
  );
}

export default function CompareResult({ result }) {
  if (!result) return null;

  const { scenario_a, scenario_b, comparison } = result;
  const better = comparison.better_scenario;
  const isTie = better === "Tie";

  const winnerColor = better === "A" ? "#f59e0b" : "#0ea5e9";
  const winnerBg = better === "A" ? "from-amber-500 to-orange-500" : "from-sky-500 to-blue-500";

  const barData = [
    {
      name: "Income",
      A: scenario_a.predicted_income,
      B: scenario_b.predicted_income,
    },
  ];

  const incomeChartData = [
    { name: "Scenario A", value: scenario_a.predicted_income, fill: "#f59e0b" },
    { name: "Scenario B", value: scenario_b.predicted_income, fill: "#0ea5e9" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Winner Banner */}
      <div
        className={cn(
          "rounded-2xl p-6 text-center text-white shadow-lg",
          isTie
            ? "bg-gradient-to-r from-gray-600 to-gray-700"
            : `bg-gradient-to-r ${winnerBg}`
        )}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          {isTie ? (
            <Equal className="w-6 h-6" />
          ) : (
            <Trophy className="w-6 h-6 animate-bounce" />
          )}
          <h3 className="text-xl font-extrabold">
            {isTie
              ? "It's a Tie!"
              : `Scenario ${better} Wins!`}
          </h3>
        </div>
        <p className="text-sm opacity-90">{comparison.recommendation}</p>

        {!isTie && (
          <div className="mt-4 inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-5 py-2.5">
            <div className="flex items-center gap-1">
              {comparison.income_difference_pct > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-bold text-lg">
                {comparison.income_difference_pct}%
              </span>
            </div>
            <span className="text-xs opacity-75">higher income</span>
            <span className="mx-1 opacity-50">|</span>
            <span className="font-bold">{fmt(comparison.income_difference)}</span>
            <span className="text-xs opacity-75">difference</span>
          </div>
        )}
      </div>

      {/* Score Gauges + Income Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AgriScore Gauges */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Gauge className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-800">
              AgriScore Comparison
            </h3>
          </div>
          <div className="flex items-center justify-around">
            <AgriScoreGauge
              score={scenario_a.agri_score}
              label="Scenario A"
              color="#f59e0b"
            />
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="w-5 h-5 text-gray-300" />
              <span className="text-xs font-bold text-gray-500">
                Δ {comparison.agri_score_difference}
              </span>
            </div>
            <AgriScoreGauge
              score={scenario_b.agri_score}
              label="Scenario B"
              color="#0ea5e9"
            />
          </div>
        </div>

        {/* Income Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <IndianRupee className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-800">
              Income Comparison
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={incomeChartData} layout="vertical" margin={{ left: 10, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fontWeight: 600 }}
                width={85}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13 }}
                formatter={(val) => [`₹${val.toLocaleString("en-IN")}`, "Income"]}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>
                {incomeChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid sm:grid-cols-3 gap-4">
        <MetricCard
          label="Predicted Income"
          valueA={scenario_a.predicted_income}
          valueB={scenario_b.predicted_income}
          format="currency"
        />
        <MetricCard
          label="AgriScore"
          valueA={scenario_a.agri_score}
          valueB={scenario_b.agri_score}
          format="score"
        />
        <MetricCard
          label="Loan Eligibility"
          valueA={scenario_a.loan_eligibility}
          valueB={scenario_b.loan_eligibility}
          format="text"
        />
      </div>
    </div>
  );
}

export function CompareSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton w-full h-32 rounded-2xl" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="skeleton w-full h-64 rounded-2xl" />
        <div className="skeleton w-full h-64 rounded-2xl" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="skeleton w-full h-24 rounded-xl" />
        <div className="skeleton w-full h-24 rounded-xl" />
        <div className="skeleton w-full h-24 rounded-xl" />
      </div>
    </div>
  );
}
