import React from "react";
import { Col, Row } from "antd";
import { Redirect, Route, Switch } from "react-router-dom";
import Inbox from "./messages/inbox";
import MessagesComponent from "../../modules/messages/Messages";
import MailDetail from "./messages/mailDetail";
import MessageQuickLinks from "./MessageQuickLinks";

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
              from="/company/messages"
              exact={true}
              to="/company/messages/message"
            />
            <Route path="/company/messages/Inbox" component={() => <Inbox />} />
            <Route
              path="/company/messages/message"
              component={() => <MessagesComponent />}
            />
            <Route
              path="/company/messages/MailDetail"
              component={() => <MailDetail />}
            />
          </Switch>
        </Col>
      </Row>
    </div>
  );
}

export default Messages;
