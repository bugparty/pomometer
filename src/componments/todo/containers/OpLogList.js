import {connect} from "react-redux";
import OpLog from "../OpLog";
import {set_mode, start_timer, reset_timer, set_status, ClockStatus} from "../../clock/ClockSlice";
import {formatSeconds} from "../../../util";

const mapOpLogToList = (opLogs) => {
    let l = [];
    for (let i = 0; i < opLogs.length; i++) {
        let current_log = opLogs[i]

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
                    duration = formatSeconds(duration / 1000)
                    l.push("start " + current_log.op.payload + " at:" + new Date(current_log.createdDate) + " duration:" + duration)
                } else {
                    l.push("start " + current_log.op.payload + " at:" + new Date(current_log.createdDate))
                }
            }
        } else if (current_log.op.type === start_timer.type) {
        } else if (current_log.op.type === reset_timer.type) {
            l.push("reset timer at " + new Date(current_log.createdDate))
        } else {
            l.push(current_log.op.type)
        }
    }
    return l;
};
const mapStateToProps = (state) => {
    return {
        opLogs: mapOpLogToList(state.oplogs),
    };
};
const mapDispatchToProps = (dispatch) => {
    return {};
};
const OpLogList = connect(mapStateToProps, mapDispatchToProps)(OpLog);

export default OpLogList;
