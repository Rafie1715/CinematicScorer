import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const FeatureRadar = ({ data }) => {
  return (
    <div className="w-full h-72 sm:h-80 mt-4 overflow-visible">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius="66%"
          data={data}
          margin={{ top: 18, right: 28, bottom: 18, left: 28 }}
        >
          <PolarGrid stroke="#27272a" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#27272a' }}
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#dc2626"
            fill="#dc2626"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeatureRadar;