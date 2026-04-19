import { useState } from 'react'

type Question = {
  question: string
  options: string[]
  correct: number
  explanation: string
}

type Props = {
  leaks: any[]
  code: string
}

export default function QuizMode({ leaks, code }: Props) {
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)

  const generateQuiz = async () => {
    setLoading(true)
    setQuizStarted(true)
    setSubmitted(false)
    setAnswers({})

    try {
      const response = await fetch('http://localhost:8000/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaks, code }),
      })
      const data = await response.json()
      setQuestions(data.questions)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correct).length
    : 0

  return (
    <div style={{ background: '#131520', borderRadius: '12px', border: '1px solid #1e2236', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e2236', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎓</span>
          <p style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>
            Quiz Mode
          </p>
        </div>
        {submitted && (
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: score === questions.length ? '#10b981' : score >= questions.length / 2 ? '#f59e0b' : '#ef4444' }}>
            {score}/{questions.length} correct
          </span>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        {!quizStarted && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🧠</p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
              Think you understand what went wrong?<br />Test your knowledge with an AI-generated quiz!
            </p>
            <button
              onClick={generateQuiz}
              style={{ background: 'linear-gradient(to right, #7c3aed, #10b981)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              🎯 Quiz Me on This Leak!
            </button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🤔 Claude is generating your quiz...</p>
          </div>
        )}

        {!loading && questions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {questions.map((q, i) => (
              <div key={i} style={{ background: '#0d0f1a', borderRadius: '8px', padding: '16px', border: '1px solid #1e2236' }}>
                <p style={{ fontWeight: '700', fontSize: '0.95rem', color: '#e2e8f0', marginBottom: '12px' }}>
                  {i + 1}. {q.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options.map((option, j) => {
                    let bg = '#131520'
                    let border = '#1e2236'
                    let color = '#94a3b8'

                    if (submitted) {
                      if (j === q.correct) { bg = 'rgba(16,185,129,0.15)'; border = '#10b981'; color = '#10b981' }
                      else if (answers[i] === j && j !== q.correct) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#ef4444' }
                    } else if (answers[i] === j) {
                      bg = 'rgba(124,58,237,0.15)'; border = '#7c3aed'; color = '#a78bfa'
                    }

                    return (
                      <button
                        key={j}
                        onClick={() => !submitted && setAnswers({ ...answers, [i]: j })}
                        style={{ background: bg, border: `1px solid ${border}`, color, padding: '10px 14px', borderRadius: '8px', cursor: submitted ? 'default' : 'pointer', textAlign: 'left', fontSize: '0.85rem', transition: 'all 0.2s' }}
                      >
                        {String.fromCharCode(65 + j)}. {option}
                      </button>
                    )
                  })}
                </div>
                {submitted && (
                  <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#a78bfa', fontStyle: 'italic' }}>
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}

            {!submitted && Object.keys(answers).length === questions.length && (
              <button
                onClick={() => setSubmitted(true)}
                style={{ background: '#10b981', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
              >
                Submit Answers 🎯
              </button>
            )}

            {submitted && (
              <button
                onClick={generateQuiz}
                style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                🔄 Try Another Quiz
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}