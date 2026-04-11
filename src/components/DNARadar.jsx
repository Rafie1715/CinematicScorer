// src/components/DNARadar.jsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const DNARadar = ({ data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full h-80 bg-zinc-900/80 rounded-3xl p-6 backdrop-blur-md border border-zinc-800 shadow-2xl"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#1DB954' }}
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#1DB954"
            fill="#1DB954"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default DNARadar;