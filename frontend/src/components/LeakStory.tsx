export default function LeakStory({ leaks }: { leaks: any[] }) {
  if (!leaks?.length) {
    return (
      <div style={{ background: 'linear-gradient(to right, #064e3b, #065f46)', padding: '24px', borderRadius: '12px' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>✅ No memory leaks detected!</p>
        <p style={{ fontSize: '0.85rem', color: '#6ee7b7', marginTop: '4px' }}>Your code looks clean. Nice work!</p>
      </div>
    );
  }

  const severityColors: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#3b82f6',
  };

  return (
    <div style={{ background: '#131520', padding: '16px', borderRadius: '12px', border: '1px solid #1e2236' }}>
      <p style={{ fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
        📖 The Story of Your Leaks
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {leaks.map((leak, i) => (
          <div key={i} style={{ borderLeft: `4px solid ${severityColors[leak.severity] || '#64748b'}`, padding: '12px', borderRadius: '0 8px 8px 0', background: '#0d0f1a' }}>
            
            {/* Title - big and bold */}
            <p style={{ fontSize: '1rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>
              {leak.title}
            </p>

            {/* Severity badge + meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: severityColors[leak.severity] || '#64748b', color: 'white', textTransform: 'uppercase' }}>
                {leak.severity}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Line {leak.line} · <code style={{ color: '#a5b4fc' }}>{leak.variable}</code> · ~{leak.estimatedBytes} bytes
              </span>
            </div>

            {/* Explanation */}
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '8px' }}>
              {leak.explanation}
            </p>

            {/* Story - italicized, purple */}
            <p style={{ fontSize: '0.8rem', color: '#a78bfa', fontStyle: 'italic', lineHeight: '1.5' }}>
              💭 {leak.story}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}