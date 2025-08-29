import React from "react";
import {Dispatch} from "redux";
import {FormattedMessage} from "react-intl";
import {Button} from "antd";
import {connect, ConnectedProps} from "react-redux";
import {ClockMode, reset_timer, set_mode, start_timer} from "./ClockSlice";
import "./Clock.css";

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        click_long: () => {
            dispatch(set_mode(ClockMode.POMODORO));
            dispatch(start_timer());
        },
        click_long_rest: () => {
            dispatch(set_mode(ClockMode.LONG_BREAK));
            dispatch(start_timer());
        },
        click_short_rest: () => {
            dispatch(set_mode(ClockMode.SHORT_BREAK));
            dispatch(start_timer());
        },
        click_reset: () => {
            dispatch(reset_timer());
        }
    };
};
const connector = connect(null, mapDispatchToProps)
export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux
const ClockButtons = (props: Props) => {

    return (
        <section className="flex justify-center py-6">
            <div className="main-controls space-x-3">
                <Button onClick={props.click_long}>
                    <FormattedMessage
                        id="clock.button.standard"
                        defaultMessage="Pomodoro"
                    />
                </Button>
                <Button onClick={props.click_short_rest}>
                    <FormattedMessage
                        id="clock.button.short"
                        defaultMessage="Short Rst"
                    />
                </Button>
                <Button onClick={props.click_long_rest}>
                    <FormattedMessage id="clock.button.long" defaultMessage="Long Rst"/>
                </Button>
                <Button danger onClick={props.click_reset}>
                    <FormattedMessage id="clock.button.reset" defaultMessage="Reset"/>
                </Button>
            </div>
        </section>
    );
};

export default connect(null, mapDispatchToProps)(ClockButtons);
