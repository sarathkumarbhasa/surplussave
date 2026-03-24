import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ImpactChartProps {
  data: { day: string; kg: number }[];
}

export function ImpactChart({ data }: ImpactChartProps) {
  return (
    <div className="h-64 w-full bg-white rounded-2xl p-4 shadow-sm border border-green-50">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">Last 7 Days (kg rescued)</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
              dy={10}
            />
            <Tooltip 
              cursor={{ fill: '#F0FDF4' }} 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontWeight: 500,
                color: '#14532D'
              }} 
            />
            <Bar 
              dataKey="kg" 
              fill="#22C55E" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
