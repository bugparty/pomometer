import React from "react";
import { Settings } from "./Settings";
import { FormattedMessage } from "react-intl";

export class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpenSettings: false };
    this.openSettings = this.openSettings.bind(this);
    this.closeSettingModal = this.closeSettingModal.bind(this);
  }

  openSettings() {
    this.setState({ isOpenSettings: true });
  }

  closeSettingModal() {
    this.setState({ isOpenSettings: false });
  }

  render() {
    return (
      <div>
        <nav className="navbar is-spaced has-shadow">
          <div className="navbar-item">
            <FormattedMessage
              id="navi.title"
              defaultMessage="AA Pomodoro Clock"
            />
          </div>
          <div className=" navbar-end">
            <div className="navbar-item " onClick={this.openSettings}>
              <FormattedMessage id="navi.settings" defaultMessage="Settings" />
            </div>
          </div>
        </nav>
        <Settings
          saveOptions={this.props.saveOptions}
          isOpenSettings={this.state.isOpenSettings}
          closeModal={this.closeSettingModal}
          enableTickingSound={this.props.enableTickingSound}
          enableRestTickingSound={this.props.enableRestTickingSound}
          setTickingSound={this.props.setTickingSound}
          setRestTickingSound={this.props.setRestTickingSound}
          pomodoro_duration={this.props.pomodoro_duration}
          short_break_duration={this.props.short_break_duration}
          long_break_duration={this.props.long_break_duration}
          resetDefault={this.props.resetDefault}
        />
      </div>
    );
  }
}
