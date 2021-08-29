import { connect } from "react-redux";
import OpLog from "../OpLog";
const mapOpLogToList = (opLogs) => {
  let l = [];
  opLogs.forEach((opLog) => l.push(opLog.text));
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
