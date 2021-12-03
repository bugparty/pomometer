import React from "react";
import OpFilterLink from "./containers/OpFilterLink";
import { OpVisiblityFilter} from "./OpVisibilityFilterSlice";
import { FormattedMessage} from "react-intl";

const OpFilter: React.FC<{}> = () => (
    <p>
        <FormattedMessage id="oplog.filter.show" defaultMessage="Show: "/>
        <OpFilterLink filter={{value:OpVisiblityFilter.SHOW_ALL}}><FormattedMessage id="todo.filter.all" defaultMessage="All: "/></OpFilterLink>
        {", "}
        <OpFilterLink filter={{value:OpVisiblityFilter.SHOW_ALL}}><FormattedMessage id="todo.filter.active" defaultMessage="Active: "/></OpFilterLink>
        {", "}
        <OpFilterLink filter={{value:OpVisiblityFilter.SHOW_ALL}}><FormattedMessage id="todo.filter.completed" defaultMessage="Completed: "/></OpFilterLink>
    </p>
);

export default OpFilter;