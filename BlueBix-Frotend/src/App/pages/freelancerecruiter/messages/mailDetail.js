import React from "react";

// eslint-disable-next-line no-unused-vars
import { Button, Card, Col, Row, Typography } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
import { optionsInterviewType } from "../../constant/constant";

const { Text, Title } = Typography;

export default function MailDetail(props) {
  const users = useSelector(({ users }) => users);
  let location = useLocation();
  const role = users.role;

  const index = `/${role}/messages/Inbox`;
  const singleItem = (item) => {
    const {
      status,
      date_of_interview,
      time_of_interview,
      interview_type,
      comment,
      duration,
      candidates,
      jobopenings,
    } = item;
    const interview = optionsInterviewType.find((item) => {
      return item.value === interview_type ? interview_type : "";
    });

    return (
      <Card
        title={status === "I" ? "Interview Schedule" : ""}
        className="mb-6 p-0"
        bodyStyle={{ padding: 0 }}
        extra={
          <NavLink
            to={{
              pathname: index,
            }}
          >            
            <Button onClick={() => { }} type="Secondary">   
              Back
            </Button>
          </NavLink>
        }
      >
        <Col span={24} className={"p-3"}>
          <Card title={"Interview Detail"}>
            <Row gutter={24} className="mb-3">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Interview Type
                </Title>
              </Col>
              <Col span={12}>
                <Text>
                  
                  {/* {job_opening_details.length > 0
                    ? job_opening_details[0].opening_title
                    : "-"} */}
                  {interview ? interview.label : "-"}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-3">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Date and Time
                </Title>
              </Col>
              <Col span={12}>
                <Text>
                  {moment(date_of_interview).format("DD-MM-YYYY") +
                    " " +
                    (time_of_interview === "0:00 AM"
                      ? "12:00 AM"
                      : time_of_interview)}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-3">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Duration
                </Title>
              </Col>
              <Col span={12}>
                <Text>                  
                  {duration
                    ? duration === 60
                      ? "1 hour"
                      : duration + " minutes"
                    : "-"}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-3">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Comment
                </Title>
              </Col>
              <Col span={12}>
                <Text> {comment ? comment : ""}</Text>
              </Col>
            </Row>
          </Card>
        </Col>
        <Row gutter={24} className="mb-3">
          <Col span={12} className={"p-3"}>
            <Card title={"Opening Detail"}>
              <Row gutter={24} className="mb-3">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Opening Id
                  </Title>
                </Col>
                <Col span={12}>
                  <Text>#{jobopenings ? jobopenings.opening_id : "-"}</Text>
                </Col>
              </Row>
              <Row gutter={24} className="mb-3">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Opening Title
                  </Title>
                </Col>
                <Col span={12}>
                  <Text>{jobopenings ? jobopenings.opening_title : "-"}</Text>
                </Col>
              </Row>
              <Row gutter={24} className="mb-3">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Short Description
                  </Title>
                </Col>
                <Col span={12}>
                  <Text>
                    {jobopenings ? jobopenings.short_description : "-"}
                  </Text>
                </Col>
              </Row>
              <Row gutter={24} className="mb-3">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Salary Range (Annualy)
                  </Title>
                </Col>
                <Col span={12}>
                  <Text>
                    $ {jobopenings ? jobopenings.salary_range : "0.00"}
                  </Text>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12} className={"p-3"}>
            <Card title={"Candidates Detail"}>
              <Row gutter={24} className="mb-3">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Candidate Name
                  </Title>
                </Col>
                <Col span={12}>
                  <Text>    
                    {candidates.first_name + " " + candidates.last_name}
                  </Text>
                </Col>
              </Row>
              <Row gutter={24} className="mb-3">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Email
                  </Title>
                </Col>
                <Col span={12}>
                  <Text>{candidates ? candidates.email : "-"}</Text>
                </Col>
              </Row>
              <Row gutter={24} className="mb-3">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Skills
                  </Title>
                </Col>
                <Col span={12}>
                  <Text>                    
                    {candidates && candidates.key_skills.length > 0
                      ? candidates.key_skills.map((item, index) => {
                        return (
                          <Text
                            key={index.toString()}
                            level={5}
                            className="mb-0 ml-5"
                          >
                            {item + ","}
                          </Text>
                        );
                      })
                      : "-"}
                  </Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
    );
  };

  const item = location.state ? location.state.item : {};

  return (
    <div>
      <div className="container">
        <Row gutter={24}>
          <Col span={24}>{singleItem(item)}</Col>
        </Row>
      </div>
    </div>
  );
}
