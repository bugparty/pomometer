import React from 'react';

export const ClockButtons = (props)=> {

        return (
                <section className="section center">
                    <div className="main-controls">
                        <button className="button" onClick={props.handleLong}>标准番茄钟</button>
                        <button className="button" onClick={props.handleShortReset}>短休息</button>
                        <button className="button" onClick={props.handleLongReset}>长休息</button>
                        <button className="button is-danger" onClick={props.timeReset}>重置</button>
                    </div>
                </section>

        )
}
