'use client';

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts';

type RiskMeterProps = {
  score: number;
};

export function RiskMeter({ score }: RiskMeterProps) {
  const data = [{ name: 'risk', value: score }];
  
  const color =
    score > 70
      ? 'hsl(var(--destructive))'
      : score > 40
      ? 'hsl(var(--primary))'
      : 'hsl(var(--accent))';

  return (
    <ResponsiveContainer width="100%" height={150}>
      <RadialBarChart
        innerRadius="80%"
        outerRadius="100%"
        data={data}
        startAngle={180}
        endAngle={0}
        barSize={12}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          background={{ fill: 'hsla(var(--muted), 0.5)' }}
          dataKey="value"
          cornerRadius={6}
          fill={color}
          className="transition-all duration-500"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-4xl font-bold"
        >
          {score}
        </text>
        <text
          x="50%"
          y="75%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground text-sm uppercase tracking-wider"
        >
          Risk Score
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
