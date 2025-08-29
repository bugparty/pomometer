import {connect} from "react-redux";
import {Dispatch} from "redux";
import OpLog from "../OpLog";
import {RootState} from "../../rootReducer";
import {OpLogParams} from "../opSlice";
import {OpVisibilityFilter} from "../OpVisibilityFilterSlice";
import {getThisWeekRange, getTodayRange} from "../../../util";
import * as R from "ramda";

function filterOpLogs(logs: OpLogParams[], filter: OpVisibilityFilter){
    if (filter === OpVisibilityFilter.SHOW_TODAY){
        const range = getTodayRange()
        const isToday = (log: OpLogParams) => log.createdDate >= range.start && log.createdDate <= range.end
        const result = R.filter(isToday, logs)
        return result
    }else if (filter === OpVisibilityFilter.SHOW_THIS_WEEK){
        const range = getThisWeekRange()
        const isThisWeek = (log: OpLogParams) => log.createdDate >= range.start && log.createdDate <= range.end
        const result = R.filter(isThisWeek, logs)
        return result
    }else{
        return logs
    }
}
const mapStateToProps = (state:RootState) => {
    const opLogs = filterOpLogs(state.oplogs.ops, state.opfilter.value);
    const todos = state.todos.todos;
    
    return {
        opLogs: opLogs,
        todos: todos,
    };
};
const mapDispatchToProps = (dispatch: Dispatch) => {
    return {};
};
const VisibleOpLogList = connect(mapStateToProps, mapDispatchToProps)(OpLog);

export default VisibleOpLogList;
