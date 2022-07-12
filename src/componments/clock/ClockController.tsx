import React from "react";
import ClockButtons from "./ClockButtons";
import ClockTimer from "./ClockTimer";

export class ClockController extends React.Component<any,any> {
  render() {
    return (
      <div>
        <ClockTimer>

        </ClockTimer>
        <ClockButtons />
      </div>
    );
  }
}
