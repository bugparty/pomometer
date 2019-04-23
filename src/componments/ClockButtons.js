import React from 'react';
import {FormattedMessage} from 'react-intl';

export const ClockButtons = (props) => {

    return (
        <section className="section center">
            <div className="main-controls">
                <button className="button" onClick={props.handleLong}>
                    <FormattedMessage id="clock.button.standard" defaultMessage='Pomodoro'/></button>
                <button className="button" onClick={props.handleShortReset}>
                    <FormattedMessage id="clock.button.short" defaultMessage='Short Rst'/>
                </button>
                <button className="button" onClick={props.handleLongReset}>
                    <FormattedMessage id="clock.button.long" defaultMessage='Long Rst'/>
                </button>
                <button className="button is-danger" onClick={props.timeReset}>
                    <FormattedMessage id="clock.button.reset"
                        defaultMessage='Reset'/>
                </button>
            </div>
        </section>

    )
}
