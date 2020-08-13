import { connect } from 'react-redux'
import {toggleTodo, deleteTodo, deleteSubTodo, toggleSubTodo, addSubTodo} from "../todoSlice"
import TodoList from "../TodoList"
import { VisibilityFilters} from "../visibilityFilterSlice";

const getVisibleTodos = (todos, filter) => {
    switch (filter) {
        case VisibilityFilters.SHOW_ALL:
            return todos
        case VisibilityFilters.SHOW_COMPLETED:
            return todos.filter(t => t.completed)
        case VisibilityFilters.SHOW_ACTIVE:
            return todos.filter(t => !t.completed)
        default:
            return todos
    }
}

const mapStateToProps = state => {
    return {
        todos: getVisibleTodos(state.todos, state.visibilityFilter)
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onTodoClick: id => {
            dispatch(toggleTodo(id))
        },
        onTodoClickDelete: id => {
            dispatch(deleteTodo(id))
        },
        onTodoClickSub: (id, subId) =>{
            dispatch(toggleSubTodo(id, subId))
        },
        onTodoClickDeleteSub: (id, subId) => {
            dispatch(deleteSubTodo(id, subId))
        },
        onTodoClickAddSub: (id, text) => {
            dispatch(addSubTodo(id, text))
        }
    }
}

const VisibleTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList)

export default VisibleTodoList
