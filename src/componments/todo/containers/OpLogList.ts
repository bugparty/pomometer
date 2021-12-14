import {connect} from "react-redux";
import {Dispatch} from "redux";
import OpLog from "../OpLog";
import {RootState} from "../../store";

const mapStateToProps = (state:RootState) => {
    return {
        opLogs: state.oplogs.ops,
        todos:state.todos.todos,
    };
};
const mapDispatchToProps = (dispatch: Dispatch) => {
    return {};
};
const OpLogList = connect(mapStateToProps, mapDispatchToProps)(OpLog);

export default OpLogList;
