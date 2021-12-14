import { connect, ConnectedProps } from "react-redux";
import {Dispatch} from "redux";
import {OpVisibilityFilterState, setVisibilityFilter} from "../OpVisibilityFilterSlice";
import React from "react";
import {Button} from "antd";
import {RootState} from "../../store";
interface RootProps {
    filter: OpVisibilityFilterState
}
const mapStateToProps = (state : RootState, ownProps: RootProps) => {
    return {
        active: ownProps.filter.value === state.opfilter.value,
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: RootProps) => {
    return {
        onClick: () => {
            dispatch(setVisibilityFilter(ownProps.filter));
        },
    };
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & RootProps & {
    children: JSX.Element,
    onClick: () => void
}

const OpLink  = (props : Props) => {
    return (
        <Button onClick={props.onClick} disabled={props.active} style={{ marginLeft: "4px" }}>
    {props.children}
    </Button>
);
};

const OpFilterLink = connect(mapStateToProps, mapDispatchToProps)(OpLink);

export default OpFilterLink;