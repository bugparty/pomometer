import {connect} from "react-redux";
import TodoList from "../TodoList";
import {injectIntl} from "react-intl";
import {mapDispatchToProps, mapStateToProps} from "../TodoTypes";


const VisibleTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList);

export default injectIntl(VisibleTodoList);
