import {connect} from "react-redux";
import OpLog from "../OpLog";

const mapStateToProps = (state) => {
    return {
        opLogs: state.oplogs,
        todos:state.todos.todos,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {};
};
const OpLogList = connect(mapStateToProps, mapDispatchToProps)(OpLog);

export default OpLogList;
