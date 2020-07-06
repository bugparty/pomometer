import React from 'react'
import PropTypes from 'prop-types'

const Todo = ({ onClick,onClickDelete,  completed, text, createdDate}) => (
    <div className="card">
        <header className="card-header">
            <p className="card-header-title" onClick={onClick}  style={{textDecoration: completed ? 'line-through' : 'none'}}>
               {text}
            </p>
            <a href="_blank" className="card-header-icon" aria-label="more options">
      <span className="icon">
        <i className="fas fa-angle-down" aria-hidden="true"></i>
      </span>
            </a>
        </header>
        <div className="card-content">
            <div className="content">
                <a href="#">@bulmaio</a>. <a href="#">#css</a> <a href="#">#responsive</a>
                <br/>
                    <time dateTime={createdDate}>{(new Date(createdDate)).toLocaleString()}</time>
            </div>
        </div>
        <footer className="card-footer">
            <a href="_blank" className="card-footer-item" onClick={onClick} >Done</a>
            <a href="_blank" className="card-footer-item"  >Focus</a>
            <a href="_blank" className="card-footer-item">Edit</a>
            <a href="_blank" className="card-footer-item" onClick={onClickDelete}>Delete</a>
        </footer>
    </div>
)

Todo.protoTypes = {
    onClickDelete: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    completed: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
}

export default Todo
