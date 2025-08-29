import { connect } from "react-redux";
import {setVisibilityFilter, VisibilityFilters} from "../visibilityFilterSlice";
import Link from "../Link";
import {RootState} from "../../rootReducer";
import {Dispatch} from "redux";
interface RootProps{
  filter: VisibilityFilters
}
const mapStateToProps = (state : RootState, ownProps: RootProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter.filter,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: RootProps) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter));
    },
  };
};

const FilterLink = connect(mapStateToProps, mapDispatchToProps)(Link);

export default FilterLink;
