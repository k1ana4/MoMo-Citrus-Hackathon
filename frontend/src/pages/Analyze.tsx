import { useState } from 'react'
import LeakStory from '../components/LeakStory'
import FixSuggestion from '../components/FixSuggestion'
import MemoryVisualizer from '../components/MemoryVisualizer'
import QuizMode from '../components/QuizMode'

const SAMPLE_CODE = `#include <stdlib.h>
#include <stdio.h>

int* create_buffer(int n) {
    int *ptr = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) ptr[i] = i;
    return ptr;
}

int main() {
    int *data = malloc(40);
    char *name = (char*)malloc(128);
    sprintf(name, "leaky");

    int *buf = create_buffer(10);
    printf("%s %d\\n", name, buf[0]);

    return 0;
}`

export default function Analyze() {
  const [code, setCode] = useState(SAMPLE_CODE)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'cpp' }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setAnalysis(data)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const leakLines: number[] = analysis?.leaks?.map((l: any) => l.line) || []

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f1a', color: '#e2e8f0', fontFamily: 'monospace' }}>

      {/* TOP NAV */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #1e2236' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: '#1e293b', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>M</div>
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>MoMo</span>
          <span style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.1em' }}>MEMORY.MONITOR</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1e293b', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: loading ? '#f59e0b' : analysis ? '#10b981' : '#6366f1' }}></div>
          {loading ? 'ANALYZING' : analysis ? 'COMPLETE' : 'READY'}
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: '24px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>
            Find memory leaks in <span style={{ color: '#10b981' }}>seconds.</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '0.85rem' }}>
            Paste C/C++ code. MoMo runs static analysis and asks Claude to explain every leak — no Valgrind, no setup.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => { setAnalysis(null); setError(''); setCode(SAMPLE_CODE) }}
            style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' }}>
            ↺ Reset
          </button>
          <button onClick={handleAnalyze} disabled={loading}
            style={{ background: '#10b981', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.8rem', opacity: loading ? 0.7 : 1 }}>
            ▶ {loading ? 'Analyzing...' : 'Analyze code'}
          </button>
        </div>
      </div>

      {/* MAIN SPLIT LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px 24px' }}>

        {/* LEFT COLUMN - code + fix + concept */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Code editor */}
          <div style={{ background: '#0d1117', border: '1px solid #1e2236', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e2236', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
              <span>📄 SOURCE · MAIN.C</span>
              <span>{code.split('\n').length} LINES</span>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ padding: '16px 12px', background: '#0a0b12', borderRight: '1px solid #1e2236', color: '#374151', fontSize: '0.8rem', lineHeight: '1.6', textAlign: 'right', userSelect: 'none', minWidth: '48px' }}>
                {code.split('\n').map((_, i) => (
                  <div key={i} style={{ color: leakLines.includes(i + 1) ? '#ef4444' : '#374151', fontWeight: leakLines.includes(i + 1) ? 'bold' : 'normal' }}>
                    {leakLines.includes(i + 1) ? '●' : i + 1}
                  </div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                style={{ flex: 1, background: '#0d1117', color: '#e2e8f0', border: 'none', padding: '16px', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.6', resize: 'none', outline: 'none', minHeight: '300px', height: `${Math.max(300, code.split('\n').length * 22)}px` }}
              />
            </div>
          </div>

          {/* Suggested fix below code */}
          {analysis && <FixSuggestion fix={analysis.fix} />}

        </div>

        {/* RIGHT COLUMN - analysis results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {error && <div style={{ color: '#f87171', padding: '12px', background: '#1f0a0a', borderRadius: '8px', border: '1px solid #ef4444' }}>{error}</div>}

          {!analysis && !loading && (
            <div style={{ background: '#131520', padding: '40px', borderRadius: '12px', border: '1px solid #1e2236', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛡️</div>
              <p style={{ fontWeight: 'bold', color: '#94a3b8', marginBottom: '8px', fontSize: '1rem' }}>No scan yet</p>
              <p style={{ fontSize: '0.85rem' }}>Paste your C/C++ code on the left and click Analyze.</p>
            </div>
          )}

          {analysis && (
            <>
              {/* Summary + score */}
              <div style={{ background: '#131520', padding: '16px', borderRadius: '12px', border: '1px solid #1e2236', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>{analysis.summary}</p>
                {analysis.score !== undefined && (
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.5rem', marginLeft: '16px', flexShrink: 0 }}>{analysis.score}/100</span>
                )}
              </div>

              <LeakStory leaks={analysis.leaks} />
              <MemoryVisualizer leaks={analysis.leaks} code={code} />
              <QuizMode leaks={analysis.leaks} code={code} />
            </>
          )}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ padding: '8px 24px', borderTop: '1px solid #1e2236', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' }}>
        <span>MOMO · V0.1</span>
        <span>POST /ANALYZE → STATIC + CLAUDE</span>
      </div>
    </div>
  )
}