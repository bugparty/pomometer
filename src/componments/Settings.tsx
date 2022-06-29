import React from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import {secondsToMinutes} from "../util";
import {FormattedMessage} from "react-intl";
import {
    reset_settings, set_long_break, set_pomodoro_break, set_short_break,
    set_rest_ticking_sound, set_ticking_sound,
} from "./clock/ClockSlice";
import {Dispatch} from "redux";
import {RootState} from "./store";
interface SettingsProps{
    pomodoro_duration : number,
    short_break_duration : number,
    long_break_duration : number,
    isOpenSettings: boolean,
    closeModal : () => void,
    enableTickingSound: boolean,
    enableRestTickingSound: boolean,
    setTickingSound : (enable: boolean) => void,
    setRestTickingSound: (enable: boolean) => void,
    saveOptions: (options: any) => void,
}
interface SettingsState {
    pomodoro: number,
    short: number,
    long: number
}
class Settings extends React.Component<SettingsProps, SettingsState> {
    constructor(props : SettingsProps) {
        super(props);
        this.state = {
            pomodoro: secondsToMinutes(this.props.pomodoro_duration),
            short: secondsToMinutes(this.props.short_break_duration),
            long: secondsToMinutes(this.props.long_break_duration),
        };
        this.handleTickingSound = this.handleTickingSound.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.handleSaveChanges = this.handleSaveChanges.bind(this);
        this.handleResetDefaults = this.handleResetDefaults.bind(this);
        this.handleExport = this.handleExport.bind(this);
    }
    async handleImport(event : React.MouseEvent<HTMLButtonElement>){
        let fileHandle
        // @ts-ignore
        [fileHandle] = await  window.showOpenFilePicker();

    }
    handleExport(event : React.MouseEvent<HTMLButtonElement>){

    }
    handleTickingSound(event : React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const name = target.name;

        switch (name) {
            case "sound":
                this.props.setTickingSound(event.target.checked);
                break;
            case "restSound":
                this.props.setRestTickingSound(event.target.checked);
                break;
            default:
                break;
        }
    }

    handleInputChange(event : React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        if (target !== null){
            const value = target.type === "checkbox" ? target.checked : target.value;
            const name = target.name;
            if (typeof value === 'number'){
                switch (name) {
                    case "pomodoro":
                        this.setState({pomodoro: value});
                        break;
                    case "short":
                        this.setState({short: value});
                        break;
                    case "long":
                        this.setState({long: value});
                        break;
                    default:
                        break;
                }
            }
        }
    }

    saveChanges() {
        let options = {
            pomodoro_duration: this.state.pomodoro * 60,
            short_break_duration: this.state.short * 60,
            long_break_duration: this.state.long * 60,
        };
        this.props.saveOptions(options);
    }

    handleSaveChanges() {
        this.saveChanges();
        this.props.closeModal();
    }

    handleResetDefaults() {
        this.props.saveOptions({
            pomodoro_duration: 25 * 60,
            short_break_duration: 5 * 60,
            long_break_duration: 15 * 60,
            enableTickingSound: true,
            enableRestTickingSound: false
        });
        this.props.closeModal();
    }

    render() {
        let modalClass = classnames("modal", {
            "is-active": this.props.isOpenSettings,
        });
        return (
            <div>
                <div className={modalClass}>
                    <div className="modal-background" onClick={this.props.closeModal}/>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">
                                <FormattedMessage
                                    id="settings.title"
                                    defaultMessage="Settings"
                                />
                            </p>
                            <button
                                className="delete"
                                aria-label="close"
                                onClick={this.props.closeModal}
                            />
                        </header>
                        <section className="modal-card-body">
                            <section>
                                <div className="columns">
                                    <div className="column">
                                        <label className="checkbox">
                                            <input
                                                name="sound"
                                                type="checkbox"
                                                checked={this.props.enableTickingSound}
                                                onChange={this.handleTickingSound}
                                            />

                                            <FormattedMessage
                                                id="settings.enableTickingSound"
                                                defaultMessage="enable ticking sound"
                                            />
                                        </label>
                                    </div>

                                    <div className="column">
                                        <label className="checkbox">
                                            <input
                                                name="restSound"
                                                type="checkbox"
                                                checked={this.props.enableRestTickingSound}
                                                onChange={this.handleTickingSound}
                                            />
                                            <FormattedMessage
                                                id="settings.enableRestTickingSound"
                                                defaultMessage="enable ticking sound when resting"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="label">
                                        <FormattedMessage
                                            id="settings.field.pomodoro_duration"
                                            defaultMessage="Pomodoro duration"
                                        />
                                    </label>
                                    <div className="control">
                                        <input
                                            name="pomodoro"
                                            type="number"
                                            className="input is-info"
                                            placeholder="番茄钟时长"
                                            value={this.state.pomodoro}
                                            onChange={this.handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">
                                        <FormattedMessage
                                            id="settings.field.short_break_duration"
                                            defaultMessage="short break duration"
                                        />
                                    </label>
                                    <div className="control">
                                        <input
                                            className="input is-info"
                                            name="short"
                                            type="number"
                                            placeholder="短休息时长"
                                            value={this.state.short}
                                            onChange={this.handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">
                                        <FormattedMessage
                                            id="settings.field.long_break_duration"
                                            defaultMessage="long break duration"
                                        />
                                    </label>
                                    <div className="control">
                                        <input
                                            className="input is-info"
                                            name="long"
                                            type="number"
                                            placeholder="长休息时长"
                                            value={this.state.long}
                                            onChange={this.handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="columns">
                                    <div className="column">
                                        <div className="field">
                                            <p className="control">
                                                <button className="button is-success" onClick={this.handleExport}>
                                                    export data
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="column">
                                        <div className="field">
                                            <p className="control">
                                                <button className="button is-success" onClick={this.handleImport}>
                                                    import data
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                    </div >
                            </section>
                        </section>
                        <footer className="modal-card-foot">
                            <button
                                className="button is-success"
                                onClick={this.handleSaveChanges}
                            >
                                <FormattedMessage
                                    id="settings.button.save"
                                    defaultMessage="Save"
                                />
                            </button>
                            <button
                                className="button is-danger"
                                onClick={this.handleResetDefaults}
                            >
                                <FormattedMessage
                                    id="settings.button.reset"
                                    defaultMessage="Reset"
                                />
                            </button>
                        </footer>
                    </div>
                </div>
            </div>
        );
    }
}
interface RootProps{}
/*
 saveOptions={this.props.saveOptions}
 resetDefault={this.props.resetDefault}
 */
function mapStateToProps(state : RootState, ownProps: RootProps) {
    return {
        enableTickingSound: state.clock.ticking_sound_enabled,
        enableRestTickingSound: state.clock.rest_ticking_sound_enabled,
        pomodoro_duration: state.clock.pomodoro_duration,
        short_break_duration: state.clock.short_break_duration,
        long_break_duration: state.clock.long_break_duration,

    }
}

function mapDispatchToProps(dispatch: Dispatch) {

    return {
        setTickingSound: (enable:boolean) => dispatch(set_ticking_sound(enable)),
        setRestTickingSound:  (enable:boolean)  => dispatch(set_rest_ticking_sound(enable)),
        // @ts-ignore
        resetDefault: () => dispatch(reset_settings()),
        saveOptions: (options:any) => {
            if (options.long_break_duration !== undefined) {
                dispatch(set_long_break(options.long_break_duration))
            }
            if (options.short_break_duration !== undefined) {
                dispatch(set_short_break(options.short_break_duration))
            }
            if (options.pomodoro_duration !== undefined) {
                dispatch(set_pomodoro_break(options.pomodoro_duration))
            }
            if (options.enableTickingSound !== undefined) {
                dispatch(set_ticking_sound(options.enableTickingSound))
            }
            if (options.enableRestTickingSound !== undefined) {
                dispatch(set_rest_ticking_sound(options.enableRestTickingSound))
            }
        }
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(Settings)

