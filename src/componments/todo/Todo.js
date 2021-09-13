import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Checkbox, Form, Input } from "antd";
import { AimOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl} from "react-intl";
const SubTodo = ({
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
    <AimOutlined style={{ visibility: onFocus ? "visible" : "hidden" }} />
    <Checkbox onClick={onTodoClickSub} checked={completed}>
      {text}
    </Checkbox>
    <Button onClick={onTodoClickDeleteSub}>
        <FormattedMessage id="todo.subtodo.delete" defaultMessage="Delete"/></Button>
    <Button onClick={onTodoClickFocus}><FormattedMessage id="todo.subtodo.Focus" defaultMessage="Focus"/></Button>
  </div>
);
const DefaultSubTodo = ({
  onTodoClick,
  completed,
  text,
  onFocus,
  onTodoClickFocus,
}) => (
  <div>
    <AimOutlined style={{ visibility: onFocus ? "visible" : "hidden" }} />
    <Checkbox onClick={onTodoClick} checked={completed}>
      {text}
    </Checkbox>
    <Button onClick={onTodoClickFocus}><FormattedMessage id="todo.subtodo.Focus" defaultMessage="Focus"/> </Button>
  </div>
);
const Todo = ({
  onTodoClickSub,
  onTodoClick,
  onTodoClickDeleteSub,
  onTodoClickAddSub,
  onTodoClickFocus,
  id,
  completed,
  text,
  createdDate,
  subItems,
  focusTodo,
  focusSubTodo,
}) => {
  let [input, setInput] = useState("");
  let intl = useIntl();
  return (
    <div>
      <div>
        <Form layout="inline">
          <Form.Item>
            <Input onChange={(e) => setInput(e.target.value)} value={input} />
          </Form.Item>
          <Form.Item>
            <Button
              onClick={() => {
                if (input != null) onTodoClickAddSub(id, input);
              }}
            >
              <FormattedMessage id="todo.add_subtask" defaultMessage="Add SubTask"/>
            </Button>
          </Form.Item>
        </Form>
        {subItems.length > 0 &&
          subItems.map((subtodo, index) => (
            <SubTodo
              key={subtodo.id}
              {...subtodo}
              onFocus={focusTodo === id && focusSubTodo === subtodo.id}
              onTodoClickSub={() => onTodoClickSub(id, subtodo.id)}
              onTodoClickDeleteSub={() => onTodoClickDeleteSub(id, subtodo.id)}
              onTodoClickFocus={() => onTodoClickFocus(id, subtodo.id)}
            />
          ))}
        {subItems.length === 0 && (
          <DefaultSubTodo
            text={intl.formatMessage({id:"todo.default_subtodo", defaultMessage: "default subtask"})}
            completed={completed}
            onTodoClick={() => onTodoClick(id)}
            onTodoClickFocus={() => onTodoClickFocus(id, undefined)}
            onFocus={focusTodo === id}
          />
        )}
      </div>
    </div>
  );
};

Todo.protoTypes = {
  onClickDelete: PropTypes.func.isRequired,
  onTodoClickSub: PropTypes.func.isRequired,
  onTodoClickDeleteSub: PropTypes.func.isRequired,
  onTodoClickAddSub: PropTypes.func.isRequired,
  onTodoClickFocus: PropTypes.func.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  createdDate: PropTypes.string.isRequired,
  subItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      text: PropTypes.string.isRequired,
      createdDate: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Todo;
