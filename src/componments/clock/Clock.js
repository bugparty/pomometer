import React from 'react';
import {wrapTimeDigit} from "../../util";

export const Clock = (props) => {
    let minute = parseInt(props.time / 60000)
    let left = parseInt(props.time % 60000)
    let seconds = parseInt(left / 1000)
    let millseconds = parseInt(left % 1000 /10)
    const divStyle = {
        fontFamily: 'monospace'
    };
    return (
        <section className="section center" id="clockContainer">
            <div id="clock"
                 style={divStyle}>{wrapTimeDigit(minute)}
                <span>:{wrapTimeDigit(seconds)}</span><span>:{wrapTimeDigit(millseconds)}</span>
            </div>
        </section>
    )
};
