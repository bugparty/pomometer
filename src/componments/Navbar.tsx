import React from "react";
import  Settings  from "./Settings";
import { FormattedMessage } from "react-intl";
interface NavBarState{
  isOpenSettings: boolean
}
export class Navbar extends React.Component<any,NavBarState> {
  constructor(props : any) {
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
          isOpenSettings={this.state.isOpenSettings}
          closeModal={this.closeSettingModal}
        />
      </div>
    );
  }
}
