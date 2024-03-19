import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Card } from "antd";

function MessageQuickLinks() {
  const [targetOffset, setTargetOffset] = useState(undefined);

  useEffect(() => {
    setTargetOffset(window.innerHeight / 2);
  }, []);

  return (
    <Card bordered={false} title="Quick Links">
      <div className="navi navi-bold navi-hover navi-active navi-link-rounded">
        <div className="navi-item mb-2">
          <NavLink
            to="/company/messages/inbox"
            className="navi-link py-4 mb-2"
            activeClassName="active"
          >
            <span className="navi-text font-size-lg">Inbox</span>
          </NavLink>
        </div>
        <div className="navi-item mb-2">
          <NavLink
            to="/company/messages/message"
            className="navi-link py-4 mb-2"
            activeClassName="active"
          >
            <span className="navi-text font-size-lg">Messages</span>
          </NavLink>
        </div>
      </div>
    </Card>
  );
}

export default MessageQuickLinks;
