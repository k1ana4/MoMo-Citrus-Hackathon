import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Area, AreaChart,
} from 'recharts';

export default function MemoryGraph({ data }: { data: any[] }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="font-bold mb-3">📈 Memory Usage Timeline</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="leaked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="allocated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="step" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
          <Legend />
          <Area type="monotone" dataKey="allocated" stroke="#a855f7" fill="url(#allocated)" />
          <Area type="monotone" dataKey="leaked" stroke="#ef4444" fill="url(#leaked)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}