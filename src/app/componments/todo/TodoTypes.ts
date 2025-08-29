import {RootState} from "../rootReducer";
import {Dispatch} from "redux";
import {focusSubTodo, TodoItem, SubTodoItem} from "./todoSlice";
import {connect, ConnectedProps} from "react-redux";
import {VisibilityFilters} from "./visibilityFilterSlice";
import {todoSyncActions} from "./todoSyncActions";
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RootProps {
}

// 过滤后的Todo项目接口，只包含符合过滤条件的subtodo
export interface FilteredTodoItem extends Omit<TodoItem, 'subItems'> {
    subItems: SubTodoItem[];
    originalSubItems: SubTodoItem[]; // 保存原始的subItems用于编辑等操作
}

// 检查todo是否包含指定状态的subtodo
const hasSubtodosWithStatus = (todo: TodoItem, completed: boolean): boolean => {
    if (!todo.subItems || todo.subItems.length === 0) {
        return false;
    }
    return todo.subItems.some((subTodo: SubTodoItem) => subTodo.completed === completed && !subTodo.deleted);
};

// 根据filter过滤subtodo
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

// 检查todo是否应该根据filter显示
const shouldShowTodo = (todo: TodoItem, filter: VisibilityFilters): boolean => {
    if (todo.deleted) return false;
    
    switch (filter) {
        case VisibilityFilters.SHOW_ALL:
            return true;
        case VisibilityFilters.SHOW_COMPLETED:
            // 显示所有已完成的subtodo的todo，或者主todo已完成
            return todo.completed || hasSubtodosWithStatus(todo, true);
        case VisibilityFilters.SHOW_ACTIVE:
            // 显示所有包含未完成subtodo的todo，或者主todo未完成
            return !todo.completed || hasSubtodosWithStatus(todo, false);
        default:
            return true;
    }
};

const getVisibleTodos = (todos: TodoItem[], filter: VisibilityFilters): FilteredTodoItem[] => {
    const visibleTodos = todos.filter(todo => shouldShowTodo(todo, filter));
    
    // 为每个可见的todo创建过滤后的版本
    const result = visibleTodos.map(todo => {
        const filteredSubItems = filterSubtodos(todo.subItems, filter);
        //console.log(`[getVisibleTodos] Todo "${todo.text}": original subtodos: ${todo.subItems.length}, filtered subtodos: ${filteredSubItems.length}`);
        return {
            ...todo,
            subItems: filteredSubItems,
            originalSubItems: todo.subItems // 保存原始数据
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