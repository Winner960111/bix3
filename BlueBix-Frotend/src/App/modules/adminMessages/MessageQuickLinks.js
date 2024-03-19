import React from "react";
import { NavLink } from "react-router-dom";
import { Card } from "antd";
import { useSelector } from "react-redux";

function MessageQuickLinks() {
  const users = useSelector(({ users }) => users);
  const role = users.role;

  return (
    <Card bordered={false} title="Quick Links">
      <div className="navi navi-bold navi-hover navi-active navi-link-rounded">
        <div className="navi-item mb-2">
          <NavLink
            to={`/${role}/messages/smtpSettings`}
            className="navi-link py-4 mb-2"
            activeClassName="active"
          >
            <span className="navi-text font-size-lg">Settings</span>
          </NavLink>
          <NavLink
            to={`/${role}/messages/Compose`}
            className="navi-link py-4 mb-2"
            activeClassName="active"
          >
            <span className="navi-text font-size-lg">Compose</span>
          </NavLink>
          <NavLink
            to={`/${role}/messages/inbox`}
            className="navi-link py-4 mb-2"
            activeClassName="active"
          >
            <span className="navi-text font-size-lg">Inbox</span>
          </NavLink>
          <NavLink
            to={`/${role}/messages/sent`}
            className="navi-link py-4 mb-2"
            activeClassName="active"
          >
            <span className="navi-text font-size-lg">Sent</span>
          </NavLink>
          {role === "admin" ? (
            <NavLink
              to={`/${role}/messages/EmailTempalte`}
              className="navi-link py-4 mb-2"
              activeClassName="active"
            >
              <span className="navi-text font-size-lg">Email Tempalte</span>
            </NavLink>
          ) : null}
          {role !== "admin" ? (
            <NavLink
              to={`/${role}/messages/messages`}
              className="navi-link py-4 mb-2"
              activeClassName="active"
            >
              <span className="navi-text font-size-lg">Messages</span>
            </NavLink>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default MessageQuickLinks;
