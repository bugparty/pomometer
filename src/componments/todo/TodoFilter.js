import React from "react";
import FilterLink from "./containers/FilterLink";
import { VisibilityFilters } from "./visibilityFilterSlice";
import { FormattedMessage} from "react-intl";

const TodoFilter = () => (
  <p>
      <FormattedMessage id="todo.filter.show" defaultMessage="Show: "/>
    <FilterLink filter={VisibilityFilters.SHOW_ALL}><FormattedMessage id="todo.filter.all" defaultMessage="All: "/></FilterLink>
    {", "}
    <FilterLink filter={VisibilityFilters.SHOW_ACTIVE}><FormattedMessage id="todo.filter.active" defaultMessage="Active: "/></FilterLink>
    {", "}
    <FilterLink filter={VisibilityFilters.SHOW_COMPLETED}><FormattedMessage id="todo.filter.completed" defaultMessage="Completed: "/></FilterLink>
  </p>
);

export default TodoFilter;
