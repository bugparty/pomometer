import { connect } from "react-redux";
import { setVisibilityFilter } from "../visibilityFilterSlice";
import Link from "../Link";

const mapStateToProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visiblityFilter,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter));
    },
  };
};

const FilterLink = connect(mapStateToProps, mapDispatchToProps)(Link);

export default FilterLink;
