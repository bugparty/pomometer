import React, {FormEvent} from "react";
import {Collapse, Modal} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {WrappedComponentProps} from "react-intl"
import {ExpandIconPosition} from "antd/lib/collapse/Collapse";
import {TodoItem} from "./todoSlice";
import {Todo} from "./Todo";
import {PropsFromRedux} from "./TodoTypes"

const { Panel } = Collapse;
const genExtra = (that: TodoList, id:string) => (
  <DeleteOutlined
    onClick={(event) => {
      // If you don't want click extra trigger collapse, you can prevent this:
      that.setState({
        deleteId: id,
        deleteVisible: true,
      });
      event.stopPropagation();
    }}
  />
);
interface TodoListProps {
    focusTodo: string | undefined,
    focusSubTodo: string | undefined,
    todos: TodoItem[],
}
type Props = PropsFromRedux & TodoListProps & WrappedComponentProps<"intl">
class TodoList extends React.Component<Props , any> {
  constructor(props: (Props) | Readonly<Props>) {
    super(props);
    this.state = {
      deleteVisible: false,
    };
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.expandIconPosition = this.expandIconPosition.bind(this);

  }
  handleOk = (e: FormEvent) => {
    this.props.onTodoClickDelete(this.state.deleteId);
    this.setState({
      deleteVisible: false,
    });
  };

  handleCancel = (e: FormEvent) => {
    this.setState({
      deleteVisible: false,
    });
  };
  onPositionChange = (expandIconPosition: ExpandIconPosition) => {
    this.setState({ expandIconPosition });
  };
  callback = (e: any) => {};
  expandIconPosition = (e:ExpandIconPosition) => {};
  render() {
      const {intl} = this.props;

      // @ts-ignore
      return (
      <div>
        <Modal
          title={intl.formatMessage({id:"todo_list.confirm_delete", defaultMessage:"Confirm Delete?"})}
          visible={this.state.deleteVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        />
        <Collapse
          defaultActiveKey={["1"]}
          onChange={this.callback}
            // @ts-ignore
          expandIconPosition={this.expandIconPosition}
        >
          {this.props.todos.length > 0 &&
            this.props.todos.map((todo, index) => (
              <Panel
                header={todo.text}
                key={todo.id}
                extra={genExtra(this, todo.id)}
              >

                <Todo
                    {...todo}
                    {...this.props}
                    onClick={() => this.props.onTodoClick(todo.id, !todo.completed)}
                    createdDate={todo.createdDate}
                />
              </Panel>
            ))}
          {this.props.todos.length === 0 && <p>No todo item</p>}
        </Collapse>
      </div>
    );
  }
}


export default TodoList;
