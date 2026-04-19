import { useState } from 'react';

export default function LogsPanel({ analysis }: { analysis: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <button onClick={() => setOpen(!open)} className="font-bold w-full text-left">
        📋 Raw Analysis Data {open ? '▼' : '▶'}
      </button>
      {open && (
        <pre className="mt-2 text-xs bg-black p-3 rounded overflow-x-auto max-h-80">
          {JSON.stringify(analysis, null, 2)}
        </pre>
      )}
    </div>
  );
}