import {RootState} from "../store";
import {Dispatch} from "redux";
import {addSubTodo, deleteSubTodo, deleteTodo, focusSubTodo, TodoItem, toggleSubTodo, toggleTodo} from "./todoSlice";
import {connect, ConnectedProps} from "react-redux";
import {VisibilityFilters} from "./visibilityFilterSlice";
export interface RootProps {
}
const getVisibleTodos = (todos:TodoItem[], filter:VisibilityFilters) => {
    switch (filter) {
        case VisibilityFilters.SHOW_ALL:
            return todos.filter((t) => !t.deleted);
        case VisibilityFilters.SHOW_COMPLETED:
            return todos.filter((t) => t.completed && !t.deleted);
        case VisibilityFilters.SHOW_ACTIVE:
            return todos.filter((t) => !t.completed && !t.deleted);
        default:
            return todos;
    }
};
export const mapStateToProps = (state:RootState, ownProps: RootProps) => {
    return {
        focusTodo: state.todos.focusTodo,
        focusSubTodo: state.todos.focusSubTodo,
        todos: getVisibleTodos(state.todos.todos, state.visibilityFilter.filter),
    };
};

export const mapDispatchToProps = (dispatch:Dispatch, ownProps: RootProps) => {
    return {
        onTodoClickFocus: (id :string, subId:string | undefined) => {
            dispatch(focusSubTodo(id, subId));
        },
        onTodoClick: (id :string) => {
            dispatch(toggleTodo(id));
        },
        onTodoClickDelete: (id :string) => {
            dispatch(deleteTodo(id));
        },
        onTodoClickSub: (id :string, subId:string) => {
            dispatch(toggleSubTodo(id, subId));
        },
        onTodoClickDeleteSub: (id :string, subId:string) => {
            dispatch(deleteSubTodo(id, subId));
        },
        onTodoClickAddSub: (id :string, text:string) => {
            dispatch(addSubTodo(id, text));
        },
    };
};

const connector = connect(mapStateToProps, mapDispatchToProps)
export type PropsFromRedux = ConnectedProps<typeof connector>