import Clock from './Clock';
import React from 'react';

class ClockContorller extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'timestr': '25:00'};
    }

    render() {
        return <Clock time={this.state.timestr}/>
    }
}
