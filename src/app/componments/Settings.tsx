import React from "react";
import {connect} from "react-redux";
import classnames from "classnames";
import {secondsToMinutes} from "../util";
import { FormattedMessage, injectIntl, type IntlShape } from "react-intl";
import {
    reset_settings, set_long_break, set_pomodoro_break, set_short_break,
    set_rest_ticking_sound, set_ticking_sound, set_language,
} from "./clock/ClockSlice";
import {Dispatch} from "redux";
import {RootState} from "./store";
import { settingsSyncActions } from "./settings/settingsSyncActions";
import "./settings/Settings.css";

/** Modal close character (×); same in all locales — keep out of JSX string literals for formatjs. */
const SETTINGS_MODAL_CLOSE_GLYPH = "\u00d7";

interface SettingsOptions {
    pomodoro_duration: number;
    short_break_duration: number;
    long_break_duration: number;
    enableTickingSound?: boolean;
    enableRestTickingSound?: boolean;
}

interface SettingsProps {
    pomodoro_duration: number,
    short_break_duration: number,
    long_break_duration: number,
    isOpenSettings: boolean,
    closeModal: () => void,
    enableTickingSound: boolean,
    enableRestTickingSound: boolean,
    setTickingSound: (enable: boolean) => void,
    setRestTickingSound: (enable: boolean) => void,
    saveOptions: (options: SettingsOptions) => void,
    language: string,
    setLanguage: (language: string) => void,
    intl: IntlShape,
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
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
    }

    handleTickingSound(event : React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const name = target.name;
        const checked = target.checked;

        switch (name) {
            case "sound":
                this.props.setTickingSound(checked);
                settingsSyncActions.updateTickingSound(checked);
                break;
            case "restSound":
                this.props.setRestTickingSound(checked);
                settingsSyncActions.updateRestTickingSound(checked);
                break;
            default:
                break;
        }
    }

    handleInputChange(event : React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        if (target !== null) {
            const name = target.name;
            const value = parseInt(target.value, 10);
            if (!Number.isNaN(value)) {
                switch (name) {
                    case "pomodoro":
                        this.setState({ pomodoro: value });
                        break;
                    case "short":
                        this.setState({ short: value });
                        break;
                    case "long":
                        this.setState({ long: value });
                        break;
                    default:
                        break;
                }
            }
        }
    }

    saveChanges() {
        const options = {
            pomodoro_duration: this.state.pomodoro * 60,
            short_break_duration: this.state.short * 60,
            long_break_duration: this.state.long * 60,
        };
        this.props.saveOptions(options);
        
        // Sync to the server
        settingsSyncActions.updatePomodoroDuration(options.pomodoro_duration);
        settingsSyncActions.updateShortBreakDuration(options.short_break_duration);
        settingsSyncActions.updateLongBreakDuration(options.long_break_duration);
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

    handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const newLanguage = event.target.value;
        this.props.setLanguage(newLanguage);
        settingsSyncActions.updateLanguage(newLanguage);
        
        // Dispatch a message to update the HTML content
        window.postMessage({
            type: 'LANGUAGE_CHANGED',
            language: newLanguage
        }, window.location.origin);
    }

    render() {
        const modalClass = classnames("fixed inset-0 z-50 flex items-center justify-center", {
            "hidden": !this.props.isOpenSettings,
        });
        return (
            <div>
                <div className={modalClass}>
                    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={this.props.closeModal}/>
                    <div className="settings-modal">
                        <header className="settings-header">
                            <h3 className="settings-title">
                                <FormattedMessage
                                    id="settings.title"
                                    defaultMessage="Settings"
                                />
                            </h3>
                            <button
                                data-testid="settings-close-button"
                                className="settings-close-btn"
                                aria-label={this.props.intl.formatMessage({
                                    id: "settings.aria.close",
                                    defaultMessage: "Close",
                                })}
                                onClick={this.props.closeModal}
                            >
                                {SETTINGS_MODAL_CLOSE_GLYPH}
                            </button>
                        </header>
                        <section className="settings-content">
                            <div className="settings-section">
                                <div className="settings-field">
                                    <label className="settings-label">
                                        <FormattedMessage
                                            id="settings.language"
                                            defaultMessage="Language"
                                        />
                                    </label>
                                    <div className="settings-select-wrapper">
                                        <select
                                            data-testid="settings-language-select"
                                            value={this.props.language}
                                            onChange={this.handleLanguageChange}
                                            className="settings-select"
                                        >
                                            <option value="en-US">
                                                {this.props.intl.formatMessage({
                                                    id: "settings.language.enUS",
                                                    defaultMessage: "English",
                                                })}
                                            </option>
                                            <option value="zh-CN">
                                                {this.props.intl.formatMessage({
                                                    id: "settings.language.zhCN",
                                                    defaultMessage: "中文",
                                                })}
                                            </option>
                                            <option value="de-DE">
                                                {this.props.intl.formatMessage({
                                                    id: "settings.language.deDE",
                                                    defaultMessage: "Deutsch",
                                                })}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="settings-checkboxes">
                                    <div className="settings-checkbox-group">
                                        <label className="settings-checkbox-label">
                                            <input
                                                name="sound"
                                                type="checkbox"
                                                checked={this.props.enableTickingSound}
                                                onChange={this.handleTickingSound}
                                                className="settings-checkbox"
                                                data-testid="settings-ticking-sound-checkbox"
                                            />
                                            <span className="settings-checkbox-text">
                                                <FormattedMessage
                                                    id="settings.enableTickingSound"
                                                    defaultMessage="enable ticking sound"
                                                />
                                            </span>
                                        </label>
                                    </div>

                                    <div className="settings-checkbox-group">
                                        <label className="settings-checkbox-label">
                                            <input
                                                name="restSound"
                                                type="checkbox"
                                                checked={this.props.enableRestTickingSound}
                                                onChange={this.handleTickingSound}
                                                className="settings-checkbox"
                                                data-testid="settings-rest-ticking-sound-checkbox"
                                            />
                                            <span className="settings-checkbox-text">
                                                <FormattedMessage
                                                    id="settings.enableRestTickingSound"
                                                    defaultMessage="enable ticking sound when resting"
                                                />
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="settings-field">
                                    <label className="settings-label">
                                        <FormattedMessage
                                            id="settings.field.pomodoro_duration"
                                            defaultMessage="Pomodoro duration"
                                        />
                                    </label>
                                    <input
                                        name="pomodoro"
                                        type="number"
                                        className="settings-input"
                                        placeholder="Pomodoro duration"
                                        value={this.state.pomodoro}
                                        onChange={this.handleInputChange}
                                        data-testid="settings-pomodoro-input"
                                    />
                                </div>
                                
                                <div className="settings-field">
                                    <label className="settings-label">
                                        <FormattedMessage
                                            id="settings.field.short_break_duration"
                                            defaultMessage="short break duration"
                                        />
                                    </label>
                                    <input
                                        className="settings-input"
                                        name="short"
                                        type="number"
                                        placeholder="Short break duration"
                                        value={this.state.short}
                                        onChange={this.handleInputChange}
                                        data-testid="settings-short-break-input"
                                    />
                                </div>
                                
                                <div className="settings-field">
                                    <label className="settings-label">
                                        <FormattedMessage
                                            id="settings.field.long_break_duration"
                                            defaultMessage="long break duration"
                                        />
                                    </label>
                                    <input
                                        className="settings-input"
                                        name="long"
                                        type="number"
                                        placeholder="Long break duration"
                                        value={this.state.long}
                                        onChange={this.handleInputChange}
                                        data-testid="settings-long-break-input"
                                    />
                                </div>
                            </div>
                        </section>
                        <footer className="settings-footer">
                            <button
                                className="settings-btn settings-btn-save"
                                onClick={this.handleSaveChanges}
                                data-testid="settings-save-button"
                            >
                                <FormattedMessage
                                    id="settings.button.save"
                                    defaultMessage="Save"
                                />
                            </button>
                            <button
                                className="settings-btn settings-btn-reset"
                                onClick={this.handleResetDefaults}
                                data-testid="settings-reset-button"
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
type RootProps = Record<string, never>
/*
 saveOptions={this.props.saveOptions}
 resetDefault={this.props.resetDefault}
 */
function mapStateToProps(state : RootState) {
    return {
        enableTickingSound: state.clock.ticking_sound_enabled,
        enableRestTickingSound: state.clock.rest_ticking_sound_enabled,
        pomodoro_duration: state.clock.pomodoro_duration,
        short_break_duration: state.clock.short_break_duration,
        long_break_duration: state.clock.long_break_duration,
        language: state.clock.language,
    }
}

function mapDispatchToProps(dispatch: Dispatch) {

    return {
        setTickingSound: (enable:boolean) => dispatch(set_ticking_sound(enable)),
        setRestTickingSound:  (enable:boolean)  => dispatch(set_rest_ticking_sound(enable)),
        resetDefault: () => dispatch(reset_settings()),
        saveOptions: (options: {
            long_break_duration?: number;
            short_break_duration?: number;
            pomodoro_duration?: number;
            enableTickingSound?: boolean;
            enableRestTickingSound?: boolean;
        }) => {
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
        },
        setLanguage: (language: string) => dispatch(set_language(language)),
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Settings))
