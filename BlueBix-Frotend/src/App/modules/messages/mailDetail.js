import React, { useState } from "react";
import { Button, Card, Col, Row, Typography } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import { useSelector } from "react-redux";

const { Text } = Typography;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function MailDetail(props) {
  const JSONDATA = [
    {
      subject: "Subject",
      desc:
        "Hello Ketul Patel, Reset Your Password Forgot Password Best Regards, Bluebix Customer Support",
    },
  ];

  const users = useSelector(({ users }) => users);
  let location = useLocation();
  const role = users.role;

  const index = `/${role}/messages/Inbox`;
  const sent = `/${role}/messages/Sent`;

  const path = location.state
    ? location.state.route === "inbox"
      ? index
      : sent
    : "";
  const singleItem = (item, index) => {
    const strong = index % 2 === 0 ? "strong" : "";
    return (
      <div>
        <div className="container">
          <Card title="" className="mb-6">
            <Row gutter={24}>
              <Col span={24} className={"p-3"}>
                {/*<ListItem>*/}
                {/*    <Text strong={strong} type="secondary" className={"mr-5"}>*/}
                {/*        {item.subject}*/}
                {/*    </Text>*/}
                {/*</ListItem>*/}
                <ListItem>
                  <div
                    className={"cursor-pointer"}
                  >
                    <Text strong={strong} type="secondary" className={"mr-5"}>
                      {"from : " + "abc@gmail.com"}
                    </Text>
                    <Text strong={strong} type="secondary" className={"mr-3"}>
                      {"28 Jul"}
                    </Text>
                  </div>
                </ListItem>
                <ListItem>
                  <Text type="secondary" className={"mr-3"}>
                    {item.desc}
                  </Text>
                </ListItem>
              </Col>
            </Row>
          </Card>
        </div>
        <Divider />
      </div>
    );
  };

  return (
    <div>
      <div className="container">
        <Card
          title={JSONDATA[0].subject}
          className="mb-6 p-0"
          bodyStyle={{ padding: 0 }}
          extra={
            <NavLink
              to={{
                pathname: path,
              }}
            >
              <Button onClick={() => {}} type="Secondary">
                Back
              </Button>
            </NavLink>
          }
        >
          <Row gutter={24}>
            <Col span={24}>{singleItem(JSONDATA[0], 0)}</Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
