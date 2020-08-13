import React from 'react'
import PropTypes from 'prop-types'
import {Button, Checkbox, Form, Input} from 'antd';

const SubTodo = ({onTodoClickSub, onTodoClickDeleteSub, completed, text, createdDate, id}) => (
    <div>
        <Checkbox onClick={onTodoClickSub} checked={completed}>{text}</Checkbox>
        <Button onClick={onTodoClickDeleteSub}>Delete</Button>
    </div>
)
const DefaultSubTodo = ({onTodoClick, completed, text}) => (
    <div>
        <Checkbox onClick={onTodoClick} checked={completed}>{text}</Checkbox>
    </div>
)
const Todo = ({onTodoClickSub, onTodoClick, onTodoClickDeleteSub, onTodoClickAddSub, id, completed, text, createdDate, subItems}) => {
    let input
    return (
        <div>
            <div>
                <Form layout="inline">
                    <Form.Item>
                        <Input onChange={e => input = e.target.value} value={input}/>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={() => {
                            if (input != null) onTodoClickAddSub(id, input)
                        }}>Add SubTask</Button>
                    </Form.Item>
                </Form>
                {subItems.length > 0 && subItems.map((subtodo, index) => (
                    <SubTodo key={subtodo.id} {...subtodo}
                             onTodoClickSub={() => onTodoClickSub(id, subtodo.id)}
                             onTodoClickDeleteSub={() => onTodoClickDeleteSub(id, subtodo.id)}
                    ></SubTodo>
                ))
                }
                {
                    subItems.length === 0 &&
                    <DefaultSubTodo text={"default subtask"} completed={completed} onTodoClick={() => onTodoClick(id)}/>
                }

            </div>
        </div>
    )
}

Todo.protoTypes = {
    onClickDelete: PropTypes.func.isRequired,
    onTodoClickSub: PropTypes.func.isRequired,
    onTodoClickDeleteSub: PropTypes.func.isRequired,
    onTodoClickAddSub: PropTypes.func.isRequired,
    completed: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    createdDate: PropTypes.string.isRequired,
    subItems: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired,
        createdDate: PropTypes.string.isRequired,
    })).isRequired
}

export default Todo
