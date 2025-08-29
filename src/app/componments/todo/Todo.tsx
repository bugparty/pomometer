import React, {useState} from "react";
import {Button, Checkbox, Form, Input, Modal, DatePicker} from "antd";
import moment from "moment";
import {AimOutlined, DeleteOutlined, EyeOutlined, EditOutlined, MenuOutlined} from "@ant-design/icons";
import {FormattedMessage, useIntl} from "react-intl";
import {SubTodoItem} from "./todoSlice";
import {PropsFromRedux, RootProps} from "./TodoTypes";
import "./Todo.css";

const { RangePicker } = DatePicker;

// 添加格式化due time的函数
const formatDueTime = (endTime: string): string => {
    if (!endTime) return '';
    
    const endMoment = moment(endTime);
    const now = moment();
    
    if (endMoment.isSame(now, 'day')) {
        return `今天 ${endMoment.format('HH:mm')}`;
    } else if (endMoment.isSame(now.clone().add(1, 'day'), 'day')) {
        return `明天 ${endMoment.format('HH:mm')}`;
    } else {
        return endMoment.format('M月D日 HH:mm');
    }
};

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
    onTodoClickEditSub: () => void,
    completed: boolean,
    text: string,
    createdDate: string,
    endTime?: string,
    startTime?: string,
    description?: string,
    id: string,
    onFocus: boolean,
}> = ({
          onTodoClickSub,
          onTodoClickDeleteSub,
          onTodoClickFocus,
          onTodoClickEditSub,
          completed,
          text,
          createdDate,
          endTime,
          startTime,
          description,
          id,
          onFocus,
      }) => (
    <div className={`sub_todo ${description ? 'has-description' : ''}`}>
        <div className="main-content">
            <div className="left-content">
                <AimOutlined style={{visibility: onFocus ? "visible" : "hidden"}}/>
                <Checkbox onClick={onTodoClickSub} checked={completed}>
                    <span>{text}</span>
                </Checkbox>
                {endTime && (
                    <span className="time-tag">
                        {formatDueTime(endTime)}
                    </span>
                )}
            </div>
            <div className="right-content">
                <div className="button-group">
                    <Button onClick={onTodoClickEditSub} type="text" className="edit-btn" icon={<EditOutlined />} />
                    <Button onClick={onTodoClickDeleteSub} type="text" className="delete-btn" icon={<DeleteOutlined />} />
                    <Button onClick={onTodoClickFocus} type="text" className="view-btn" icon={<EyeOutlined />} />
                </div>
            </div>
        </div>
        
        {/* Detail 行 - 参考图片中的设计，用于输入 description */}
        <div className="detail-row" onClick={onTodoClickEditSub}>
            <div className="detail-content">
                <MenuOutlined className="detail-icon" />
                <span className="detail-label">
                    {description ? (
                        <span className="detail-text">{description}</span>
                    ) : (
                        <FormattedMessage id="todo.subtask.detail" defaultMessage="Details" />
                    )}
                </span>
            </div>
        </div>
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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingSubTodo, setEditingSubTodo] = useState<SubTodoItem | null>(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const intl = useIntl();

    const showModal = () => {
        form.setFieldsValue({
            time: [moment(), moment().endOf('day')]
        });
        setIsModalVisible(true);
    };

    const handleOk = () => {
        form.validateFields().then(values => {
            props.onTodoClickAddSub(props.id, values.title, values.time?.[0]?.toISOString(), values.time?.[1]?.toISOString(), values.description);
            form.resetFields();
            setIsModalVisible(false);
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const showEditModal = (subTodo: SubTodoItem) => {
        setEditingSubTodo(subTodo);
        editForm.setFieldsValue({
            title: subTodo.text,
            time: subTodo.startTime && subTodo.endTime ? 
                [moment(subTodo.startTime), moment(subTodo.endTime)] : 
                null,
            description: subTodo.description
        });
        setIsEditModalVisible(true);
    };

    const handleEditOk = () => {
        editForm.validateFields().then(values => {
            if (editingSubTodo) {
                props.onTodoClickEditSub(
                    props.id, 
                    editingSubTodo.id, 
                    values.title, 
                    values.time?.[0]?.toISOString(), 
                    values.time?.[1]?.toISOString(), 
                    values.description
                );
                editForm.resetFields();
                setIsEditModalVisible(false);
                setEditingSubTodo(null);
            }
        });
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setEditingSubTodo(null);
    };

    return (
        <div>
            <Button onClick={showModal}>
                <FormattedMessage id="todo.add_subtask" defaultMessage="Add SubTask"/>
            </Button>
            <Modal
                title={intl.formatMessage({ id: "todo.add_subtask", defaultMessage: "Add SubTask" })}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical" name="subtask_form">
                    <Form.Item
                        name="title"
                        label={intl.formatMessage({ id: "todo.subtask.title", defaultMessage: "Title" })}
                        rules={[{ required: true, message: 'Please input the title of the subtask!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="time"
                        label={intl.formatMessage({ id: "todo.subtask.time", defaultMessage: "Start/End Time" })}
                    >
                        <RangePicker showTime />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label={intl.formatMessage({ id: "todo.subtask.description", defaultMessage: "Description" })}
                    >
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title={intl.formatMessage({ id: "todo.edit_subtask", defaultMessage: "Edit SubTask" })}
                open={isEditModalVisible}
                onOk={handleEditOk}
                onCancel={handleEditCancel}
            >
                <Form form={editForm} layout="vertical" name="edit_subtask_form">
                    <Form.Item
                        name="title"
                        label={intl.formatMessage({ id: "todo.subtask.title", defaultMessage: "Title" })}
                        rules={[{ required: true, message: 'Please input the title of the subtask!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="time"
                        label={intl.formatMessage({ id: "todo.subtask.time", defaultMessage: "Start/End Time" })}
                    >
                        <RangePicker showTime />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label={intl.formatMessage({ id: "todo.subtask.description", defaultMessage: "Description" })}
                    >
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
            <div>
                {props.subItems.length > 0 &&
                    props.subItems.map((subtodo, index) => (
                        <SubTodo
                            key={subtodo.id}
                            {...subtodo}
                            onFocus={props.focusTodo === props.id && props.focusSubTodo === subtodo.id}
                            onTodoClickSub={() => props.onTodoClickSub(props.id, subtodo.id, !subtodo.completed)}
                            onTodoClickDeleteSub={() => props.onTodoClickDeleteSub(props.id, subtodo.id)}
                            onTodoClickFocus={() => props.onTodoClickFocus(props.id, subtodo.id)}
                            onTodoClickEditSub={() => showEditModal(subtodo)}
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
