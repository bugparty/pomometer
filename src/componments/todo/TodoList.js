import React from 'react'
import PropTypes from 'prop-types'
import Todo from './Todo'
import {Collapse, Modal} from 'antd';
import {DeleteOutlined} from '@ant-design/icons';

const {Panel} = Collapse;
const genExtra = (that, id) => (
    <DeleteOutlined
        onClick={event => {
            // If you don't want click extra trigger collapse, you can prevent this:
            that.setState({
                deleteId: id,
                deleteVisible: true
            })
            event.stopPropagation();
        }}
    />
);

class TodoList extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            deleteVisible : false
        }
        this.handleOk = this.handleOk.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
    }
    handleOk = e => {
        console.log(e);
        this.props.onTodoClickDelete(this.state.deleteId)
        this.setState({
            deleteVisible: false,
        });
    };

    handleCancel = todo => e => {
        console.log(e);
        this.setState({
            deleteVisible: false,
        });
    };
    onPositionChange = expandIconPosition => {
        this.setState({ expandIconPosition });
    };
    callback = e => {

    }
    expandIconPosition = e=> {

    }
    render() {
        return (<div>
                <Modal
                    title="Confirm Delete?"
                    visible={this.state.deleteVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                </Modal>
            <Collapse
                defaultActiveKey={['1']}
                onChange={this.callback}
                expandIconPosition={this.expandIconPosition}
            >
                {this.props.todos.length > 0 && this.props.todos.map((todo, index) => (
                    <Panel header={todo.text} key={todo.id} extra={genExtra(this, todo.id)}>
                        <Todo key={todo.id} {...todo} {...this.props} onClick={() => this.props.onTodoClick(todo.id)}
                              createdDate={todo.createdDate}
                              onClickDelete={e => {
                                  e.stopPropagation()
                                  this.props.onTodoClickDelete(todo.id)
                              }} />
                    </Panel>

                ))}
                {this.props.todos.length === 0 && <p>No todo item</p>}
            </Collapse>
        </div>
    )}
}

TodoList.propTypes = {
    todos: PropTypes.arrayOf(
        PropTypes.shape({
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
        )).isRequired,
    onTodoClick: PropTypes.func.isRequired,
    onTodoClickDelete: PropTypes.func.isRequired,
    onTodoClickSub: PropTypes.func.isRequired,
    onTodoClickDeleteSub: PropTypes.func.isRequired,
    onTodoClickAddSub: PropTypes.func.isRequired,
}

export default TodoList