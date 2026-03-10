import '../styles/AssignmentCard.scss'
import { useNavigate } from 'react-router-dom'

function AssignmentCard({ assignment }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/assignment/${assignment._id}`)
  }

  return (
    <div className="card" onClick={handleClick}>
      <span className={`card__badge card__badge--${assignment.description}`}>
        {assignment.description}
      </span>
      <h3 className="card__title">{assignment.title}</h3>
      <p className="card__question">{assignment.question}</p>
      <div className="card__footer">
        Added {new Date(assignment.createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}

export default AssignmentCard