import React from 'react';

export class Footer extends React.Component {
    render() {
        return (
            <footer className=" footer bottom ">
                <div className="columns">
                    <div className="column"><span className="footer-item">copyright 2021</span></div>
                    <div className="column"><a href="https://www.douban.com/group/660950/" target="_blank"
                                               rel="noopener noreferrer">反馈&讨论</a></div>
                </div>
            </footer>
        )
    }
}
