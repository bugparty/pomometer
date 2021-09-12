import React from "react";
import {List, Typography} from "antd";
import {ClockCircleOutlined} from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroller'

class OpLog extends React.Component {
    handleInfiniteOnLoad = () => {
    };

    render() {
        return (
            <InfiniteScroll className={"oplog_list"}
                            pageStart={0}
                            hasMore={false}
                            loadMore={this.handleInfiniteOnLoad}
                            useWindow={false}>
                <List
                    header={<div></div>}
                    footer={<div></div>}
                    bordered
                    dataSource={this.props.opLogs}
                    renderItem={(item) => (
                        <List.Item>
                            <Typography.Text mark><ClockCircleOutlined/></Typography.Text> {item}
                        </List.Item>
                    )}
                />
            </InfiniteScroll>

        );
    }
}

export default OpLog;
