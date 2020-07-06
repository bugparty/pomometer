import React from 'react'
import PropTypes from 'prop-types'
import Todo from './Todo'

const TodoList = ({todos, onTodoClick, onTodoClickDelete}) => (
    <ul>
        {todos.length > 0 && todos.map((todo, index) => (
            <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)}
                  createdDate={todo.createdDate}
                  onClickDelete={e => {
                      e.stopPropagation()
                      onTodoClickDelete(todo.id)
                  }} />
        ))}
        {todos.length === 0 && <p>No todo item</p>}
    </ul>
)

TodoList.propTypes = {
    todos: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            completed: PropTypes.bool.isRequired,
            text: PropTypes.string.isRequired
        }).isRequired
    ).isRequired,
    onTodoClick: PropTypes.func.isRequired
}

export default TodoList