import { connect } from "react-redux";
import {
  addSubTodo,
  deleteSubTodo,
  deleteTodo,
  focusSubTodo,
  toggleSubTodo,
  toggleTodo,
} from "../todoSlice";
import TodoList from "../TodoList";
import { VisibilityFilters } from "../visibilityFilterSlice";

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case VisibilityFilters.SHOW_ALL:
      return todos;
    case VisibilityFilters.SHOW_COMPLETED:
      return todos.filter((t) => t.completed);
    case VisibilityFilters.SHOW_ACTIVE:
      return todos.filter((t) => !t.completed);
    default:
      return todos;
  }
};

const mapStateToProps = (state) => {
  return {
    focusTodo: state.todos.focusTodo,
    focusSubTodo: state.todos.focusSubTodo,
    todos: getVisibleTodos(state.todos.todos, state.visibilityFilter),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onTodoClickFocus: (id, subId) => {
      dispatch(focusSubTodo(id, subId));
    },
    onTodoClick: (id) => {
      dispatch(toggleTodo(id));
    },
    onTodoClickDelete: (id) => {
      dispatch(deleteTodo(id));
    },
    onTodoClickSub: (id, subId) => {
      dispatch(toggleSubTodo(id, subId));
    },
    onTodoClickDeleteSub: (id, subId) => {
      dispatch(deleteSubTodo(id, subId));
    },
    onTodoClickAddSub: (id, text) => {
      dispatch(addSubTodo(id, text));
    },
  };
};

const VisibleTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList);

export default VisibleTodoList;
