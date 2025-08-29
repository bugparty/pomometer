import React, {FormEvent, useRef, useState} from "react";
import {Modal, Checkbox, Input, Button} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined, HolderOutlined, AimOutlined, EyeOutlined} from "@ant-design/icons";
import {WrappedComponentProps} from "react-intl"
import {TodoItem, SubTodoItem} from "./todoSlice";
import {PropsFromRedux, FilteredTodoItem} from "./TodoTypes"
import "./Todo.css";

// Simplified Todo item component
const TodoItemComponent: React.FC<{
  todo: FilteredTodoItem;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onSubToggle: (parentId: string, subId: string, completed: boolean) => void;
  onSubDelete: (parentId: string, subId: string) => void;
  onSubAdd: (parentId: string, text: string, description?: string) => void;
  onSubEdit: (parentId: string, sub: SubTodoItem) => void;
  editingParentId?: string;
  editingSubId?: string;
  focusTodoId?: string;
  focusSubTodoId?: string;
  onSubFocus: (parentId: string, subId: string | undefined) => void;
  onTodoEdit: (id: string, text: string) => void;
}> = ({ todo, onToggle, onDelete, onSubToggle, onSubDelete, onSubAdd, onSubEdit, editingParentId, editingSubId, focusTodoId, focusSubTodoId, onSubFocus, onTodoEdit }) => {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newSubtaskDesc, setNewSubtaskDesc] = useState('');
  const addInputsRef = useRef<HTMLDivElement>(null);

  const closeAddInputs = () => {
    setIsAddingSubtask(false);
    setNewSubtaskText('');
    setNewSubtaskDesc('');
  };

  const handleAddSubtask = () => {
    const title = newSubtaskText.trim();
    const description = newSubtaskDesc.trim();
    if (title) {
      onSubAdd(todo.id, title, description || undefined);
      closeAddInputs();
    }
  };

  const handleContainerBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
    // Close if the new focus is outside the input container
    const next = e.relatedTarget as Node | null;
    if (next && addInputsRef.current && addInputsRef.current.contains(next)) {
      return;
    }
    // Close without submitting
    closeAddInputs();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeAddInputs();
    }
  };

  return (
    <div data-testid="todo-item" className={`google-todo-item ${todo.completed ? 'completed' : ''}`}>
      {/* Main task row */}
      <div className="todo-main-row">
        <AimOutlined
          className={`todo-focus-icon ${focusTodoId === todo.id && !focusSubTodoId ? 'focused' : ''}`}
        />
        <Checkbox
          data-testid="todo-checkbox"
          checked={todo.completed}
          onChange={(e) => onToggle(todo.id, e.target.checked)}
          className="todo-checkbox"
        />

        <span
          data-testid="todo-text"
          className={`todo-text ${todo.completed ? 'completed-text' : ''}`}
          onClick={() => onTodoEdit(todo.id, todo.text)}
        >
          {todo.text}
        </span>

        <div className="todo-actions">
          <Button
            data-testid="add-subtodo-button"
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setIsAddingSubtask(true)}
            className="action-button"
          />
          <Button
            data-testid="todo-delete-button"
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(todo.id)}
            className="action-button delete-button"
          />
          <Button
            data-testid="todo-focus-button"
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onSubFocus(
              todo.id,
              (focusTodoId === todo.id && !focusSubTodoId) ? undefined : undefined
            )}
            className="todo-focus-button"
          />
        </div>
      </div>

      {/* Subtask list */}
      {todo.subItems && todo.subItems.length > 0 && (
        <div className="subtasks-container">
          {todo.subItems.map((subItem) => (
            (editingParentId === todo.id && editingSubId === subItem.id) ? null : (
            <div data-testid="subtodo-item" key={subItem.id} className={`subtask-row ${subItem.completed ? 'completed' : ''}`}>
              <div className="subtask-indent" />
              <AimOutlined
                data-testid="subtodo-focus-icon"
                className={`subtask-focus-icon ${focusTodoId === todo.id && focusSubTodoId === subItem.id ? 'focused' : ''}`}
              />
              <Checkbox
                data-testid="subtodo-checkbox"
                checked={subItem.completed}
                onChange={(e) => onSubToggle(todo.id, subItem.id, e.target.checked)}
                className="subtask-checkbox"
              />
              <div className="subtask-texts" onClick={() => onSubEdit(todo.id, subItem)}>
                <span data-testid="subtodo-text" className={`subtask-text ${subItem.completed ? 'completed-text' : ''}`}>
                  {subItem.text}
                </span>
                {subItem.description && (
                  <span className="subtask-detail">
                    {subItem.description}
                  </span>
                )}
              </div>
              <Button
                data-testid="subtodo-delete-button"
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onSubDelete(todo.id, subItem.id)}
                className="subtask-delete-button"
              />
              <Button
                data-testid="subtodo-focus-button"
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onSubFocus(
                  todo.id,
                  (focusTodoId === todo.id && focusSubTodoId === subItem.id) ? undefined : subItem.id
                )}
                className="subtask-focus-button"
              />
            </div>
            )
          ))}
        </div>
      )}

      {/* Add subtask input: title + details */}
      {isAddingSubtask && (
        <div className="add-subtask-row">
          <div className="subtask-indent" />
          <div className="add-subtask-inputs" ref={addInputsRef} onBlur={handleContainerBlur}>
            <Input
              data-testid="subtodo-input"
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              onPressEnter={handleAddSubtask}
              onKeyDown={handleKeyDown}
              placeholder="Add a subtask title"
              className="add-subtask-input"
              autoFocus
            />
            <div className="add-subtask-detail-row">
              <HolderOutlined className="add-subtask-detail-icon" />
              <Input
                data-testid="subtodo-desc-input"
                value={newSubtaskDesc}
                onChange={(e) => setNewSubtaskDesc(e.target.value)}
                onPressEnter={handleAddSubtask}
                onKeyDown={handleKeyDown}
                placeholder="Details"
                className="add-subtask-input add-subtask-desc"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TodoListProps {
    focusTodo: string | undefined,
    focusSubTodo: string | undefined,
    todos: FilteredTodoItem[],
}

type Props = PropsFromRedux & TodoListProps & WrappedComponentProps<"intl">

interface TodoListState {
  deleteOpen: boolean;
  deleteId: string;
  editParentId: string;
  editSubId: string;
  editTitle: string;
  editDescription: string;
  editingTodoId: string;
  editingTodoTitle: string;
}

class TodoList extends React.Component<Props, TodoListState> {
  private editInputsRef: React.RefObject<HTMLDivElement | null>;
  private todoEditRef: React.RefObject<HTMLDivElement | null>;

  constructor(props: (Props) | Readonly<Props>) {
    super(props);
    this.state = {
      deleteOpen: false,
      deleteId: '',
      editParentId: '',
      editSubId: '',
      editTitle: '',
      editDescription: '',
      editingTodoId: '',
      editingTodoTitle: '',
    };
    this.editInputsRef = React.createRef<HTMLDivElement>();
    this.todoEditRef = React.createRef<HTMLDivElement>();
  }

  handleDeleteConfirm = () => {
    this.props.onTodoClickDelete(this.state.deleteId);
    this.setState({
      deleteOpen: false,
      deleteId: '',
    });
  };

  handleDeleteCancel = () => {
    this.setState({
      deleteOpen: false,
      deleteId: '',
    });
  };

  showDeleteModal = (id: string) => {
    this.setState({
      deleteOpen: true,
      deleteId: id,
    });
  };

  // Open inline editing for a subtask
  showEditSubtaskModal = (parentId: string, sub: SubTodoItem) => {
    this.setState({
      editParentId: parentId,
      editSubId: sub.id,
      editTitle: sub.text,
      editDescription: sub.description || '',
    });
  };

  // Save edit
  saveInlineEdit = () => {
    const { editParentId, editSubId, editTitle, editDescription } = this.state;
    if (editParentId && editSubId && editTitle.trim()) {
      this.props.onTodoClickEditSub(editParentId, editSubId, editTitle.trim(), undefined, undefined, editDescription.trim() || undefined);
    }
    this.cancelInlineEdit();
  };

  // Cancel edit
  cancelInlineEdit = () => {
    this.setState({
      editParentId: '',
      editSubId: '',
      editTitle: '',
      editDescription: '',
    });
  };

  // Save when losing focus
  handleInlineContainerBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
    const next = e.relatedTarget as Node | null;
    if (next && this.editInputsRef.current && this.editInputsRef.current.contains(next)) {
      return;
    }
    this.saveInlineEdit();
  };

  handleInlineKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.cancelInlineEdit();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      this.saveInlineEdit();
    }
  };

  // ===== Main task inline editing =====
  startInlineEditTodo = (todoId: string, currentText: string) => {
    this.setState({ editingTodoId: todoId, editingTodoTitle: currentText });
  };
  isEditingTodo = (todoId: string) => this.state.editingTodoId === todoId;
  handleTodoEditKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.setState({ editingTodoId: '', editingTodoTitle: '' });
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      this.saveTodoEdit();
    }
  };
  handleTodoEditBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
    const next = e.relatedTarget as Node | null;
    if (next && this.todoEditRef.current && this.todoEditRef.current.contains(next)) return;
    this.saveTodoEdit();
  };
  saveTodoEdit = () => {
    const { editingTodoId, editingTodoTitle } = this.state;
    if (editingTodoId && editingTodoTitle.trim()) {
      this.props.onTodoClickEditTodo(editingTodoId, editingTodoTitle.trim());
    }
    this.setState({ editingTodoId: '', editingTodoTitle: '' });
  };

  handleToggleTodo = (id: string, completed: boolean) => {
    this.props.onTodoClick(id, completed);
  };

  handleSubToggle = (parentId: string, subId: string, completed: boolean) => {
    this.props.onTodoClickSub(parentId, subId, completed);
  };

  handleSubDelete = (parentId: string, subId: string) => {
    this.props.onTodoClickDeleteSub(parentId, subId);
  };

  handleSubAdd = (parentId: string, text: string, description?: string) => {
    this.props.onTodoClickAddSub(parentId, text, undefined, undefined, description);
  };

  render() {
    const { intl, todos } = this.props;

    // Separate completed and incomplete tasks
    const activeTodos = todos.filter(todo => !todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);

    return (
      <div className="google-todo-list">
        {/* Delete confirmation modal */}
        <Modal
          title={intl.formatMessage({id:"todo_list.confirm_delete", defaultMessage:"Confirm Delete?"})}
          open={this.state.deleteOpen}
          onOk={this.handleDeleteConfirm}
          onCancel={this.handleDeleteCancel}
          okButtonProps={{ 'data-testid': 'confirm-delete-todo' }}
          okText={intl.formatMessage({id:"common.delete", defaultMessage:"Delete"})}
          cancelText={intl.formatMessage({id:"common.cancel", defaultMessage:"Cancel"})}
        />

        {/* Active task list */}
        <div className="active-todos">
          {activeTodos.map((todo) => (
            <div key={todo.id}>
              {/* Subtask list rendering with inline editing */}
              <div className={`google-todo-item ${todo.completed ? 'completed' : ''}`}>
                {/* Reuse the above TodoItemComponent; use the component directly with onSubEdit */}
                <TodoItemComponent
                  todo={todo}
                  onToggle={this.handleToggleTodo}
                  onDelete={this.showDeleteModal}
                  onSubToggle={this.handleSubToggle}
                  onSubDelete={this.handleSubDelete}
                  onSubAdd={this.handleSubAdd}
                  onSubEdit={this.showEditSubtaskModal}
                  editingParentId={this.state.editParentId}
                  editingSubId={this.state.editSubId}
                  focusTodoId={this.props.focusTodo}
                  focusSubTodoId={this.props.focusSubTodo}
                  onSubFocus={this.props.onTodoClickFocus}
                  onTodoEdit={this.startInlineEditTodo}
                />
                {this.isEditingTodo(todo.id) && (
                  <div className="add-subtask-row">
                    <div className="subtask-indent" />
                    <div className="add-subtask-inputs" ref={this.todoEditRef} onBlur={this.handleTodoEditBlur}>
                      <Input
                        value={this.state.editingTodoTitle}
                        onChange={(e) => this.setState({editingTodoTitle: e.target.value})}
                        onKeyDown={this.handleTodoEditKeyDown}
                        placeholder={intl.formatMessage({id: 'todo.subtask.title', defaultMessage: 'Title'})}
                        className="add-subtask-input"
                        autoFocus
                      />
                    </div>
                  </div>
                )}
                {/* If a subtask under the current todo is being edited, show an input instead */}
                {todo.subItems && todo.subItems.map(sub => (
                  (this.state.editParentId === todo.id && this.state.editSubId === sub.id) && (
                    <div key={`${sub.id}-editor`} className="subtask-row" style={{paddingTop: 0}}>
                      <div className="subtask-indent" />
                      <div className="subtask-checkbox" />
                      <div className="add-subtask-inputs" ref={this.editInputsRef} onBlur={this.handleInlineContainerBlur}>
                        <Input
                          data-testid="edit-subtodo-title"
                          value={this.state.editTitle}
                          onChange={(e) => this.setState({editTitle: e.target.value})}
                          onKeyDown={this.handleInlineKeyDown}
                          placeholder={intl.formatMessage({id: 'todo.subtask.title', defaultMessage: 'Title'})}
                          className="add-subtask-input"
                          autoFocus
                        />
                        <div className="add-subtask-detail-row">
                          <HolderOutlined className="add-subtask-detail-icon" />
                          <Input
                            data-testid="edit-subtodo-description"
                            value={this.state.editDescription}
                            onChange={(e) => this.setState({editDescription: e.target.value})}
                            onKeyDown={this.handleInlineKeyDown}
                            placeholder={intl.formatMessage({id: 'todo.subtask.description', defaultMessage: 'Description'})}
                            className="add-subtask-input add-subtask-desc"
                          />
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Completed task list */}
        {completedTodos.length > 0 && (
          <div className="completed-section">
            <div className="completed-header">
              <span className="completed-title">
                {intl.formatMessage(
                  {id:"todo_list.completed_count", defaultMessage:"Completed ({count})"},
                  {count: completedTodos.length}
                )}
              </span>
            </div>
            <div className="completed-todos">
              {completedTodos.map((todo) => (
                <div key={todo.id}>
                  <TodoItemComponent
                    todo={todo}
                    onToggle={this.handleToggleTodo}
                    onDelete={this.showDeleteModal}
                    onSubToggle={this.handleSubToggle}
                    onSubDelete={this.handleSubDelete}
                    onSubAdd={this.handleSubAdd}
                    onSubEdit={this.showEditSubtaskModal}
                    editingParentId={this.state.editParentId}
                    editingSubId={this.state.editSubId}
                    focusTodoId={this.props.focusTodo}
                    focusSubTodoId={this.props.focusSubTodo}
                    onSubFocus={this.props.onTodoClickFocus}
                    onTodoEdit={this.startInlineEditTodo}
                  />
                  {this.isEditingTodo(todo.id) && (
                    <div className="add-subtask-row">
                      <div className="subtask-indent" />
                      <div className="add-subtask-inputs" ref={this.todoEditRef} onBlur={this.handleTodoEditBlur}>
                        <Input
                          value={this.state.editingTodoTitle}
                          onChange={(e) => this.setState({editingTodoTitle: e.target.value})}
                          onKeyDown={this.handleTodoEditKeyDown}
                          placeholder={intl.formatMessage({id: 'todo.subtask.title', defaultMessage: 'Title'})}
                          className="add-subtask-input"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {todos.length === 0 && (
          <div className="empty-todo-state">
            <div className="empty-icon">📝</div>
            <h3 className="empty-title">
              {intl.formatMessage({id:"todo_list.no_tasks", defaultMessage:"No tasks yet"})}
            </h3>
            <p className="empty-description">
              {intl.formatMessage({
                id:"todo_list.add_first_task", 
                defaultMessage:"Add your first task above to get started with your productivity journey!"
              })}
            </p>
          </div>
        )}
      </div>
    );
  }
}


export default TodoList;
