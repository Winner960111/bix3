import React from "react";
import { Row, Col, Card, Typography, Tooltip } from "antd";
import moment from "moment";
import { EditOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const ProfileOverviewUI = ({
  userProfileDetails,
  showSummary,
  showDetails,
  showProfile,
  desired_employment_type,
}) => {
  return (
    <>
      <Card
        title="Profile Summary"
        className="mb-6"
        extra={
          <Tooltip placement="top" title="Edit Your Profile Summary Details">
            <EditOutlined
              style={{ fontSize: "20px", color: "#372727" }}
              onClick={showSummary}
            />
          </Tooltip>
        }
      >
        <Row gutter={24} className="mb-5">
          <Col span={24}>
            <Title level={5} className="mb-0"></Title>
            <Text type="secondary">{userProfileDetails.profile_summary}</Text>
          </Col>
        </Row>
      </Card>
      <Card
        title="Personal Details"
        className="mb-6"
        extra={
          <Tooltip placement="top" title="Edit Your Personal Details">
            <EditOutlined
              style={{ fontSize: "20px", color: "#372727" }}
              onClick={showDetails}
            />
          </Tooltip>
        }
      >
        <Row gutter={24} className="mb-5">
          <Col span={12}>
            <Title level={5} className="mb-0">
              Date of Birth
            </Title>
            <Text type="secondary">
              {userProfileDetails.date_of_birth
                ? moment(userProfileDetails.date_of_birth).format("DD/MM/YYYY")
                : ""}
            </Text>
          </Col>
          <Col span={12}>
            <Title level={5} className="mb-0">
              Permanent Address
            </Title>
            <Text type="secondary">{userProfileDetails.permanent_address}</Text>
          </Col>
        </Row>
        <Row gutter={24} className="mb-5">
          <Col span={12}>
            <Title level={5} className="mb-0">
              Gender
            </Title>
            <Text type="secondary">{userProfileDetails.gender}</Text>
          </Col>
          <Col span={12}>
            <Title level={5} className="mb-0">
              Area Pin Code
            </Title>
            <Text type="secondary">{userProfileDetails.area_pin_code}</Text>
          </Col>
        </Row>
        <Row gutter={24} className="mb-5">
          <Col span={12}>
            <Title level={5} className="mb-0">
              Hometown
            </Title>
            <Text type="secondary">{userProfileDetails.home_town}</Text>
          </Col>
        </Row>
      </Card>
      <Card
        title="Career Profile"
        extra={
          <Tooltip placement="top" title="Edit Your Career Profile Details">            
            <EditOutlined
              style={{ fontSize: "20px", color: "#372727" }}
              onClick={showProfile}
            />
          </Tooltip>
        }
      >
        <Row gutter={24} className="mb-5">
          <Col span={12}>
            <Title level={5} className="mb-0">
              Job Category
            </Title>
            <Text type="secondary">
              {userProfileDetails && userProfileDetails.job_category.length > 0
                ? userProfileDetails.job_category[0].name
                : ""}
            </Text>
          </Col>
          <Col span={12}>
            <Title level={5} className="mb-0">
              Role
            </Title>
            <Text type="secondary">{userProfileDetails.role}</Text>
          </Col>
        </Row>
        <Row gutter={24} className="mb-5">
          <Col span={12}>
            <Title level={5} className="mb-0">
              Desired Job Type
            </Title>
            <Text type="secondary">{userProfileDetails.desired_job_type}</Text>
          </Col>
          <Col span={12}>
            <Title level={5} className="mb-0">
              Desired Employment Type
            </Title>
            <Text type="secondary">
              {desired_employment_type ? desired_employment_type.label : ""}
            </Text>
          </Col>
        </Row>
        <Row gutter={24} className="mb-5">
          <Col span={12}>
            <Title level={5} className="mb-0">
              Desired Shift
            </Title>
            <Text type="secondary">{userProfileDetails.desired_shift}</Text>
          </Col>
          <Col span={12}>
            <Title level={5} className="mb-0">
              desired Location
            </Title>
            <Text type="secondary">{userProfileDetails.desired_location}</Text>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default ProfileOverviewUI;
