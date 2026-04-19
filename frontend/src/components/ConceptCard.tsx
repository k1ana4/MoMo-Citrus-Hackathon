export default function ConceptCard({ prevention }: { prevention: any }) {
  if (!prevention?.concept) return null;
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-pink-700/50">
      <h3 className="font-bold text-lg mb-2">🎓 Concept: {prevention.concept}</h3>
      <p className="text-sm text-gray-300 mb-3">{prevention.conceptExplanation}</p>
      <div className="bg-pink-900/30 p-3 rounded border-l-4 border-pink-500">
        <p className="text-sm"><strong>💎 Pro Tip:</strong> {prevention.tip}</p>
      </div>
    </div>
  );
}