import {RootState} from "../rootReducer";
import {Dispatch} from "redux";
import {focusSubTodo, TodoItem, SubTodoItem} from "./todoSlice";
import {connect, ConnectedProps} from "react-redux";
import {VisibilityFilters} from "./visibilityFilterSlice";
import {todoSyncActions} from "./todoSyncActions";
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RootProps {
}

// Filtered Todo item interface that only includes subtodos matching the filter
export interface FilteredTodoItem extends Omit<TodoItem, 'subItems'> {
    subItems: SubTodoItem[];
    originalSubItems: SubTodoItem[]; // Preserve original subItems for editing and other operations
}

// Check whether a todo contains subtodos with the specified status
const hasSubtodosWithStatus = (todo: TodoItem, completed: boolean): boolean => {
    if (!todo.subItems || todo.subItems.length === 0) {
        return false;
    }
    return todo.subItems.some((subTodo: SubTodoItem) => subTodo.completed === completed && !subTodo.deleted);
};

// Filter subtodos according to the filter
const filterSubtodos = (subItems: SubTodoItem[], filter: VisibilityFilters): SubTodoItem[] => {
    if (!subItems || subItems.length === 0) {
        return [];
    }
    
    switch (filter) {
        case VisibilityFilters.SHOW_ALL:
            return subItems.filter(subTodo => !subTodo.deleted);
        case VisibilityFilters.SHOW_COMPLETED:
            return subItems.filter(subTodo => subTodo.completed && !subTodo.deleted);
        case VisibilityFilters.SHOW_ACTIVE:
            return subItems.filter(subTodo => !subTodo.completed && !subTodo.deleted);
        default:
            return subItems.filter(subTodo => !subTodo.deleted);
    }
};

// Determine whether a todo should be displayed based on the filter
const shouldShowTodo = (todo: TodoItem, filter: VisibilityFilters): boolean => {
    if (todo.deleted) return false;
    
    switch (filter) {
        case VisibilityFilters.SHOW_ALL:
            return true;
        case VisibilityFilters.SHOW_COMPLETED:
            // Show todos with all subtodos completed, or if the main todo is completed
            return todo.completed || hasSubtodosWithStatus(todo, true);
        case VisibilityFilters.SHOW_ACTIVE:
            // Show todos containing unfinished subtodos, or if the main todo is incomplete
            return !todo.completed || hasSubtodosWithStatus(todo, false);
        default:
            return true;
    }
};

const getVisibleTodos = (todos: TodoItem[], filter: VisibilityFilters): FilteredTodoItem[] => {
    const visibleTodos = todos.filter(todo => shouldShowTodo(todo, filter));
    
    // Create a filtered version for each visible todo
    const result = visibleTodos.map(todo => {
        const filteredSubItems = filterSubtodos(todo.subItems, filter);
        //console.log(`[getVisibleTodos] Todo "${todo.text}": original subtodos: ${todo.subItems.length}, filtered subtodos: ${filteredSubItems.length}`);
        return {
            ...todo,
            subItems: filteredSubItems,
            originalSubItems: todo.subItems // Save original data
        };
    });
    
    //console.log(`[getVisibleTodos] Filter: ${filter}, Total todos: ${todos.length}, Visible todos: ${visibleTodos.length}, Filtered result: ${result.length}`);
    return result;
};

export const mapStateToProps = (state: RootState, ownProps: RootProps) => {
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
        onTodoClick: (id :string,checked: boolean) => {
            todoSyncActions.toggleTodo(id, checked);
        },
        onTodoClickDelete: (id :string) => {
            todoSyncActions.deleteTodo(id);
        },
        onTodoClickEditTodo: (id: string, text: string) => {
            todoSyncActions.editTodo(id, text);
        },
        onTodoClickSub: (id :string, subId:string,checked: boolean) => {
            todoSyncActions.toggleSubTodo(id, subId, checked);
        },
        onTodoClickDeleteSub: (id :string, subId:string) => {
            todoSyncActions.deleteSubTodo(id, subId);
        },
        onTodoClickAddSub: (id :string, text:string, startTime?: string, endTime?: string, description?: string) => {
            todoSyncActions.addSubTodo(id, text, startTime, endTime, description);
        },
        onTodoClickEditSub: (id :string, subId:string, text:string, startTime?: string, endTime?: string, description?: string) => {
            todoSyncActions.editSubTodo(id, subId, text, startTime, endTime, description);
        },
    };
};

const connector = connect(mapStateToProps, mapDispatchToProps)
export type PropsFromRedux = ConnectedProps<typeof connector>