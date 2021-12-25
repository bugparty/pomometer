import React from "react";
import { wrapTimeDigit } from "../../util";
interface Props {
  time:number
}
export const Clock = (props:Props) => {
  let minute = parseInt(String(props.time / 60000));
  let left = parseInt(String(props.time % 60000));
  let seconds = parseInt(String(left / 1000));
  let millseconds = parseInt(String((left % 1000) / 10));
  const divStyle = {
    fontFamily: "monospace",
  };
  return (
    <section className="section center" id="clockContainer">
      <div id="clock" style={divStyle}>
        {wrapTimeDigit(minute)}
        <span>:{wrapTimeDigit(seconds)}</span>
        <span>:{wrapTimeDigit(millseconds)}</span>
      </div>
    </section>
  );
};
