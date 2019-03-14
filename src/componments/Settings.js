import React from 'react';
import classnames from 'classnames';
import {secondsToMinutesString} from "../util";

export class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.handleTickingSound = this.handleTickingSound.bind(this);
    }

    handleTickingSound(event) {
        this.props.setTickingSound(event.target.checked);
    }

    render() {
        let modalClass = classnames('modal', {'is-active': this.props.isOpenSettings});
        return (
            <div>
                <div className={modalClass}>
                    <div className="modal-background" onClick={this.props.closeModal}></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">设置</p>
                            <button className="delete" aria-label="close" onClick={this.props.closeModal}></button>
                        </header>
                        <section className="modal-card-body">
                            <section><label className="checkbox">
                                <input type="checkbox" onChange={this.handleTickingSound}
                                       defaultChecked={this.props.enableTickingSound}/>
                                开启时钟声音
                            </label>
                                <div className="field">
                                    <label className="label">番茄钟时长</label>
                                    <div className="control">
                                        <input className="input is-info" type="text" placeholder="番茄钟时长"
                                               defaultValue={secondsToMinutesString(this.props.pomodoro_duration)}/>
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">短休息时长</label>
                                    <div className="control">
                                        <input className="input is-info" type="text" placeholder="短休息时长"
                                               defaultValue={secondsToMinutesString(this.props.short_break_duration)}/>
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">长休息时长</label>
                                    <div className="control">
                                        <input className="input is-info" type="text" placeholder="长休息时长"
                                               defaultValue={secondsToMinutesString(this.props.long_break_duration)}/>
                                    </div>
                                </div>
                            </section>
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button is-danger">重置</button>
                        </footer>
                    </div>

                </div>
            </div>
        );
    }
}

Settings.propTypes = {};
