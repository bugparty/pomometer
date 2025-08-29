import React from "react";
import {List, Typography} from "antd";
import {ClockCircleOutlined} from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroller'
import {
    ClockStatus,
    reset_timer, set_long_break,
    set_mode, set_pomodoro_break,
    set_short_break,
    set_status,
    start_timer,
    stop_timer
} from "../clock/ClockSlice";
import {formatDate, formatSeconds} from "../../util";
import * as R from "ramda";
import {
    addSubTodo,
    addTodo,
    focusSubTodo,
    toggleSubTodo,
    toggleTodo,
    deleteSubTodo,
    deleteTodo, TodoItem
} from "./todoSlice";
import {defineMessages, injectIntl, WrappedComponentProps, FormattedMessage} from "react-intl"
import {OpLogParams} from "./opSlice";
import "./Todo.css";
const hidden_types = [set_short_break.type, set_long_break.type, set_pomodoro_break.type, start_timer.type,
    reset_timer.type, stop_timer.type]
const messages = defineMessages({
    start_op_with_duration: {
        id: 'oplog.start_op_with_duration',
        defaultMessage: 'start {op} at {date},duration {duration}',
    },
    start_op_without_duration: {
        id: 'oplog.start_op_without_duration',
        defaultMessage: 'start {op} at {date}',
    },
    add_todo: {
        id: 'oplog.add_todo',
        defaultMessage: 'add todo {todo}',
    },
    add_subtodo: {
        id: 'oplog.add_subtodo',
        defaultMessage: 'add sub todo: {subtodo} from todo: {todo}'
    },
    toggle_subtodo: {
        id: 'oplog.toggle_subtodo',
        defaultMessage: 'toggle sub todo: {subtodo} from todo: {todo}'
    },
    toggle_todo: {
        id: 'oplog.toggle_todo',
        defaultMessage: 'toggle todo: {todo}'
    },
    untoggle_subtodo: {
        id: 'oplog.untoggle_subtodo',
        defaultMessage: 'untoggle sub todo: {subtodo} from todo: {todo}'
    },
    untoggle_todo: {
        id: 'oplog.untoggle_todo',
        defaultMessage: 'untoggle todo: {todo}'
    },
    focus_todo: {
        id: 'oplog.focus_todo',
        defaultMessage: 'focus on todo: {todo}'
    },
    focus_subtodo: {
        id: 'oplog.focus_subtodo',
        defaultMessage: 'focus on sub todo {subtodo} from todo: {todo}'
    },
    delete_todo: {
        id: 'oplog.delete_todo',
        defaultMessage: 'delete todo: {todo}'
    },
    delete_subtodo: {
        id: 'oplog.delete_subtodo',
        defaultMessage: 'delete sub todo {subtodo} from todo: {todo}'
    },
})

interface OpLogProps {
    todos:TodoItem[],
    opLogs: OpLogParams[]
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface OpLogState {
  // 如果没有特定的state，可以留空
}

class OpLog extends React.Component<OpLogProps & WrappedComponentProps, OpLogState> {

    mapOpLogToList = () => {
        const {intl} = this.props;
        const todos = this.props.todos
        const opLogs = this.props.opLogs

        const l = [];
        for (let i = 0; i < opLogs.length; i++) {
            const current_log = opLogs[i]
            //handle clock related events
            if (opLogs[i]?.op?.type === set_mode.type) {
                if (i + 1 < opLogs.length && opLogs[i + 1].op.type === start_timer.type) {
                    let stoppedAt: number = 0
                    for (let j = i + 2; j < opLogs.length; j++) {
                        const curOp = opLogs[j];
                        if (curOp.op.type === start_timer.type || curOp.op.type === reset_timer.type ||
                            curOp.op.type === stop_timer.type
                            || (curOp.op.type === set_status.type && curOp.op.payload === ClockStatus.COUNTING_ENDED)) {

                            stoppedAt = curOp.createdDate;
                            break;
                        }
                    }
                    if (stoppedAt !== 0) {
                        let duration = new Date(stoppedAt).getTime() - new Date(current_log.createdDate).getTime();
                        duration = duration / 1000;
                        if (duration < 60) {
                        } else {
                            l.push(intl.formatMessage(messages.start_op_with_duration, {
                                op: current_log.op.payload,
                                date: formatDate(new Date(current_log.createdDate)),
                                duration: formatSeconds(duration),
                            }))
                        }
                    } else {

                        l.push(intl.formatMessage(messages.start_op_without_duration, {
                            op: current_log.op.payload,
                            date: formatDate(new Date(current_log.createdDate)),
                        }))
                    }

                }
            } else if (R.includes(current_log?.op?.type, hidden_types) || (current_log?.op?.type === set_status.type &&
                current_log?.op?.payload === ClockStatus.COUNTING_ENDED)) {
            } else if (current_log?.op?.type === addTodo.type) {
                l.push(intl.formatMessage(messages.add_todo, {todo: current_log.op.payload.text}))
            } else if (current_log?.op?.type === addSubTodo.type) {
                if (typeof current_log?.op?.payload?.id !== 'string') {
                    continue;
                }
                const item = todos.find((t: TodoItem) => t.id === current_log.op.payload.id)
                if (item !== undefined && item !== null) {
                    l.push(intl.formatMessage(messages.add_subtodo, {
                        todo: item.text,
                        subtodo: current_log.op.payload.subText
                    }))
                }
            } else if (current_log?.op?.type === toggleSubTodo.type) {
                if (typeof current_log?.op?.payload?.id !== 'string') {
                    continue
                }
                const todo = todos.find((t: TodoItem) => t.id === current_log.op.payload.id)
                if (todo == null) continue
                if (current_log.op.payload.subId === undefined) {
                    if (current_log.op.payload.completed){
                        l.push(intl.formatMessage(messages.toggle_todo, {todo: todo.text}))
                    }else{
                        l.push(intl.formatMessage(messages.untoggle_todo, {todo: todo.text}))
                    }

                } else {
                    const subTodo = todo.subItems?.find((s) => s.id === current_log.op.payload.subId)
                    if (subTodo !== undefined) {
                        if (current_log.op.payload.completed){
                            l.push(intl.formatMessage(messages.toggle_subtodo, {
                                todo: todo.text,
                                subtodo: subTodo.text
                            }))
                        }else{
                            l.push(intl.formatMessage(messages.untoggle_subtodo, {
                                todo: todo.text,
                                subtodo: subTodo.text
                            }))
                        }

                    }
                }
            } else if (current_log?.op?.type === toggleTodo.type) {
                if (typeof current_log?.op?.payload?.id !== 'string') {
                    continue
                }
                const todo = todos.find((t: TodoItem) => t.id === current_log.op.payload.id)
                if (todo != null){
                    if (current_log.op.payload.completed){
                        l.push(intl.formatMessage(messages.toggle_todo, {todo: todo.text}))
                    }else{
                        l.push(intl.formatMessage(messages.untoggle_todo, {todo: todo.text}))
                    }
                }
            } else if (current_log?.op?.type === focusSubTodo.type) {
                if (typeof current_log?.op?.payload?.id !== 'string') {
                    continue
                }
                const todo = todos.find((t: TodoItem) => t.id === current_log.op.payload.id)
                if (todo == null) {
                    continue
                }
                if (current_log.op.payload.subId === undefined) {
                    l.push(intl.formatMessage(messages.focus_todo, {todo: todo.text}))
                } else {
                    const subTodo = todo.subItems?.find((s) => s.id === current_log.op.payload.subId)
                    if (subTodo !== undefined) {
                        l.push(intl.formatMessage(messages.focus_subtodo, {subtodo: subTodo.text, todo: todo.text}))
                    }
                }
            } else if (current_log?.op?.type === deleteTodo.type) {
                if (typeof current_log?.op?.payload !== 'string') {
                    continue
                }
                const todo = todos.find((t: TodoItem) => t.id === current_log.op.payload)
                if (todo === undefined) continue
                l.push(intl.formatMessage(messages.delete_todo, {todo: todo.text}))
            } else if (current_log?.op?.type === deleteSubTodo.type) {
                if (typeof current_log?.op?.payload?.id !== 'string') {
                    continue
                }
                const todo = todos.find((t: TodoItem) => t.id === current_log.op.payload.id)
                if (todo && todo.subItems) {
                    const subTodo = todo.subItems.find((s) => s.id === current_log.op.payload.subId)
                    if (subTodo === undefined) continue
                    l.push(intl.formatMessage(messages.delete_subtodo, {todo: todo.text, subtodo: subTodo.text}))
                }
            }
        }
        return l;
    };
    handleInfiniteOnLoad = () => {
    };

    render() {
        const oplog = this.mapOpLogToList()
        
        return (
            <InfiniteScroll className={"oplog_list my-2"}
                            pageStart={0}
                            hasMore={false}
                            loadMore={this.handleInfiniteOnLoad}
                            useWindow={false}>
                {oplog && oplog.length > 0 ? (
                    <List
                        header={<div></div>}
                        footer={<div></div>}
                        bordered
                        dataSource={oplog}
                        renderItem={(item) => (
                            <List.Item>
                                <Typography.Text mark><ClockCircleOutlined/></Typography.Text> {item}
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className="empty-oplog-state">
                        <div className="empty-icon">📊</div>
                        <h3 className="empty-title">
                            <FormattedMessage
                                id="oplog.empty.title"
                                defaultMessage="No activity logs yet"
                            />
                        </h3>
                        <p className="empty-description">
                            <FormattedMessage
                                id="oplog.empty.description"
                                defaultMessage="Start using the timer and managing your todos to see activity logs here!"
                            />
                        </p>
                    </div>
                )}
            </InfiniteScroll>

        );
    }
}

export default injectIntl(OpLog);
