import {connect} from "react-redux";
import OpLog from "../OpLog";
import {set_mode, start_timer, stop_timer,reset_timer, set_status,set_short_break, set_pomodoro_break, set_long_break
    , ClockStatus} from "../../clock/ClockSlice";
import {addTodo, addSubTodo, focusSubTodo, toggleSubTodo} from "../todoSlice";
import {formatSeconds, formatDate} from "../../../util";
import * as R from 'ramda'
const hidden_types = [set_short_break.type, set_long_break.type, set_pomodoro_break.type, start_timer.type,
    reset_timer.type, stop_timer.type]
const mapOpLogToList = (todos, opLogs) => {
    let l = [];
    for (let i = 0; i < opLogs.length; i++) {
        let current_log = opLogs[i]
        //handle clock related events
        if (opLogs[i].op.type === set_mode.type) {
            if (i + 1 < opLogs.length && opLogs[i + 1].op.type === start_timer.type) {
                let stoppedAt = null
                for (let j = i + 2; j < opLogs.length; j++) {
                    let curOp = opLogs[j];
                    if (curOp.op.type === start_timer.type || curOp.op.type === reset_timer.type
                        || (curOp.op.type === set_status.type && curOp.op.payload === ClockStatus.COUNTING_ENDED)) {

                        stoppedAt = curOp.createdDate;
                        break;
                    }
                }
                if (stoppedAt !== null) {
                    let duration = new Date(stoppedAt) - new Date(current_log.createdDate);
                    duration = duration / 1000;
                    if (duration < 60){
                        continue;
                    }else{
                        l.push("start " + current_log.op.payload + " at:" + formatDate(new Date(current_log.createdDate)) + " duration:" + formatSeconds(duration ))
                    }
                                   } else {
                    l.push("start " + current_log.op.payload + " at:" + formatDate(new Date(current_log.createdDate)))
                }

            }
        } else if (R.includes(current_log.op.type, hidden_types) || (current_log.op.type === set_status.type &&
        current_log.op.payload === ClockStatus.COUNTING_ENDED)) {
        } else if (current_log.op.type === addTodo.type){
            l.push('add todo: ' + current_log.op.payload.text)
        } else if (current_log.op.type === addSubTodo.type){
            const item = R.find(R.propEq('id', current_log.op.payload.id))(todos)
            if (item !== undefined){
                l.push('add sub todo: ' + current_log.op.payload.subText +' from todo:'+item.text )
            }
        }else if (current_log.op.type === toggleSubTodo.type){
            const todo = R.find(R.propEq('id', current_log.op.payload.id))(todos)
            if (current_log.op.payload.subId === undefined){
                l.push('toggle todo:' + todo.text)
            }else{
                const subTodo = R.find(R.propEq('id', current_log.op.payload.subId))(todo.subItems)
                if (subTodo !== undefined){
                    l.push('toggle sub todo: ' + subTodo.text +' from todo: ' + todo.text )
                }
            }
        }else if (current_log.op.type === focusSubTodo.type){
            const todo = R.find(R.propEq('id', current_log.op.payload.id))(todos)
            if (current_log.op.payload.subId === undefined){
                l.push('focus on todo:' + todo.text)
            }else{
                const subTodo = R.find(R.propEq('id', current_log.op.payload.subId))(todo.subItems)
                if (subTodo !== undefined){
                    l.push('focus on sub todo: ' + subTodo.text +' from todo: ' + todo.text )
                }
            }
        }
        else{
            l.push(current_log.op.type)
        }
    }
    return l;
};
const mapStateToProps = (state) => {
    return {
        opLogs: mapOpLogToList(state.todos.todos,state.oplogs),
    };
};
const mapDispatchToProps = (dispatch) => {
    return {};
};
const OpLogList = connect(mapStateToProps, mapDispatchToProps)(OpLog);

export default OpLogList;
