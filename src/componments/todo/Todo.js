import React from 'react'
import PropTypes from 'prop-types'

const Todo = ({ onClick,onClickDelete,  completed, text}) => (
    <li onClick={onClick} style={{textDecoration: completed ? 'line-through' : 'none'}}>
        {text}  <a onClick={onClickDelete} className="delete"></a>
    </li>
)

Todo.protoTypes = {
    onClickDelete: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    completed: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
}

export default Todo
