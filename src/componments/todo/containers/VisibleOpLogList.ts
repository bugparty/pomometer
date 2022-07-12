import {connect} from "react-redux";
import {Dispatch} from "redux";
import OpLog from "../OpLog";
import {RootState} from "../../store";
import {OpLogParams} from "../opSlice";
import {OpVisibilityFilter} from "../OpVisibilityFilterSlice";
import {getThisWeekRange, getTodayRange} from "../../../util";
import * as R from "ramda";

function filterOpLogs(logs: OpLogParams[], filter: OpVisibilityFilter){
    if (filter === OpVisibilityFilter.SHOW_TODAY){
        let range = getTodayRange()
        const isToday = (log: OpLogParams) => log.createdDate >= range.start && log.createdDate <= range.end
        return R.filter(isToday, logs)
    }else if (filter === OpVisibilityFilter.SHOW_THIS_WEEK){
        let range = getThisWeekRange()
        const isThisWeek = (log: OpLogParams) => log.createdDate >= range.start && log.createdDate <= range.end
        return R.filter(isThisWeek, logs)
    }else{
        return logs
    }
}
const mapStateToProps = (state:RootState) => {
    return {
        opLogs: filterOpLogs(state.oplogs.ops, state.opfilter.value),
        todos:state.todos.todos,
    };
};
const mapDispatchToProps = (dispatch: Dispatch) => {
    return {};
};
const VisibleOpLogList = connect(mapStateToProps, mapDispatchToProps)(OpLog);

export default VisibleOpLogList;
