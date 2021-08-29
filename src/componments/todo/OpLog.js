import React from "react";
import { List, Typography } from "antd";

class OpLog extends React.Component {
  render() {
    return (
      <List
        header={<div>Header</div>}
        footer={<div>Footer</div>}
        bordered
        dataSource={this.props.opLogs}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text mark>[ITEM]</Typography.Text> {item}
          </List.Item>
        )}
      />
    );
  }
}
export default OpLog;
