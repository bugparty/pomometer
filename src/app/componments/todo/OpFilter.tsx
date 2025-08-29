import React from "react";
import OpFilterLink from "./containers/OpFilterLink";
import { OpVisibilityFilter} from "./OpVisibilityFilterSlice";
import { FormattedMessage} from "react-intl";

const OpFilter = () => (
    <div className="oplog_filter">
        <div className="filter-label">
            <FormattedMessage id="oplog.filter.show" defaultMessage="Show"/>
        </div>
        <div className="filter-buttons">
            <OpFilterLink filter={{value:OpVisibilityFilter.SHOW_ALL}}>
                <FormattedMessage id="oplog.filter.all" defaultMessage="All"/>
            </OpFilterLink>
            <OpFilterLink filter={{value:OpVisibilityFilter.SHOW_THIS_WEEK}}>
                <FormattedMessage id="oplog.filter.this_week" defaultMessage="This Week"/>
            </OpFilterLink>
            <OpFilterLink filter={{value:OpVisibilityFilter.SHOW_TODAY}}>
                <FormattedMessage id="oplog.filter.today" defaultMessage="Today"/>
            </OpFilterLink>
        </div>
    </div>
);

export default OpFilter;