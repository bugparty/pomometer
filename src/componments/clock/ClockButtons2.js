import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Button} from "antd";
import {connect} from 'react-redux'
import {ClockMode, reset_timer, set_mode, start_timer} from './ClockSlice'


let ClockButtons = ({dispatch}) => {
    function setDuration(seconds) {
        clearInterval(this.state.timer);
        this.setState({'timeInterval': seconds, 'timeLeft': seconds});
    }

    function timeBegin() {
        let that = this;
        let timer = setInterval(() => {
            if (that.state.timeLeft <= 0) {
                clearInterval(that.state.timer);
                that.setState({'timeLeft': 0});
                that.props.setEnd();
            } else {
                that.setState({'timeLeft': that.state.timeLeft - 1});
            }

        }, 1000);
        this.setState({'timer': timer});
        this.props.setBegin()
    }

    function handleLong() {
        this.props.setMode("pomodoro");
        this.setDuration(this.props.pomodoro_duration);
        this.timeBegin();
    }

    function handleLongReset() {
        dispatch(set_mode(ClockMode.LONG_BREAK))
        dispatch(start_timer())
    }

    function handleShortReset() {
        this.props.setMode("shortRest");
        this.setDuration(this.props.short_break_duration);
        this.timeBegin();
    }

    function timeReset() {
        dispatch(reset_timer())
    }

    return (
        <section className="section center">
            <div className="main-controls">
                <Button onClick={handleLong}>
                    <FormattedMessage id="clock.button.standard" defaultMessage='Pomodoro'/></Button>
                <Button onClick={handleShortReset}>
                    <FormattedMessage id="clock.button.short" defaultMessage='Short Rst'/>
                </Button>
                <Button onClick={handleLongReset}>
                    <FormattedMessage id="clock.button.long" defaultMessage='Long Rst'/>
                </Button>
                <Button danger onClick={timeReset}>
                    <FormattedMessage id="clock.button.reset"
                                      defaultMessage='Reset'/>
                </Button>
            </div>
        </section>

    )
}
ClockButtons = connect()(ClockButtons)

export default ClockButtons