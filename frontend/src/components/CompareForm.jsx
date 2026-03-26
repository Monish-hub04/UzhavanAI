import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Loader2,
  MapPin,
  Sprout,
  Cloud,
  Store,
  ArrowLeftRight,
  Sparkles,
  Flame,
  Snowflake,
} from "lucide-react";
import { cn } from "../lib/utils";

const soilTypes = ["Loamy", "Clay", "Sandy", "Black Cotton", "Red", "Alluvial", "Laterite"];
const cropTypes = ["Rice", "Wheat", "Sugarcane", "Cotton", "Maize", "Soybean", "Pulses", "Groundnut", "Vegetables"];
const seasons = ["Kharif", "Rabi", "Zaid"];

const presets = {
  a: {
    name: "💰 High Income — Sugarcane, Maharashtra",
    land_size: "15",
    irrigated_percentage: 95,
    soil_type: "Black Cotton",
    crop_type: "Sugarcane",
    season: "Kharif",
    yield_per_acre: "38",
    rainfall: "800",
    temperature: "30",
    market_price: "3500",
    market_distance: "5",
  },
  b: {
    name: "📉 Low Income — Small Rainfed Plot, Bihar",
    land_size: "1.5",
    irrigated_percentage: 10,
    soil_type: "Sandy",
    crop_type: "Pulses",
    season: "Rabi",
    yield_per_acre: "6",
    rainfall: "400",
    temperature: "25",
    market_price: "4200",
    market_distance: "35",
  },
};

const inputClass =
  "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all placeholder:text-gray-400";
const selectClass = cn(inputClass, "appearance-none cursor-pointer");

function Field({ label, error, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
      {error && <p className="text-[10px] text-red-500">{error.message}</p>}
    </div>
  );
}

function ScenarioPanel({ id, label, icon: Icon, color, register, errors, irrigated, onFillPreset, presetName }) {
  const prefix = id;
  return (
    <div className={cn(
      "flex-1 rounded-2xl border-2 p-5 sm:p-6 transition-all",
      color === "orange"
        ? "border-amber-200 bg-gradient-to-b from-amber-50/60 to-white"
        : "border-sky-200 bg-gradient-to-b from-sky-50/60 to-white"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            color === "orange" ? "bg-amber-100" : "bg-sky-100"
          )}>
            <Icon className={cn("w-4 h-4", color === "orange" ? "text-amber-600" : "text-sky-600")} />
          </div>
          <h3 className="text-sm font-bold text-gray-800">{label}</h3>
        </div>
        <button
          type="button"
          onClick={onFillPreset}
          className={cn(
            "text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all hover:-translate-y-0.5",
            color === "orange"
              ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              : "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
          )}
        >
          <Sparkles className="w-3 h-3 inline mr-1" />
          Demo
        </button>
      </div>

      {presetName && (
        <div className={cn(
          "mb-4 text-[10px] font-medium px-2.5 py-1.5 rounded-lg border",
          color === "orange"
            ? "bg-amber-50/50 text-amber-600 border-amber-100"
            : "bg-sky-50/50 text-sky-600 border-sky-100"
        )}>
          ✨ {presetName}
        </div>
      )}

      {/* Land & Farmer */}
      <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-gray-500">
        <MapPin className="w-3.5 h-3.5" /> Land & Farmer
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Field label="Land (acres)" error={errors?.[`${prefix}_land_size`]}>
          <input type="number" step="0.1" placeholder="5.5" className={inputClass}
            {...register(`${prefix}_land_size`, { required: "Required", min: { value: 0.1, message: "Min 0.1" } })} />
        </Field>
        <Field label={`Irrigated (${irrigated}%)`}>
          <input type="range" min="0" max="100" className="w-full accent-primary-600 mt-1"
            {...register(`${prefix}_irrigated_percentage`)} />
        </Field>
        <Field label="Soil" error={errors?.[`${prefix}_soil_type`]}>
          <select className={selectClass} {...register(`${prefix}_soil_type`, { required: "Required" })}>
            <option value="">Select...</option>
            {soilTypes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      {/* Crop */}
      <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-gray-500">
        <Sprout className="w-3.5 h-3.5" /> Crop
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Field label="Crop" error={errors?.[`${prefix}_crop_type`]}>
          <select className={selectClass} {...register(`${prefix}_crop_type`, { required: "Required" })}>
            <option value="">Select...</option>
            {cropTypes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Season" error={errors?.[`${prefix}_season`]}>
          <select className={selectClass} {...register(`${prefix}_season`, { required: "Required" })}>
            <option value="">Select...</option>
            {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Yield/Acre (q)" error={errors?.[`${prefix}_yield_per_acre`]}>
          <input type="number" step="0.1" placeholder="18" className={inputClass}
            {...register(`${prefix}_yield_per_acre`, { required: "Required", min: { value: 0.1, message: "Min 0.1" } })} />
        </Field>
      </div>

      {/* Environment */}
      <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-gray-500">
        <Cloud className="w-3.5 h-3.5" /> Environment
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Field label="Rainfall (mm)" error={errors?.[`${prefix}_rainfall`]}>
          <input type="number" placeholder="850" className={inputClass}
            {...register(`${prefix}_rainfall`, { required: "Required", min: { value: 0, message: "Min 0" } })} />
        </Field>
        <Field label="Temp (°C)" error={errors?.[`${prefix}_temperature`]}>
          <input type="number" step="0.1" placeholder="28" className={inputClass}
            {...register(`${prefix}_temperature`, { required: "Required" })} />
        </Field>
      </div>

      {/* Market */}
      <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-gray-500">
        <Store className="w-3.5 h-3.5" /> Market
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price/Quintal (₹)" error={errors?.[`${prefix}_market_price`]}>
          <input type="number" placeholder="2200" className={inputClass}
            {...register(`${prefix}_market_price`, { required: "Required", min: { value: 1, message: "Min 1" } })} />
        </Field>
        <Field label="Distance (km)" error={errors?.[`${prefix}_market_distance`]}>
          <input type="number" step="0.1" placeholder="12" className={inputClass}
            {...register(`${prefix}_market_distance`, { required: "Required", min: { value: 0, message: "Min 0" } })} />
        </Field>
      </div>
    </div>
  );
}

export default function CompareForm({ onSubmit, isLoading }) {
  const [presetA, setPresetA] = useState(null);
  const [presetB, setPresetB] = useState(null);

  const {
    register, handleSubmit, watch, setValue, getValues, reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      a_land_size: "", a_irrigated_percentage: 50, a_soil_type: "", a_crop_type: "",
      a_season: "", a_yield_per_acre: "", a_rainfall: "", a_temperature: "",
      a_market_price: "", a_market_distance: "",
      b_land_size: "", b_irrigated_percentage: 50, b_soil_type: "", b_crop_type: "",
      b_season: "", b_yield_per_acre: "", b_rainfall: "", b_temperature: "",
      b_market_price: "", b_market_distance: "",
    },
  });

  const irrigA = watch("a_irrigated_percentage");
  const irrigB = watch("b_irrigated_percentage");

  const fillPreset = (side) => {
    const p = presets[side];
    const { name, ...vals } = p;
    Object.entries(vals).forEach(([k, v]) => setValue(`${side}_${k}`, v));
    if (side === "a") setPresetA(name);
    else setPresetB(name);
  };

  const swapScenarios = () => {
    const vals = getValues();
    const fields = ["land_size","irrigated_percentage","soil_type","crop_type","season","yield_per_acre","rainfall","temperature","market_price","market_distance"];
    const newVals = {};
    fields.forEach((f) => {
      newVals[`a_${f}`] = vals[`b_${f}`];
      newVals[`b_${f}`] = vals[`a_${f}`];
    });
    reset({ ...vals, ...newVals });
    setPresetA(presetB);
    setPresetB(presetA);
  };

  const handleFormSubmit = (data) => {
    const extractScenario = (prefix) => ({
      land_size: parseFloat(data[`${prefix}_land_size`]),
      irrigated_percentage: parseFloat(data[`${prefix}_irrigated_percentage`]),
      soil_type: data[`${prefix}_soil_type`],
      crop_type: data[`${prefix}_crop_type`],
      season: data[`${prefix}_season`],
      yield_per_acre: parseFloat(data[`${prefix}_yield_per_acre`]),
      rainfall: parseFloat(data[`${prefix}_rainfall`]),
      temperature: parseFloat(data[`${prefix}_temperature`]),
      market_price: parseFloat(data[`${prefix}_market_price`]),
      market_distance: parseFloat(data[`${prefix}_market_distance`]),
    });

    onSubmit({
      scenario_a: extractScenario("a"),
      scenario_b: extractScenario("b"),
    });
  };

  return (
    <section id="compare" className="py-16 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Compare Scenarios
          </h2>
          <p className="mt-2 text-gray-500">
            Compare two farming scenarios side by side
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <ScenarioPanel
              id="a" label="Scenario A" icon={Flame} color="orange"
              register={register} errors={errors}
              irrigated={irrigA}
              onFillPreset={() => fillPreset("a")}
              presetName={presetA}
            />

            {/* Swap button */}
            <div className="flex lg:flex-col items-center justify-center py-2 lg:py-0">
              <button
                type="button"
                onClick={swapScenarios}
                className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center hover:border-primary-400 hover:shadow-lg transition-all hover:scale-110 active:scale-95"
                title="Swap scenarios"
              >
                <ArrowLeftRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <ScenarioPanel
              id="b" label="Scenario B" icon={Snowflake} color="blue"
              register={register} errors={errors}
              irrigated={irrigB}
              onFillPreset={() => fillPreset("b")}
              presetName={presetB}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 w-full py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-5 h-5" />
                Compare Scenarios
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
