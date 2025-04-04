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
import {defineMessages, injectIntl,WrappedComponentProps} from "react-intl"
import {OpLogParams} from "./opSlice";

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

class OpLog extends React.Component<OpLogProps & WrappedComponentProps, any> {

    mapOpLogToList = () => {
        const {intl} = this.props;
        let todos = this.props.todos
        let opLogs = this.props.opLogs

        let l = [];
        for (let i = 0; i < opLogs.length; i++) {
            let current_log = opLogs[i]
            //handle clock related events
            if (opLogs[i].op.type === set_mode.type) {
                if (i + 1 < opLogs.length && opLogs[i + 1].op.type === start_timer.type) {
                    let stoppedAt: number = 0
                    for (let j = i + 2; j < opLogs.length; j++) {
                        let curOp = opLogs[j];
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
            } else if (R.includes(current_log.op.type, hidden_types) || (current_log.op.type === set_status.type &&
                current_log.op.payload === ClockStatus.COUNTING_ENDED)) {
            } else if (current_log.op.type === addTodo.type) {
                // @ts-ignore
                l.push(intl.formatMessage(messages.add_todo, {todo: current_log.op.payload.text}))
            } else if (current_log.op.type === addSubTodo.type) {
                // @ts-ignore
                const item = R.find(R.propEq('id', current_log.op.payload.id), todos)
                if (item !== undefined) {

                    l.push(intl.formatMessage(messages.add_subtodo, {
                        todo: item.text,
                        // @ts-ignore
                        subtodo: current_log.op.payload.subText
                    }))
                }
            } else if (current_log.op.type === toggleSubTodo.type) {
                // @ts-ignore
                const todo = R.find(R.propEq('id', current_log.op.payload.id),todos)
                if (todo == null) return
                // @ts-ignore
                if (current_log.op.payload.subId === undefined) {
                    if (current_log.op.payload.checked){
                        l.push(intl.formatMessage(messages.toggle_todo, {todo: todo.text}))
                    }else{
                        l.push(intl.formatMessage(messages.untoggle_todo, {todo: todo.text}))
                    }

                } else {
                    // @ts-ignore
                    const subTodo = R.find(R.propEq('id', current_log.op.payload.subId), todo.subItems)
                    if (subTodo !== undefined) {
                        if (current_log.op.payload.checked){
                            l.push(intl.formatMessage(messages.toggle_subtodo, {
                                // @ts-ignore
                                todo: todo.text,
                                subtodo: subTodo.text
                            }))
                        }else{
                            l.push(intl.formatMessage(messages.untoggle_subtodo, {
                                // @ts-ignore
                                todo: todo.text,
                                subtodo: subTodo.text
                            }))
                        }

                    }
                }
            } else if (current_log.op.type === toggleTodo.type) {
                const todo = R.find(R.propEq('id', current_log.op.payload.id), todos)
                if (todo instanceof Object){
                    if (current_log.op.payload.checked){
                        l.push(intl.formatMessage(messages.toggle_todo, {todo: todo.text}))
                    }else{
                        l.push(intl.formatMessage(messages.untoggle_todo, {todo: todo.text}))
                    }
                }

                else {

                }
            } else if (current_log.op.type === focusSubTodo.type) {
                // @ts-ignore
                const todo = R.find(R.propEq('id', current_log.op.payload.id))(todos)
                // @ts-ignore
                if (current_log.op.payload.subId === undefined) {
                    // @ts-ignore
                    l.push(intl.formatMessage(messages.focus_todo, {todo: todo.text}))
                } else {
                    // @ts-ignore
                    const subTodo = R.find(R.propEq('id', current_log.op.payload.subId), todo.subItems)
                    if (subTodo !== undefined) {
                        // @ts-ignore
                        l.push(intl.formatMessage(messages.focus_subtodo, {subtodo: subTodo.text, todo: todo.text}))
                    }
                }
            } else if (current_log.op.type === deleteTodo.type) {
                const todo = R.find(R.propEq('id', current_log.op.payload), todos)
                if (todo === undefined) continue
                l.push(intl.formatMessage(messages.delete_todo, {todo: todo.text}))
            } else if (current_log.op.type === deleteSubTodo.type) {
                // @ts-ignore
                const todo = R.find<TodoItem>(R.propEq('id', current_log.op.payload.id), todos)
                // @ts-ignore
                const subTodo = R.find(R.propEq('id', current_log.op.payload.subId), todo.subItems)
                if (subTodo === undefined) continue
                // @ts-ignore
                l.push(intl.formatMessage(messages.delete_subtodo, {todo: todo.text, subtodo: subTodo.text}))
            }
        }
        return l;
    };
    handleInfiniteOnLoad = () => {
    };

    render() {
        const oplog = this.mapOpLogToList()
        return (
            <InfiniteScroll className={"oplog_list"}
                            pageStart={0}
                            hasMore={false}
                            loadMore={this.handleInfiniteOnLoad}
                            useWindow={false}>
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
            </InfiniteScroll>

        );
    }
}

export default injectIntl(OpLog);
