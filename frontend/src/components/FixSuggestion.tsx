import { useState } from 'react';

export default function FixSuggestion({ fix }: { fix: any }) {
  const [copied, setCopied] = useState(false);
  if (!fix?.fixedCode) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(fix.fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-4 rounded-lg border border-purple-700">
      <h3 className="font-bold text-lg mb-2">💡 Suggested Fix</h3>
      <p className="mb-3 text-sm">{fix.explanation}</p>
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-xs px-3 py-1 rounded z-10"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <pre className="bg-black/60 p-4 rounded overflow-x-auto text-sm text-green-300 whitespace-pre-wrap">
          <code>{fix.fixedCode}</code>
        </pre>
      </div>
    </div>
  );
}