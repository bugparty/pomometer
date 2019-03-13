import React from 'react';

export const ClockButtons = (props)=> {

        return (
                <section className="section center">
                    <div className="main-controls">
                        <button className="button" onClick={props.handleLong}>long</button>
                        <button className="button" onClick={props.handleLongReset}>long rest</button>
                        <button className="button" onClick={props.handleShortReset}>short rest</button>
                        <button className="button is-danger" onClick={props.timeReset}>reset</button>
                    </div>
                </section>

        )
}
