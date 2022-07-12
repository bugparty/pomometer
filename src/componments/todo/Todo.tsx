import React, {useState} from "react";
import {Button, Checkbox, Form, Input} from "antd";
import {AimOutlined} from "@ant-design/icons";
import {FormattedMessage, useIntl} from "react-intl";
import {SubTodoItem} from "./todoSlice";
import {PropsFromRedux, RootProps} from "./TodoTypes";


type Props = PropsFromRedux & RootProps & {
    onClick: ()=> void,
    subItems: SubTodoItem[],
    completed: boolean,
    text: string,
    createdDate: string,
    id: string,
}
const SubTodo: React.FC<{
    onTodoClickSub: () => void,
    onTodoClickDeleteSub: () => void,
    onTodoClickFocus: () => void,
    completed: boolean,
    text: string,
    createdDate: string,
    id: string,
    onFocus: boolean,
}> = ({
          onTodoClickSub,
          onTodoClickDeleteSub,
          onTodoClickFocus,
          completed,
          text,
          createdDate,
          id,
          onFocus,
      }) => (
    <div className="sub_todo">
        <AimOutlined style={{visibility: onFocus ? "visible" : "hidden"}}/>
        <Checkbox onClick={onTodoClickSub} checked={completed}>
            {text}
        </Checkbox>
        <Button onClick={onTodoClickDeleteSub}>
            <FormattedMessage id="todo.subtodo.delete" defaultMessage="Delete"/></Button>
        <Button onClick={onTodoClickFocus}><FormattedMessage id="todo.subtodo.Focus" defaultMessage="Focus"/></Button>
    </div>
);
const DefaultSubTodo: React.FC<{
    onTodoClick: () => void,
    completed: boolean,
    text: string,
    onFocus: boolean,
    onTodoClickFocus: () => void
}> = ({
          onTodoClick,
          completed,
          text,
          onFocus,
          onTodoClickFocus,
      }) => (
    <div>
        <AimOutlined style={{visibility: onFocus ? "visible" : "hidden"}}/>
        <Checkbox onClick={onTodoClick} checked={completed}>
            {text}
        </Checkbox>
        <Button onClick={onTodoClickFocus}><FormattedMessage id="todo.subtodo.Focus" defaultMessage="Focus"/> </Button>
    </div>
);
export const Todo = (props: Props) => {
    let [input, setInput] = useState("");
    let intl = useIntl();
    return (
        <div>
            <div>
                <Form layout="inline">
                    <Form.Item>
                        <Input onChange={(e) => setInput(e.target.value)} value={input}/>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            onClick={() => {
                                if (input != null) props.onTodoClickAddSub(props.id, input);
                            }}
                        >
                            <FormattedMessage id="todo.add_subtask" defaultMessage="Add SubTask"/>
                        </Button>
                    </Form.Item>
                </Form>
                {props.subItems.length > 0 &&
                    props.subItems.map((subtodo, index) => (
                        <SubTodo
                            key={subtodo.id}
                            {...subtodo}
                            onFocus={props.focusTodo === props.id && props.focusSubTodo === subtodo.id}
                            onTodoClickSub={() => props.onTodoClickSub(props.id, subtodo.id, !subtodo.completed)}
                            onTodoClickDeleteSub={() => props.onTodoClickDeleteSub(props.id, subtodo.id)}
                            onTodoClickFocus={() => props.onTodoClickFocus(props.id, subtodo.id)}
                        />
                    ))}
                {props.subItems.length === 0 && (
                    <DefaultSubTodo
                        text={intl.formatMessage({id: "todo.default_subtodo", defaultMessage: "default subtask"})}
                        completed={props.completed}
                        onTodoClick={() => props.onTodoClick(props.id, !props.completed)}
                        onTodoClickFocus={() => props.onTodoClickFocus(props.id, undefined)}
                        onFocus={props.focusTodo === props.id}
                    />
                )}
            </div>
        </div>
    );
};

export default Todo;
