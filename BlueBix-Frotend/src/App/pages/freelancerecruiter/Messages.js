import React from "react";
import { Col, Row } from "antd";
import { Redirect, Route, Switch } from "react-router-dom";
import MessageQuickLinks from "./MessageQuickLinks";
import Inbox from "./messages/inbox";
import MailDetail from "./messages/mailDetail";
import MessagesComponent from "../../modules/messages/Messages";

function Messages() {
  return (
    <div>
      <Row gutter={24}>
        <Col span={6}>
          <MessageQuickLinks />
        </Col>
        <Col span={18}>
          <Switch>
            <Redirect
              from="/freelancerecruiter/messages"
              exact={true}
              to="/freelancerecruiter/messages/message"
            />
            <Route
              path="/freelancerecruiter/messages/Inbox"
              component={() => <Inbox />}
            />
            <Route
              path="/freelancerecruiter/messages/message"
              component={() => <MessagesComponent />}
            />
            <Route
              path={`/freelancerecruiter/messages/MailDetail`}
              component={() => <MailDetail />}
            />
          </Switch>
        </Col>
      </Row>
    </div>
  );
}

export default Messages;
