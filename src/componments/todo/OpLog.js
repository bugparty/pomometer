import React from "react";
import { List, Typography } from "antd";
import {ClockCircleOutlined}from '@ant-design/icons';
class OpLog extends React.Component {
  render() {
    return (
      <List
        header={<div></div>}
        footer={<div></div>}
        bordered
        dataSource={this.props.opLogs}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text mark><ClockCircleOutlined /></Typography.Text> {item}
          </List.Item>
        )}
      />
    );
  }
}
export default OpLog;
