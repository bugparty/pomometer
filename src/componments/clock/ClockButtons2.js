import React from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "antd";
import { connect } from "react-redux";
import { ClockMode, reset_timer, set_mode, start_timer } from "./ClockSlice";

let ClockButtons = ({ dispatch }) => {
  function handleLong() {
    dispatch(set_mode(ClockMode.POMODORO));
    dispatch(start_timer());
  }

  function handleLongRest() {
    dispatch(set_mode(ClockMode.LONG_BREAK));
    dispatch(start_timer());
  }

  function handleShortRest() {
    dispatch(set_mode(ClockMode.SHORT_BREAK));
    dispatch(start_timer());
  }

  function timeReset() {
    dispatch(reset_timer());
  }

  return (
    <section className="section center">
      <div className="main-controls">
        <Button onClick={handleLong}>
          <FormattedMessage
            id="clock.button.standard"
            defaultMessage="Pomodoro"
          />
        </Button>
        <Button onClick={handleShortRest}>
          <FormattedMessage
            id="clock.button.short"
            defaultMessage="Short Rst"
          />
        </Button>
        <Button onClick={handleLongRest}>
          <FormattedMessage id="clock.button.long" defaultMessage="Long Rst" />
        </Button>
        <Button danger onClick={timeReset}>
          <FormattedMessage id="clock.button.reset" defaultMessage="Reset" />
        </Button>
      </div>
    </section>
  );
};
ClockButtons = connect()(ClockButtons);

export default ClockButtons;
