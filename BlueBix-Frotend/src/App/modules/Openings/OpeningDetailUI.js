import React from "react";
import { Col, Row, Card, Typography, Divider, Button } from "antd";
import { NavLink } from "react-router-dom";
import {
  optionEmploymentType,
  optionsCountry,
  optionsCurrency,
  optionsexperienceLevel,
  optionsInterviewType,
  optionsPositionType,
  optionsSecurity_clearance,
  optionsVisaType,
} from "../../pages/constant/constant";

const { Text, Title } = Typography;

const OpeningDetailUi = ({ openingDetails, goBack }) => {
  const currency = optionsCurrency.find((item) => {
    return item.value === openingDetails.currency;
  });
  const country = optionsCountry.find((item) => {
    return parseInt(item.value) === parseInt(openingDetails.country);
  });
  const visa_type = optionsVisaType.find((item) => {
    return item.value === (openingDetails ? openingDetails.visa_type[0] : "");
  });
  const interview_type = optionsInterviewType.find((item) => {
    return item.value === (openingDetails ? openingDetails.interview_type : "");
  });
  const security_clearance = optionsSecurity_clearance.find((item) => {
    return (
      item.value === (openingDetails ? openingDetails.security_clearance : "")
    );
  });
  const position_type = optionsPositionType.find((item) => {
    return item.value === (openingDetails ? openingDetails.position_type : "");
  });
  const experience_level = optionsexperienceLevel.find((item) => {
    return (
      item.value === (openingDetails ? openingDetails.experience_level : "")
    );
  });
  const employment_type = optionEmploymentType.find((item) => {
    return (
      item.value === (openingDetails ? openingDetails.employment_type : "")
    );
  });

  const createMarkup = () => {
    return { __html: openingDetails.job_description };
  };

  return (
    <Card
      title={openingDetails.opening_title + " - #" + openingDetails.opening_id}
      bordered={false}
      extra={
        <NavLink
          to={
            {
              // pathname: "/company/job-openings",
            }
          }
        >
          <Button onClick={() => goBack()} type="Secondary">
            Back
          </Button>
        </NavLink>
      }
      className="px-0 py-0"
    >
      <Row gutter={24} className="mb-5">
        <Col span={12}>
          <Title level={5} className="mb-0">
            Account Name
          </Title>
          <Text type="secondary">
            {openingDetails && openingDetails.account_name.length > 0
              ? openingDetails.account_name[0].company_name
              : ""}
          </Text>
        </Col>
        <Col span={12}>
          <Title level={5} className="mb-0">
            Contact Name
          </Title>
          <Text type="secondary">
            {openingDetails
              ? openingDetails.contact_name.map((item, index) => {
                  return (
                    <Text key={index.toString()} type="secondary">
                      {item.display_name +
                        (openingDetails.contact_name.length === index + 1
                          ? ""
                          : ", ")}
                    </Text>
                  );
                })
              : ""}
          </Text>
        </Col>
      </Row>
      <Row gutter={24} className="mb-5">
        <Col span={12}>
          <Title level={5} className="mb-0">
            Account Owner
          </Title>
          <Text type="secondary">-</Text>
        </Col>
        <Col span={12}>
          <Title level={5} className="mb-0">
            Primary Recruiter
          </Title>
          <Text type="secondary">-</Text>
        </Col>
      </Row>
      <Row gutter={24} className="mb-5">
        <Col span={12}>
          <Title level={5} className="mb-0">
            Assigner More Recruiters
          </Title>
          <Text type="secondary">-</Text>
        </Col>
        <Col span={12}>
          <Title level={5} className="mb-0">
            Number of Openings
          </Title>
          <Text type="secondary">{openingDetails.number_of_openings}</Text>
        </Col>
      </Row>
      <Row gutter={24} className="mb-5">
        <Col span={12}>
          <Title level={5} className="mb-0">
            Location
          </Title>
          <Text type="secondary">
            {(openingDetails && openingDetails.city.length > 0
              ? openingDetails.city[0].city + ", "
              : "") +
              (openingDetails && openingDetails.state.length > 0
                ? openingDetails.state[0].state + ", "
                : "") +
              (openingDetails.country ? "United States" : "United States")}
          </Text>
        </Col>
        <Col span={12}>
          <Title level={5} className="mb-0">
            Zip Code
          </Title>
          <Text type="secondary">{openingDetails.zip_code}</Text>
        </Col>
      </Row>
      <Row gutter={24} className="mb-5">
        <Col span={12}>
          <Title level={5} className="mb-0">
            Skills Required
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
        <Col span={12}>
          <Title level={5} className="mb-0">
            Required Experience
          </Title>
          <Text type="secondary">
            {openingDetails.required_experience + " years"}
          </Text>
        </Col>
      </Row>
      <Row gutter={24} className="mb-5">
        <Col span={12}>
          <Title level={5} className="mb-0">
            Category
          </Title>
          <Text type="secondary">
            {openingDetails
              ? openingDetails.category.length > 0
                ? openingDetails.category[0].name
                : ""
              : ""}
          </Text>
        </Col>
        <Col span={12}>
          <Title level={5} className="mb-0">
            Employment Type
          </Title>
          <Text type="secondary">
            {openingDetails
              ? employment_type
                ? employment_type.label
                : openingDetails.employment_type
              : ""}
          </Text>
        </Col>
      </Row>
      <Row gutter={24} className="mb-5">
        <Col span={12}>
          <Title level={5} className="mb-0">
            Published Sites
          </Title>
          <Text type="secondary">-</Text>
        </Col>
        <Col span={12}>
          <Title level={5} className="mb-0">
            Bill Rate
          </Title>
          {currency === undefined ? (
            <Text type="secondary">""</Text>
          ) : (
            <>
              <Text type="secondary">
                {openingDetails.salary_range_from +
                  " - " +
                  openingDetails.salary_range_to +
                  " " +
                  (currency === undefined ? "" : currency.label) +
                  "/" +
                  openingDetails.salary_type}
              </Text>
            </>
          )}
        </Col>
      </Row>
      <Divider />
      <Row gutter={24} className="mb-5">
        <Col span={24}>
          <Title level={5} className="mb-0">
            Job Description
          </Title>
          <div dangerouslySetInnerHTML={createMarkup()} className="editor" />
        </Col>
      </Row>
      <Row gutter={24} className="mb-5">
        <Col span={12}>
          <Title level={5} className="mb-0">
            Local Indicator
          </Title>
          {openingDetails &&
            openingDetails.local_indicator &&
            openingDetails.local_indicator.map((item, index) => {
              return (
                <Text key={index.toString()} type="secondary">
                  {item + ", "}
                </Text>
              );
            })}
        </Col>
        <Col span={12}>
          <Title level={5} className="mb-0">
            SecurityClearance
          </Title>
          <Text type="secondary">
            {openingDetails && security_clearance
              ? security_clearance.label
              : ""}
          </Text>
        </Col>
      </Row>
      <Row gutter={24} className="mb-5">
        <Col span={12}>
          <Title level={5} className="mb-0">
            Visa Type
          </Title>
          {openingDetails
            ? openingDetails.visa_type.map((item, index) => {
                return (
                  <Text key={index.toString()} type="secondary">
                    {item.label + ", "}
                  </Text>
                );
              })
            : ""}
        </Col>
        <Col span={12}>
          <Title level={5} className="mb-0">
            Interview Type
          </Title>
          <Text type="secondary">
            {openingDetails && interview_type ? interview_type.label : ""}
          </Text>
        </Col>
      </Row>
    </Card>
  );
};

export default OpeningDetailUi;
