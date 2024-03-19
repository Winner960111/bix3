import React from "react";
import { Col, Row } from "antd";
import { Redirect, Route, Switch } from "react-router-dom";
import SmtpSettings from "./smtpSettings";
import MessageQuickLinks from "./MessageQuickLinks";
import Compose from "../messages/compose";
import Inbox from "../messages/inbox";
import Sent from "../messages/sent";
import Messages from "../messages/Messages";
import MailDetail from "../messages/mailDetail";
import EmailTempalte from "../messages/EmailTemplates";
import { useSelector } from "react-redux";

function MessagesComponent() {
  const users = useSelector(({ users }) => users);
  const role = users.role;  
  return (
    <div>
      <Row gutter={24}>
        <Col span={6}>
          <MessageQuickLinks />
        </Col>
        <Col span={18}>
          <Switch>
            <Redirect
              from={`/${role}/messages`}
              exact={true}
              to={`/${role}/messages/smtpSettings`}
            />
            <Route
              path={`/${role}/messages/smtpSettings`}
              component={() => <SmtpSettings />}
            />
            <Route
              path={`/${role}/messages/Compose`}
              component={() => <Compose />}
            />
            <Route
              path={`/${role}/messages/Inbox`}
              component={() => <Inbox />}
            />
            <Route path={`/${role}/messages/Sent`} component={() => <Sent />} />
            <Route
              path={`/${role}/messages/MailDetail`}
              component={() => <MailDetail />}
            />
            <Route
              path={`/${role}/messages/EmailTempalte`}
              component={() => <EmailTempalte />}
            />
            <Route
              path={`/${role}/messages/messages`}
              component={() => <Messages />}
            />
          </Switch>
        </Col>
      </Row>
    </div>
  );
}

export default MessagesComponent;
