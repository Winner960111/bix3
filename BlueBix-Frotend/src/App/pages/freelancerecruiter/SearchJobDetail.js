import React, { useEffect, useState } from "react";
import { Col, Row, Card, Typography, Button } from "antd";
import moment from "moment";
import axios from "axios";
import { JOB_DETAIL } from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RoomIcon from "@material-ui/icons/Room";

const { Text, Title } = Typography;

export default function SearchJobDetail(props) {
  const [openingDetails, setOpeningDetails] = useState("");
  const users = useSelector(({ users }) => users);
  let location = useLocation();
  useEffect(() => {
    getOpeningDetail();
    return () => {};
  }, []);

  const getOpeningDetail = () => {
    axios
      .get(JOB_DETAIL + "/" + location.state.item._id, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setOpeningDetails(res.data.data[0]);
      })
      .catch((error) => {
      });
  };

  const onApplyJob = () => {};
  const onSaveJob = () => {};
  const createMarkup = () => {
    return { __html: openingDetails.job_description };
  };

  const given = moment(openingDetails.created_at, "YYYY-MM-DD");
  const current = moment().startOf("day");
  const datys = moment.duration(current.diff(given)).asDays();
  return (
    <div>
      <Row gutter={24}>
        <Col span={24}>
          <Card
            bordered={true}
            className="px-0 py-0 mb-5"
            bodyStyle={{ padding: 0 }}
          >
            <Row gutter={24} className="p-13">
              <Col span={24}>
                <div className={"cursor-pointer"}>
                  <Title level={3}>
                    {openingDetails ? openingDetails.opening_title : ""}
                  </Title>
                </div>
              </Col>
              <Col span={24}>
                <BusinessCenterIcon
                  style={{ fill: "#2381cd", marginRight: "5px" }}
                />
                <Text level={5} className="mb-0 ml-1">
                  {openingDetails
                    ? openingDetails.required_experience + " Yrs"
                    : ""}
                </Text>
                <AccountBalanceWalletIcon
                  style={{
                    fill: "#2381cd",
                    marginRight: "3px",
                    marginLeft: "5px",
                  }}
                />
                <Text level={5} className="mb-0 ml-1">
                  $ {openingDetails ? openingDetails.salary_range + "  " : ""}
                </Text>
                {openingDetails && openingDetails.city.length > 0 ? (
                  <RoomIcon
                    style={{
                      fill: "#2381cd",
                      marginRight: "3px",
                      marginLeft: "0px",
                    }}
                  />
                ) : null}
                <Text level={5} className="mb-0 ml-1">
                  {openingDetails && openingDetails.city.length > 0
                    ? openingDetails.city[0].city
                    : ""}
                </Text>
              </Col>
              <Col span={18} className="mt-5 ml-0">
                <Text strong level={5} className="mb-0 ml-0">
                  {datys > 0 ? datys + " DAY AGO" : " Today"}
                </Text>
              </Col>
              <Col span={6} className="align-text-center text-right">
                <Button type="default" htmlType="submit" onClick={onSaveJob}>
                  Saved
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={"ml-5"}
                  onClick={onApplyJob}
                >
                  Apply
                </Button>
              </Col>
            </Row>
          </Card>
          <Card
            title={"Job Description"}
            extra={
              <NavLink
                to={
                  {
                    // pathname: " ",
                  }
                }
              >
                <Button onClick={() => props.history.goBack()} type="Secondary">   
                  Back
                </Button>
              </NavLink>
            }
            bordered={false}
            className="px-0 py-0 mb-5"
          >
            <Row gutter={24} className="mb-5">
              <Col span={24}>
                <div
                  dangerouslySetInnerHTML={createMarkup()}
                  className="editor"
                ></div>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Key Skills
                </Title>
                {openingDetails
                  ? openingDetails.required_skills.map((item, index) => {
                      return (
                        <Text key={index.toString()} type="secondary">
                          {item + ", "}
                        </Text>
                      );
                    })
                  : ""}
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
