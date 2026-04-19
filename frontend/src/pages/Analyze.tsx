import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import LeakStory from '../components/LeakStory'
import MemoryGraph from '../components/MemoryGraph'
import FixSuggestion from '../components/FixSuggestion'
import ConceptCard from '../components/ConceptCard'

const SAMPLE_CODE: Record<string, string> = {
  cpp: `#include <stdlib.h>
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
}`,
  python: `class Node:
    def __init__(self, value):
        self.value = value
        self.parent = self  # circular reference!

def leaky_function():
    cache = {}
    for i in range(1000000):
        cache[i] = Node(i)
    return cache[0]`,
}

export default function Analyze() {
  const [language, setLanguage] = useState('cpp')
  const [code, setCode] = useState(SAMPLE_CODE.cpp)
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
        body: JSON.stringify({ code, language }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setAnalysis(data)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const leakLines = analysis?.leaks?.map((l: any) => l.line) || []

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0f1a 0%, #0f172a 50%, #0d1117 100%)', color: 'white', display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>
      
      {/* TOP NAV */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: '#1e293b', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>M</div>
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>MoMo</span>
          <span style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.1em' }}>MEMORY.MONITOR</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1e293b', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: loading ? '#f59e0b' : analysis ? '#10b981' : '#6366f1' }}></div>
            {loading ? 'ANALYZING' : analysis ? 'COMPLETE' : 'READY'}
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: '32px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>
            Find memory leaks in{' '}
            <span style={{ color: '#10b981' }}>seconds.</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '0.9rem' }}>
            Paste C, C++ or Python. MoMo runs static analysis and asks Claude to explain every leak —<br />
            no Valgrind, no setup.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => { setLanguage('cpp'); setCode(SAMPLE_CODE.cpp); setAnalysis(null) }}
            style={{ background: language === 'cpp' ? '#10b981' : '#1e293b', color: language === 'cpp' ? '#000' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
          >
            C / C++
          </button>
          <button
            onClick={() => { setLanguage('python'); setCode(SAMPLE_CODE.python); setAnalysis(null) }}
            style={{ background: language === 'python' ? '#10b981' : '#1e293b', color: language === 'python' ? '#000' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
          >
            PYTHON
          </button>
          <button
            onClick={() => { setAnalysis(null); setError('') }}
            style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            ↺ Reset
          </button>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{ background: '#10b981', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.8rem', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ▶ {loading ? 'Analyzing...' : 'Analyze code'}
          </button>
        </div>
      </div>

      {/* MAIN SPLIT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', flex: 1, padding: '0 24px 24px', gap: '16px' }}>
        
        {/* LEFT - CODE EDITOR */}
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
            <span>📄 SOURCE · MAIN.{language === 'python' ? 'PY' : 'C'}</span>
            <span>{code.split('\n').length} LINES</span>
          </div>
          <CodeEditor value={code} onChange={setCode} language={language} leakLines={leakLines} />
        </div>

        {/* RIGHT - RESULTS */}
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: loading ? '#f59e0b' : analysis ? '#10b981' : '#6366f1' }}></div>
              {loading ? 'ANALYZING' : analysis ? 'COMPLETE' : 'READY'}
            </div>
            <span>ANALYSIS</span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {error && <div style={{ color: '#f87171', marginBottom: '12px' }}>{error}</div>}
            {analysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analysis.score !== undefined && (
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{analysis.summary}</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>{analysis.score}/100</span>
                  </div>
                )}
                <LeakStory leaks={analysis.leaks} />
                {analysis.memoryTimeline?.length > 0 && <MemoryGraph data={analysis.memoryTimeline} />}
                <FixSuggestion fix={analysis.fix} />
                <ConceptCard prevention={analysis.prevention} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: '60px', height: '60px', border: '2px solid #1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '1.5rem' }}>🛡️</div>
                <p style={{ fontWeight: 'bold', color: '#94a3b8', marginBottom: '8px' }}>No scan yet</p>
                <p style={{ fontSize: '0.85rem' }}>Paste your code on the left and run the analyzer.<br />MoMo will flag leaks line-by-line.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ padding: '8px 24px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' }}>
        <span>MOMO · V0.1</span>
        <span>POST /ANALYZE → STATIC + CLAUDE</span>
      </div>
    </div>
  )
}