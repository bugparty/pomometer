import React from "react";
import PropTypes, {ReactNodeLike} from "prop-types";
import { Button } from "antd";

const Link :React.FC<{active:boolean, onClick: ()=>void, children: ReactNodeLike}> = ({ active, children, onClick }) => {
  return (
    <Button onClick={onClick} disabled={active} style={{ marginLeft: "4px" }}>
      {children}
    </Button>
  );
};

Link.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Link;
