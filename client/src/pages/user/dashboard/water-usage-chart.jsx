import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export function WaterUsageChart({ type, data }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-80 w-full bg-gray-100 animate-pulse rounded-md" />;
  }

  
  const chartData = data ? data.map(item => ({
    name: item.billingPeriodName || item.year, 
    value: item.totalUsage,
  })) : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-white p-2 shadow-sm">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-blue-600">{`${payload[0].value} m³`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === "monthly" ? (
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value} m³`} domain={[0, "dataMax + 5"]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value} m³`} domain={[0, "dataMax + 20"]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}