import { useEffect, useState } from 'react'
import axios from 'axios'
import AssignmentCard from '../components/AssignmentCard'
import '../styles/HomePage.scss'

function HomePage() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:5000/api/assignments')
      .then(res => {
        setAssignments(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Could not load assignments')
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="home__loading">Loading assignments...</div>
  if (error) return <div className="home__error">{error}</div>

  return (
    <div className="home">
      <div className="home__header">
        <h1>Cipher<span>SQL</span>Studio</h1>
        <p>Pick an assignment and start writing queries</p>
      </div>
      <div className="home__grid">
        {assignments.map(a => (
          <AssignmentCard key={a._id} assignment={a} />
        ))}
      </div>
    </div>
  )
}

export default HomePage