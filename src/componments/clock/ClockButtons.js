import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Button} from "antd";

export const ClockButtons = (props) => {

    return (
        <section className="section center">
            <div className="main-controls">
                <Button  onClick={props.handleLong}>
                    <FormattedMessage id="clock.button.standard" defaultMessage='Pomodoro'/></Button>
                <Button  onClick={props.handleShortReset}>
                    <FormattedMessage id="clock.button.short" defaultMessage='Short Rst'/>
                </Button>
                <Button  onClick={props.handleLongReset}>
                    <FormattedMessage id="clock.button.long" defaultMessage='Long Rst'/>
                </Button>
                <Button danger onClick={props.timeReset}>
                    <FormattedMessage id="clock.button.reset"
                        defaultMessage='Reset'/>
                </Button>
            </div>
        </section>

    )
}
