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
    <div style={{ background: '#131520', borderRadius: '12px', border: '1px solid #1e2236', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e2236', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1rem' }}>💡</span>
        <p style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>
          Suggested Fix
        </p>
      </div>

      {/* Explanation */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e2236' }}>
        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.7', margin: 0 }}>
          {fix.explanation}
        </p>
      </div>

      {/* Code block */}
      <div style={{ position: 'relative' }}>
        
        {/* Copy button - big and visible */}
        <button
          onClick={handleCopy}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: copied ? '#10b981' : '#7c3aed',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '700',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {copied ? '✅ Copied!' : '📋 Copy Fixed Code'}
        </button>

        {/* Label */}
        <div style={{ padding: '12px 16px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.65rem', background: '#10b981', color: 'black', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
            Fixed Code ✓
          </span>
        </div>

        <pre style={{
          background: '#0a0b12',
          padding: '16px',
          margin: 0,
          overflowX: 'auto',
          fontSize: '0.8rem',
          color: '#86efac',
          lineHeight: '1.7',
          whiteSpace: 'pre-wrap'
        }}>
          <code>{fix.fixedCode}</code>
        </pre>
      </div>
    </div>
  );
}