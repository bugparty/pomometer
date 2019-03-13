import React from 'react';
import classnames from 'classnames';
export class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.handleTickingSound = this.handleTickingSound.bind(this);
    }
    handleTickingSound(event) {
        debugger;
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
                            <section> <label className="checkbox">
                                <input type="checkbox" onChange={this.handleTickingSound} defaultChecked={this.props.enableTickingSound}/>
                                开启时钟声音
                            </label></section>
                        </section>
                        <footer className="modal-card-foot">

                        </footer>
                    </div>

                </div>
            </div>
        );
    }
}

Settings.propTypes = {};
