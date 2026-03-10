import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Editor from '@monaco-editor/react'
import '../styles/AttemptPage.scss'

function AttemptPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('-- write your SQL query here\n')
  const [results, setResults] = useState(null)
  const [resultError, setResultError] = useState(null)
  const [running, setRunning] = useState(false)
  const [hint, setHint] = useState(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    axios.get(`http://localhost:5000/api/assignments/${id}`)
      .then(res => {
        setAssignment(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const runQuery = async () => {
    setRunning(true)
    setResults(null)
    setResultError(null)
    try {
      const res = await axios.post('http://localhost:5000/api/query/run', {
        query,
        assignmentId: id
      })
      setResults(res.data.rows)
    } catch (err) {
      setResultError(err.response?.data?.error || 'Query failed')
    }
    setRunning(false)
  }

  const getHint = async () => {
    setShowHint(true)
    setHintLoading(true)
    setHint(null)
    try {
      const res = await axios.post('http://localhost:5000/api/hint', {
        question: assignment.question,
        query
      })
      setHint(res.data.hint)
    } catch {
      setHint('Could not load hint. Please try again.')
    }
    setHintLoading(false)
  }

  if (loading) return <div style={{color:'#94a3b8', padding:'40px', background:'#0f172a', minHeight:'100vh'}}>Loading...</div>
  if (!assignment) return <div style={{color:'#ef4444', padding:'40px', background:'#0f172a', minHeight:'100vh'}}>Assignment not found</div>

  return (
    <div className="attempt">
      <button className="attempt__back" onClick={() => navigate('/')}>
        ← Back to assignments
      </button>

      <div className="attempt__layout">
        {/* LEFT PANEL */}
        <div className="attempt__left">
          <div className="question">
            <span className={`question__badge question__badge--${assignment.description}`}>
              {assignment.description}
            </span>
            <h2 className="question__title">{assignment.title}</h2>
            <p className="question__text">{assignment.question}</p>
          </div>

          <div className="tables">
            <p className="tables__heading">Sample Data</p>
            {assignment.sampleTables?.map((table, i) => (
              <div key={i} className="tables__table-wrap">
                <p className="tables__table-name">{table.tableName}</p>
                <table>
                  <thead>
                    <tr>
                      {table.columns.map((col, j) => (
                        <th key={j}>{col.columnName}<br/><span style={{fontWeight:400, fontSize:'0.75rem'}}>{col.dataType}</span></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows?.map((row, k) => (
                      <tr key={k}>
                        {table.columns.map((col, j) => (
                          <td key={j}>{row[col.columnName] ?? '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="attempt__right">
          <div className="editor">
            <div className="editor__toolbar">
              <span className="editor__label">SQL Editor</span>
              <div className="editor__actions">
                <button className="editor__hint-btn" onClick={getHint} disabled={hintLoading}>
                  💡 Get Hint
                </button>
                <button className="editor__run-btn" onClick={runQuery} disabled={running}>
                  {running ? 'Running...' : '▶ Run Query'}
                </button>
              </div>
            </div>
            <Editor
              height="340px"
              language="sql"
              theme="vs-dark"
              value={query}
              onChange={val => setQuery(val)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
            />
          </div>

          <div className="results">
            <p className="results__heading">Results</p>
            {!results && !resultError && <p className="results__empty">Run a query to see results</p>}
            {resultError && <p className="results__error">{resultError}</p>}
            {results && results.length === 0 && <p className="results__empty">Query ran successfully — no rows returned</p>}
            {results && results.length > 0 && (
              <table>
                <thead>
                  <tr>{Object.keys(results[0]).map(k => <th key={k}>{k}</th>)}</tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((v, j) => <td key={j}>{String(v)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* HINT MODAL */}
      {showHint && (
        <div className="hint">
          <div className="hint__box">
            <p className="hint__title">💡 Hint</p>
            {hintLoading
              ? <p className="hint__loading">Thinking...</p>
              : <p className="hint__text">{hint}</p>
            }
            <button className="hint__close" onClick={() => setShowHint(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttemptPage