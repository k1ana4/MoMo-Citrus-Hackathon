import { useState, useEffect, useRef } from 'react'

type Block = {
  id: number
  variable: string
  size: number
  line: number
  status: 'allocating' | 'active' | 'freed' | 'leaked'
  opacity: number
}

type Props = {
  leaks: any[]
  code: string
}

export default function MemoryVisualizer({ leaks, code }: Props) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [bytesAllocated, setBytesAllocated] = useState(0)
  const [bytesLeaked, setBytesLeaked] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'allocating' | 'freeing' | 'done'>('idle')
  const animRef = useRef(false)

  const parseBlocks = () => {
    const lines = code.split('\n')
    const result: Block[] = []
    let id = 0

    lines.forEach((line, i) => {
      if (/\b(malloc|calloc|realloc|new\s)\b/.test(line)) {
        const varMatch = line.match(/\*?\s*(\w+)\s*=/)
        const sizeMatch = line.match(/malloc\s*\(\s*(\d+)/) || line.match(/\((\d+)\s*\*/)
        const size = sizeMatch ? parseInt(sizeMatch[1]) : 40
        const leakLine = leaks.find((l: any) => l.line === i + 1)

        result.push({
          id: id++,
          variable: varMatch ? varMatch[1] : `ptr${id}`,
          size,
          line: i + 1,
          status: 'allocating',
          opacity: 0
        })
      }
    })

    return result
  }

  const runAnimation = async () => {
    if (playing) return
    animRef.current = true
    setPlaying(true)
    setDone(false)
    setBlocks([])
    setBytesAllocated(0)
    setBytesLeaked(0)
    setPhase('allocating')

    const parsed = parseBlocks()
    if (parsed.length === 0) {
      setPlaying(false)
      return
    }

    // phase 1: allocate one by one
    for (let i = 0; i < parsed.length; i++) {
      if (!animRef.current) return
      await new Promise(r => setTimeout(r, 700))
      const block = { ...parsed[i], status: 'active' as const, opacity: 1 }
      setBlocks(prev => [...prev, block])
      setBytesAllocated(prev => prev + block.size)
    }

    await new Promise(r => setTimeout(r, 1000))
    setPhase('freeing')

    // phase 2: mark leaked vs freed
    const leakLines = new Set(leaks.map((l: any) => l.line))
    let leaked = 0

    for (let i = 0; i < parsed.length; i++) {
      if (!animRef.current) return
      await new Promise(r => setTimeout(r, 500))
      const isLeaked = leakLines.has(parsed[i].line)
      if (isLeaked) leaked += parsed[i].size

      setBlocks(prev => prev.map(b =>
        b.id === parsed[i].id
          ? { ...b, status: isLeaked ? 'leaked' : 'freed' }
          : b
      ))
    }

    setBytesLeaked(leaked)
    setPhase('done')
    setPlaying(false)
    setDone(true)
  }

  const reset = () => {
    animRef.current = false
    setBlocks([])
    setPlaying(false)
    setDone(false)
    setBytesAllocated(0)
    setBytesLeaked(0)
    setPhase('idle')
  }

  return (
    <div style={{ background: '#131520', borderRadius: '12px', border: '1px solid #1e2236', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e2236', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🧠</span>
          <p style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>
            Heap Memory Visualizer
          </p>
        </div>
        <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>
          {phase === 'idle' && 'Click to simulate'}
          {phase === 'allocating' && '⚡ Allocating memory...'}
          {phase === 'freeing' && '🔍 Checking for leaks...'}
          {phase === 'done' && '✅ Simulation complete'}
        </p>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Live stats */}
        {blocks.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ background: '#0d0f1a', padding: '10px 16px', borderRadius: '8px', border: '1px solid #7c3aed', flex: 1 }}>
              <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', margin: '0 0 4px' }}>Allocated</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#a78bfa', margin: 0 }}>{bytesAllocated} <span style={{ fontSize: '0.7rem' }}>bytes</span></p>
            </div>
            <div style={{ background: '#0d0f1a', padding: '10px 16px', borderRadius: '8px', border: '1px solid #10b981', flex: 1 }}>
              <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', margin: '0 0 4px' }}>Freed</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{bytesAllocated - bytesLeaked > 0 && done ? bytesAllocated - bytesLeaked : 0} <span style={{ fontSize: '0.7rem' }}>bytes</span></p>
            </div>
            <div style={{ background: '#0d0f1a', padding: '10px 16px', borderRadius: '8px', border: done && bytesLeaked > 0 ? '1px solid #ef4444' : '1px solid #1e2236', flex: 1 }}>
              <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', margin: '0 0 4px' }}>Leaked</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: done && bytesLeaked > 0 ? '#ef4444' : '#64748b', margin: 0 }}>{done ? bytesLeaked : '?'} <span style={{ fontSize: '0.7rem' }}>bytes</span></p>
            </div>
          </div>
        )}

        {/* Memory blocks */}
        {blocks.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
              HEAP — {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {blocks.map((block) => {
                const isLeaked = block.status === 'leaked'
                const isFreed = block.status === 'freed'
                const isActive = block.status === 'active'

                return (
                  <div
                    key={block.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: `2px solid ${isLeaked ? '#ef4444' : isFreed ? '#10b981' : '#7c3aed'}`,
                      background: isLeaked ? 'rgba(239,68,68,0.12)' : isFreed ? 'rgba(16,185,129,0.1)' : 'rgba(124,58,237,0.1)',
                      transition: 'all 0.4s ease',
                      minWidth: '90px',
                      animation: isLeaked ? 'shake 0.5s ease, pulse 1.5s infinite' : 'none',
                      opacity: block.opacity,
                      position: 'relative'
                    }}
                  >
                    {/* status icon */}
                    <div style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '0.8rem' }}>
                      {isLeaked ? '💀' : isFreed ? '✅' : ''}
                    </div>

                    <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isLeaked ? '#ef4444' : isFreed ? '#10b981' : '#a78bfa', margin: '0 0 4px' }}>
                      {block.variable}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 2px' }}>line {block.line}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 6px', fontWeight: 'bold' }}>{block.size} bytes</p>
                    <div style={{
                      fontSize: '0.6rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color: isLeaked ? '#ef4444' : isFreed ? '#10b981' : '#a78bfa',
                      letterSpacing: '0.05em'
                    }}>
                      {isLeaked ? '⚠ NEVER FREED' : isFreed ? 'FREED ✓' : 'ALLOCATED'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        {blocks.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7c3aed' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Allocated</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Freed ✓</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Leaked 💀</span>
            </div>
          </div>
        )}

        {/* Final banner */}
        {done && bytesLeaked > 0 && (
          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '2px solid #ef4444',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '16px',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease'
          }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ef4444', margin: '0 0 4px' }}>
              🔴 {bytesLeaked} bytes lost forever
            </p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              This memory was never returned to the OS. In a long-running program, this adds up!
            </p>
          </div>
        )}

        {done && bytesLeaked === 0 && (
          <div style={{
            background: 'rgba(16,185,129,0.1)',
            border: '2px solid #10b981',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
              ✅ All memory freed! Perfect code.
            </p>
          </div>
        )}

        {/* Buttons */}
        {!playing && phase === 'idle' && (
          <button onClick={runAnimation} style={{ background: 'linear-gradient(to right, #7c3aed, #ef4444)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', width: '100%' }}>
            ▶ Watch Memory Leak in Real Time
          </button>
        )}

        {playing && (
          <div style={{ textAlign: 'center', padding: '8px', color: '#64748b', fontSize: '0.85rem' }}>
            ⚡ Simulating...
          </div>
        )}

        {done && (
          <button onClick={reset} style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', width: '100%' }}>
            🔄 Replay Animation
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(239,68,68,0); }
          100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}