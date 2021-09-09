import { connect } from "react-redux";
import OpLog from "../OpLog";
import {set_mode, start_timer, reset_timer} from "../../clock/ClockSlice";

const mapOpLogToList = (opLogs) => {
  let l = [];
  for(let i=0; i< opLogs.length;i++){
    let current_log = opLogs[i]

    if (opLogs[i].op.type === set_mode.type){
      if (i+1 < opLogs.length && opLogs[i+1].op.type === start_timer.type){
        l.push("start " + current_log.op.payload + " at:" + current_log.createdDate)
      }
    }
    else if (current_log.op.type === start_timer.type){
    }
    else if (current_log.op.type === reset_timer.type){
      l.push("reset timer at " + current_log.createdDate)
    }else{
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
