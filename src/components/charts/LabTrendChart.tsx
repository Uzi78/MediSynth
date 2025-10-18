'use client';

import { format, parseISO, addDays } from 'date-fns';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface LabHistoryPoint {
  date: string;
  value: number;
}

interface LabTrendChartProps {
  data: LabHistoryPoint[];
}

export function LabTrendChart({ data: initialData }: LabTrendChartProps) {
  let data = initialData;

  if (!data || data.length === 0) {
    return (
        <div className="flex items-center justify-center h-full w-full text-gray-500">
            <p>No data to display.</p>
        </div>
    );
  }

  // If there's only one data point, create a second one to draw a flat line
  if (data.length === 1) {
    const singlePoint = data[0];
    const nextDay = addDays(parseISO(singlePoint.date), 1);
    data = [
      singlePoint,
      { ...singlePoint, date: nextDay.toISOString() }
    ];
  }


  const getDomain = (data: LabHistoryPoint[]) => {
    const values = data.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 1; // Add padding, with a fallback for flat lines

    return [
      (dataMin: number) => Math.floor(Math.max(0, dataMin - padding)),
      (dataMax: number) => Math.ceil(dataMax + padding)
    ];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 0,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(str) => format(parseISO(str), 'MMM yy')}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={getDomain(data)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
          labelFormatter={(label) => format(parseISO(label), 'PPP')}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
