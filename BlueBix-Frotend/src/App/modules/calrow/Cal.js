import React from "react";
import { Col } from "antd";

const COL = ({ children, cal }) => {
  // xs={24} sm={24} md={12} lg={12} xl={cal}
  return (
    <Col xs={24} xl={cal}>
      {children}
    </Col>
  );
};

export default COL;
