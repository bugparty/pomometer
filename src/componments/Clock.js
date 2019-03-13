import React from 'react';

export const Clock = (props) => {
    return (
        <section className="section center">
            <div id="clock">{props.time}</div>
        </section>
    )
};
