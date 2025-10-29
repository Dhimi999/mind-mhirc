
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface ActivityChartProps {
  postsChartData?: ChartDataPoint[];
  chartData?: ChartDataPoint[];
  title?: string;
  color?: string;
}

export const ActivityChart = ({ 
  postsChartData, 
  chartData, 
  title = "Tren Aktivitas 30 Hari Terakhir",
  color = "primary"
}: ActivityChartProps) => {
  // Use either postsChartData or chartData
  const data = postsChartData || chartData || [];
  
  // Define color for the line chart
  const strokeColor = color === "primary" ? "hsl(var(--primary))" : 
                    color === "blue" ? "#3b82f6" : 
                    color === "green" ? "#22c55e" : "hsl(var(--primary))";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="date" 
                height={60}
                angle={-45}
                textAnchor="end"
                tick={{ fontSize: 12 }}
                tickMargin={15}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }} 
                formatter={(value) => [value, 'Jumlah']}
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name="Jumlah"
                stroke={strokeColor}
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
