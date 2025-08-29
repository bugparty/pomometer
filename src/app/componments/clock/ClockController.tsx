import React from "react";
import ClockButtons from "./ClockButtons";
import ClockTimer from "./ClockTimer";

export function ClockController() {
  return (
    <div>
      <ClockTimer />
      <ClockButtons />
    </div>
  );
}
