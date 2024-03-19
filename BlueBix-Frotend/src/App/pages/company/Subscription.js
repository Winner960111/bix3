import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Card,
  Popover,
  Divider,
  Typography,
  Badge,
  Button,
} from "antd";
import { SUBSCRIPTION_PLAN_LIST } from "../../../ApiUrl";
import {
  InfoCircleOutlined,
  PlusOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

const content = (
  <div style={{ width: "500px" }}>
    CV View / CV Download / Click to view phone no. = 1 CV Access, 1 Excel
    download / Export to Response manager = 2 CV Access.
    <Divider dashed />
    The Hot Vacancy will remain active on BlueBix for 30 days
  </div>
);

function Subscription() {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const users = useSelector(({ users }) => users);

  useEffect(() => {
    getCategoriesList();
  }, []);

  const getCategoriesList = () => {
    axios
      .post(
        SUBSCRIPTION_PLAN_LIST,
        {},
        {
          headers: { Authorization: users.token },
        }
      )
      .then((res) => {
        setSubscriptionPlans(res.data.data);
      })
      .catch((error) => {
      });
  };

  return (
    <div>
      <Row justify="center">{Plans(subscriptionPlans)}</Row>
    </div>
  );
}

const Plans = (subscriptionPlans) => {
  return subscriptionPlans.map((subscription) => {
    return (
      <Col span={6}>
        <Card>
          <div className="float-right">
            <Popover placement="right" content={content} title="CV Access">
              <InfoCircleOutlined style={{ color: "#B4B4B4" }} />
            </Popover>
          </div>
          <br />
          <div className="text-center">
            <Title className="mb-0" style={{ color: "#B4B4B4" }} level={5}>
              {subscription.plan_name}
            </Title>
            <Title
              className="mt-3 mb-0"
              style={{ fontWeight: "lighter", fontSize: "50px" }}
            >
              ${subscription.plan_price}
            </Title>
            <br />
            <PlusOutlined style={{ fontWeight: "bolder" }} />
            <br />
            <Title
              style={{ fontWeight: "bolder" }}
              level={5}
              className="text-danger mb-0 mt-5"
            >
              1 Hot Vacancy
            </Title>
            <Title style={{ fontWeight: "bolder" }} level={5} className="mt-0">
              <Row justify="center" align="center">
                Job Posting worth $25 <Badge count="FREE" className="ml-2" />
              </Row>
            </Title>
          </div>
          <Divider dashed />
          <Text>Resume Database Access</Text>
          <Text>
            <Row className="my-2">
              <CheckCircleTwoTone
                twoToneColor="#52c41a"
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: "3px",
                }}
              />
              {subscription.candidate_view_limit + " CV Access"}
            </Row>
          </Text>
          <Text>
            <Row className="my-2">
              <CheckCircleTwoTone
                twoToneColor="#52c41a"
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: "3px",
                }}
              />
              {subscription.email_limit + " Emails"}
            </Row>
          </Text>
          <Divider />
          <Button type="primary" block disabled={false}>
            Current Plan
          </Button>
        </Card>
      </Col>
    );
  });
};

export default Subscription;
