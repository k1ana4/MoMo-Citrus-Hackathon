export default function LeakStory({ leaks }: { leaks: any[] }) {
  if (!leaks?.length) {
    return (
      <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-6 rounded-lg">
        <p className="text-2xl">✅ No memory leaks detected!</p>
        <p className="text-sm text-green-200 mt-1">Your code looks clean. Nice work!</p>
      </div>
    );
  }

  const severityColors: Record<string, string> = {
    high: 'border-red-500 bg-red-900/20',
    medium: 'border-yellow-500 bg-yellow-900/20',
    low: 'border-blue-500 bg-blue-900/20',
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-3">📖 The Story of Your Leaks</h3>
      <div className="space-y-3">
        {leaks.map((leak, i) => (
          <div key={i} className={`border-l-4 p-3 rounded ${severityColors[leak.severity] || ''}`}>
            <div className="flex justify-between items-start">
              <h4 className="font-bold">{leak.title}</h4>
              <span className="text-xs bg-gray-700 px-2 py-1 rounded uppercase">
                {leak.severity}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              <strong>Line {leak.line}</strong> · <code>{leak.variable}</code> · ~{leak.estimatedBytes} bytes
            </p>
            <p className="text-sm mt-2">{leak.explanation}</p>
            <p className="text-sm italic mt-2 text-purple-300">💭 {leak.story}</p>
          </div>
        ))}
      </div>
    </div>
  );
}