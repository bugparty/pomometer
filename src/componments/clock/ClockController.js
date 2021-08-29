import React from "react";
import { Clock } from "./Clock";
import ClockButtons from "./ClockButtons2";
import ClockTimer from "./ClockTimer";

export class ClockController extends React.Component {
  render() {
    return (
      <div>
        <ClockTimer>
          <Clock />
        </ClockTimer>
        <ClockButtons />
      </div>
    );
  }
}
