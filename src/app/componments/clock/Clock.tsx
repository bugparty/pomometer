import React from "react";
import { wrapTimeDigit } from "../../util";
import "./Clock.css";
interface Props {
  time:number
}
export const Clock = (props:Props) => {
  const minute = parseInt(String(props.time / 60000));
  const left = parseInt(String(props.time % 60000));
  const seconds = parseInt(String(left / 1000));
  const millseconds = parseInt(String((left % 1000) / 10));
  const divStyle = {
    fontFamily: "monospace",
  };
  return (
    <section className="flex justify-center py-6" id="clockContainer">
      <div id="clock" style={divStyle}>
        {wrapTimeDigit(minute)}
        <span>:{wrapTimeDigit(seconds)}</span>
        <span>:{wrapTimeDigit(millseconds)}</span>
      </div>
    </section>
  );
};
