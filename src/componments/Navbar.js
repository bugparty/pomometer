import React from 'react';
import {Settings} from "./Settings";

export  class Navbar extends React.Component {
    constructor(props){
        super(props);
        this.state = {'isOpenSettings': false};
        this.openSettings = this.openSettings.bind(this);
        this.closeSettingModal = this.closeSettingModal.bind(this);
    }
    openSettings() {
        this.setState({'isOpenSettings': true})
    }
    closeSettingModal(){
        this.setState({'isOpenSettings': false})
    }
    render () {
        return (
            <div>
            <nav className="navbar is-spaced has-shadow">
                <div className="navbar-item">番茄钟</div>
                <div className=" navbar-end">
                    <div className="navbar-item " onClick={this.openSettings}>设置</div>
                </div>
            </nav>
                <Settings isOpenSettings={this.state.isOpenSettings} closeModal={this.closeSettingModal}
                enableTickingSound={this.props.enableTickingSound} setTickingSound={this.props.setTickingSound}/>
            </div>
        )
    }
}
